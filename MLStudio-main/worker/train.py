#!/usr/bin/env python3
import os
import sys
import json
import argparse
import numpy as np
from pathlib import Path
import tempfile
import io

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'


def log_event(event_type, **kwargs):
    event = {"type": event_type, **kwargs}
    print(json.dumps(event), flush=True)


def log_message(message, level='info'):
    log_event("log", message=message, level=level)


TF_AVAILABLE = False
try:
    import tensorflow as tf
    from tensorflow import keras
    from tensorflow.keras import layers, models, optimizers, callbacks
    from tensorflow.keras.applications.mobilenet_v2 import MobileNetV2, preprocess_input
    from tensorflow.keras.preprocessing.image import ImageDataGenerator
    from sklearn.preprocessing import LabelEncoder
    from sklearn.utils import class_weight
    from PIL import Image
    from pymongo import MongoClient
    TF_AVAILABLE = True
    log_message("TensorFlow and dependencies loaded successfully")
except ImportError as e:
    log_message(f"TensorFlow/dependencies not available: {str(e)}",
                level='error')
    log_message(
        "Install with: pip install tensorflow pymongo scikit-learn pillow",
        level='error')


class TrainingCallback(keras.callbacks.Callback):

    def __init__(self, total_epochs):
        super().__init__()
        self.total_epochs = total_epochs

    def on_epoch_begin(self, epoch, logs=None):
        log_message(f"Starting epoch {epoch + 1}/{self.total_epochs}")

    def on_epoch_end(self, epoch, logs=None):
        logs = logs or {}
        log_event("epoch_end",
                  epoch=epoch + 1,
                  total_epochs=self.total_epochs,
                  loss=float(logs.get('loss', 0)),
                  accuracy=float(logs.get('accuracy', 0)),
                  val_loss=float(logs.get('val_loss', 0)),
                  val_accuracy=float(logs.get('val_accuracy', 0)))

    def on_batch_end(self, batch, logs=None):
        if batch % 10 == 0:
            logs = logs or {}
            log_event("batch_end",
                      batch=batch,
                      loss=float(logs.get('loss', 0)),
                      accuracy=float(logs.get('accuracy', 0)))


def create_model(num_classes,
                 input_shape=(224, 224, 3),
                 enable_segmentation=False):
    if enable_segmentation:
        base_model = MobileNetV2(input_shape=input_shape,
                                 include_top=False,
                                 weights='imagenet')
        base_model.trainable = False

        x = base_model.output
        x = layers.Conv2DTranspose(256, (3, 3),
                                   strides=(2, 2),
                                   padding='same',
                                   activation='relu')(x)
        x = layers.Conv2DTranspose(128, (3, 3),
                                   strides=(2, 2),
                                   padding='same',
                                   activation='relu')(x)
        x = layers.Conv2DTranspose(64, (3, 3),
                                   strides=(2, 2),
                                   padding='same',
                                   activation='relu')(x)
        x = layers.Conv2DTranspose(32, (3, 3),
                                   strides=(2, 2),
                                   padding='same',
                                   activation='relu')(x)
        x = layers.Conv2DTranspose(num_classes, (3, 3),
                                   strides=(2, 2),
                                   padding='same',
                                   activation='softmax')(x)

        model = models.Model(base_model.input, x)
    else:
        base_model = MobileNetV2(input_shape=input_shape,
                                 include_top=False,
                                 weights='imagenet')
        base_model.trainable = False

        x = layers.GlobalAveragePooling2D()(base_model.output)
        x = layers.Dense(256, activation='relu')(x)
        x = layers.Dropout(0.4)(x)
        x = layers.Dense(128, activation='relu')(x)
        x = layers.Dropout(0.3)(x)
        out = layers.Dense(num_classes, activation='softmax')(x)

        model = models.Model(base_model.input, out)

    return model, base_model


def load_data_from_mongo(mongo_uri, image_size=(224, 224)):
    log_message("Connecting to MongoDB...")
    client = MongoClient(mongo_uri)
    db = client['Construction_test']
    collection = db['materialimages']

    docs = list(collection.find({}))
    log_message(f"Found {len(docs)} images in database")

    if len(docs) == 0:
        log_message("No images found in database", level='error')
        sys.exit(1)

    X = []
    y_labels = []

    for doc in docs:
        try:
            img_data = doc.get('data')
            if img_data is None:
                continue

            img = Image.open(io.BytesIO(img_data))
            img = img.convert('RGB')
            img = img.resize(image_size, Image.Resampling.LANCZOS)
            img_array = np.array(img)
            img_array = preprocess_input(img_array.astype(np.float32))

            X.append(img_array)
            y_labels.append(
                doc.get('material_key', doc.get('material_official',
                                                'unknown')))
        except Exception as e:
            log_message(
                f"Error processing image {doc.get('filename', 'unknown')}: {str(e)}",
                level='error')
            continue

    client.close()

    X = np.array(X)
    y_labels = np.array(y_labels)

    log_message(f"Loaded {len(X)} images successfully")
    return X, y_labels


def train_model(args):
    if not TF_AVAILABLE:
        log_message("TensorFlow not available. Cannot train.", level='error')
        sys.exit(1)

    log_message("Initializing training pipeline...")

    X, y_labels = load_data_from_mongo(args.mongo_uri)

    if len(X) < 10:
        log_message("Not enough samples for training (minimum 10 required)",
                    level='error')
        sys.exit(1)

    unique_classes = np.unique(y_labels)
    num_classes = len(unique_classes)

    if num_classes < 2:
        log_message("At least 2 classes are required for training",
                    level='error')
        sys.exit(1)

    log_message(f"Training with {num_classes} classes: {list(unique_classes)}")

    le = LabelEncoder()
    y = le.fit_transform(y_labels)
    y_cat = tf.keras.utils.to_categorical(y, num_classes)

    labels_map = {i: cls for i, cls in enumerate(le.classes_)}
    log_message(f"Label mapping: {labels_map}")

    cw = class_weight.compute_class_weight("balanced",
                                           classes=np.unique(y),
                                           y=y)
    class_weights = {i: float(w) for i, w in enumerate(cw)}
    log_message(f"Class weights: {class_weights}")

    datagen = ImageDataGenerator(rotation_range=25,
                                 width_shift_range=0.15,
                                 height_shift_range=0.15,
                                 shear_range=0.1,
                                 zoom_range=0.15,
                                 horizontal_flip=True,
                                 vertical_flip=False,
                                 fill_mode='nearest',
                                 validation_split=args.validation_split)

    train_gen = datagen.flow(X,
                             y_cat,
                             batch_size=args.batch_size,
                             subset='training',
                             shuffle=True)
    val_gen = datagen.flow(X,
                           y_cat,
                           batch_size=args.batch_size,
                           subset='validation',
                           shuffle=False)

    log_message(
        f"Training samples: {train_gen.n}, Validation samples: {val_gen.n}")

    enable_seg = args.enable_segmentation.lower() == 'true'
    log_message(f"Creating model (Segmentation: {enable_seg})...")

    model, base_model = create_model(num_classes,
                                     enable_segmentation=enable_seg)

    model.compile(optimizer=optimizers.Adam(learning_rate=args.learning_rate),
                  loss='categorical_crossentropy',
                  metrics=['accuracy'])

    log_message(f"Model compiled with {model.count_params():,} parameters")

    model_dir = Path(f"./data/models/{args.model_id}")
    model_dir.mkdir(parents=True, exist_ok=True)

    training_callbacks = [
        TrainingCallback(args.epochs),
        callbacks.EarlyStopping(monitor='val_accuracy',
                                patience=5,
                                restore_best_weights=True,
                                verbose=0),
        callbacks.ReduceLROnPlateau(monitor='val_loss',
                                    factor=0.5,
                                    patience=3,
                                    min_lr=1e-7,
                                    verbose=0),
        callbacks.ModelCheckpoint(str(model_dir / 'best_model.keras'),
                                  monitor='val_accuracy',
                                  save_best_only=True,
                                  verbose=0)
    ]

    log_message("Starting Phase 1: Training with frozen base...")

    history = model.fit(train_gen,
                        epochs=args.epochs,
                        validation_data=val_gen,
                        class_weight=class_weights,
                        callbacks=training_callbacks,
                        verbose=0)

    log_message(
        "Phase 1 complete. Starting Phase 2: Fine-tuning top layers...")

    base_model.trainable = True
    for layer in base_model.layers[:-30]:
        layer.trainable = False

    model.compile(optimizer=optimizers.Adam(learning_rate=args.learning_rate *
                                            0.1),
                  loss='categorical_crossentropy',
                  metrics=['accuracy'])

    fine_tune_epochs = min(5, args.epochs // 2)

    history_fine = model.fit(train_gen,
                             epochs=fine_tune_epochs,
                             validation_data=val_gen,
                             class_weight=class_weights,
                             callbacks=training_callbacks,
                             verbose=0)

    final_model_path = model_dir / 'model.keras'
    model.save(str(final_model_path))
    log_message(f"Model saved to {final_model_path}")

    labels_path = model_dir / 'labels.json'
    with open(labels_path, 'w') as f:
        json.dump(labels_map, f, indent=2)
    log_message(f"Labels saved to {labels_path}")

    val_predictions = model.predict(val_gen, verbose=0)
    val_pred_classes = np.argmax(val_predictions, axis=1)
    val_true_classes = val_gen.classes if hasattr(
        val_gen, 'classes') else np.argmax(np.concatenate(
            [val_gen[i][1] for i in range(len(val_gen))]),
                                           axis=1)

    from sklearn.metrics import confusion_matrix
    cm = confusion_matrix(val_true_classes[:len(val_pred_classes)],
                          val_pred_classes)
    log_event("confusion_matrix",
              matrix=cm.tolist(),
              classes=list(labels_map.values()))

    final_accuracy = history_fine.history['accuracy'][
        -1] if history_fine.history['accuracy'] else 0
    final_val_accuracy = history_fine.history['val_accuracy'][
        -1] if history_fine.history['val_accuracy'] else 0

    log_message(
        f"Training completed! Final accuracy: {final_accuracy:.4f}, Val accuracy: {final_val_accuracy:.4f}"
    )

    metadata = {
        'model_id':
        args.model_id,
        'classes':
        list(labels_map.values()),
        'num_classes':
        num_classes,
        'class_indices':
        labels_map,
        'input_shape': [224, 224, 3],
        'training_samples':
        train_gen.n,
        'validation_samples':
        val_gen.n,
        'final_accuracy':
        float(final_accuracy),
        'final_val_accuracy':
        float(final_val_accuracy),
        'epochs_trained':
        len(history.history['accuracy']) +
        len(history_fine.history['accuracy']),
        'segmentation_enabled':
        enable_seg
    }

    with open(model_dir / 'metadata.json', 'w') as f:
        json.dump(metadata, f, indent=2)

    log_message("All training artifacts saved successfully!")

    return history


def main():
    parser = argparse.ArgumentParser(
        description='Train construction material detection model')
    parser.add_argument('--model-id', required=True, help='Model ID')
    parser.add_argument('--mongo-uri',
                        required=True,
                        help='MongoDB connection URI')
    parser.add_argument('--epochs',
                        type=int,
                        default=10,
                        help='Number of epochs')
    parser.add_argument('--batch-size',
                        type=int,
                        default=16,
                        help='Batch size')
    parser.add_argument('--learning-rate',
                        type=float,
                        default=0.0001,
                        help='Learning rate')
    parser.add_argument('--validation-split',
                        type=float,
                        default=0.2,
                        help='Validation split')
    parser.add_argument('--enable-segmentation',
                        default='false',
                        help='Enable segmentation mode')

    args = parser.parse_args()

    try:
        train_model(args)
    except Exception as e:
        log_message(f"Training failed: {str(e)}", level='error')
        import traceback
        log_message(traceback.format_exc(), level='error')
        sys.exit(1)


if __name__ == '__main__':
    main()
