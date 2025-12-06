#!/usr/bin/env python3
import os
import sys
import json
import argparse
import numpy as np
from pathlib import Path
import tempfile
import io
import random

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
    from tensorflow.keras import layers, models, optimizers, callbacks, regularizers
    from tensorflow.keras.applications import EfficientNetB0, MobileNetV2
    from tensorflow.keras.applications.efficientnet import preprocess_input as efficientnet_preprocess
    from tensorflow.keras.applications.mobilenet_v2 import preprocess_input as mobilenet_preprocess
    from tensorflow.keras.preprocessing.image import ImageDataGenerator
    from sklearn.preprocessing import LabelEncoder
    from sklearn.utils import class_weight
    from sklearn.model_selection import train_test_split
    from PIL import Image, ImageEnhance, ImageFilter
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

    def __init__(self, total_epochs, phase_name="Training", phase_number=1, total_phases=3):
        super().__init__()
        self.total_epochs = total_epochs
        self.global_epoch = 0
        self.steps_per_epoch = None
        self.current_phase_epoch = 0
        self.phase_name = phase_name
        self.phase_number = phase_number
        self.total_phases = total_phases

    def set_phase(self, phase_name, phase_number):
        self.phase_name = phase_name
        self.phase_number = phase_number

    def on_epoch_begin(self, epoch, logs=None):
        self.current_phase_epoch = epoch
        log_event("phase_update",
                  phase_name=self.phase_name,
                  phase_number=self.phase_number,
                  total_phases=self.total_phases,
                  phase_epoch=epoch + 1)
        log_message(f"[{self.phase_name}] Starting epoch {epoch + 1}/{self.total_epochs}")

    def on_train_begin(self, logs=None):
        # try to discover steps per epoch (Keras provides in params)
        try:
            params = getattr(self, 'params', {})
            steps = params.get('steps') or params.get('samples')
            if steps and params.get('batch_size'):
                # if samples provided, compute steps
                if not params.get('steps') and params.get('samples'):
                    self.steps_per_epoch = max(1, int(params.get('samples') / params.get('batch_size')))
                else:
                    self.steps_per_epoch = params.get('steps')
        except Exception:
            self.steps_per_epoch = None

    def on_epoch_end(self, epoch, logs=None):
        logs = logs or {}
        # increment global epoch counter and emit global epoch index
        self.global_epoch += 1
        log_event("epoch_end",
                  epoch=self.global_epoch,
                  total_epochs=self.total_epochs,
                  loss=float(logs.get('loss', 0)),
                  accuracy=float(logs.get('accuracy', 0)),
                  val_loss=float(logs.get('val_loss', 0)),
                  val_accuracy=float(logs.get('val_accuracy', 0)))

    def on_batch_end(self, batch, logs=None):
        # Report progress every 5 batches for more granular updates
        if batch % 5 == 0:
            logs = logs or {}
            # Calculate overall progress percentage
            batch_progress = 0
            if self.steps_per_epoch and self.steps_per_epoch > 0:
                batch_progress = min(100, int((batch / self.steps_per_epoch) * 100))
            
            log_event("batch_end",
                      batch=int(batch),
                      steps_per_epoch=int(self.steps_per_epoch) if self.steps_per_epoch else None,
                      epoch=(self.global_epoch + 1),
                      total_epochs=self.total_epochs,
                      batch_progress=batch_progress,
                      loss=float(logs.get('loss', 0)),
                      accuracy=float(logs.get('accuracy', 0)))


def advanced_augment_image(img_array):
    """Apply advanced augmentation to a single image"""
    img = Image.fromarray((img_array * 127.5 + 127.5).astype(np.uint8))
    
    if random.random() > 0.5:
        enhancer = ImageEnhance.Brightness(img)
        img = enhancer.enhance(random.uniform(0.7, 1.3))
    
    if random.random() > 0.5:
        enhancer = ImageEnhance.Contrast(img)
        img = enhancer.enhance(random.uniform(0.7, 1.3))
    
    if random.random() > 0.5:
        enhancer = ImageEnhance.Color(img)
        img = enhancer.enhance(random.uniform(0.8, 1.2))
    
    if random.random() > 0.7:
        img = img.filter(ImageFilter.GaussianBlur(radius=random.uniform(0.5, 1.5)))
    
    if random.random() > 0.8:
        enhancer = ImageEnhance.Sharpness(img)
        img = enhancer.enhance(random.uniform(0.8, 2.0))
    
    img_array = np.array(img).astype(np.float32)
    img_array = (img_array - 127.5) / 127.5
    
    return img_array


def create_improved_model(num_classes, input_shape=(224, 224, 3), use_efficientnet=True):
    """Create an improved model with better regularization"""
    
    if use_efficientnet:
        base_model = EfficientNetB0(
            input_shape=input_shape,
            include_top=False,
            weights='imagenet'
        )
        preprocess_fn = efficientnet_preprocess
    else:
        base_model = MobileNetV2(
            input_shape=input_shape,
            include_top=False,
            weights='imagenet'
        )
        preprocess_fn = mobilenet_preprocess
    
    base_model.trainable = False
    
    inputs = keras.Input(shape=input_shape)
    
    x = base_model(inputs, training=False)
    
    x = layers.GlobalAveragePooling2D()(x)
    
    x = layers.BatchNormalization()(x)
    x = layers.Dense(512, kernel_regularizer=regularizers.l2(0.01))(x)
    x = layers.Activation('relu')(x)
    x = layers.Dropout(0.5)(x)
    
    x = layers.BatchNormalization()(x)
    x = layers.Dense(256, kernel_regularizer=regularizers.l2(0.01))(x)
    x = layers.Activation('relu')(x)
    x = layers.Dropout(0.4)(x)
    
    x = layers.BatchNormalization()(x)
    x = layers.Dense(128, kernel_regularizer=regularizers.l2(0.01))(x)
    x = layers.Activation('relu')(x)
    x = layers.Dropout(0.3)(x)
    
    outputs = layers.Dense(num_classes, activation='softmax', 
                          kernel_regularizer=regularizers.l2(0.01))(x)
    
    model = keras.Model(inputs, outputs)
    
    return model, base_model, preprocess_fn


def create_segmentation_model(num_classes, input_shape=(224, 224, 3)):
    """Create segmentation model with improved architecture"""
    base_model = MobileNetV2(input_shape=input_shape,
                             include_top=False,
                             weights='imagenet')
    base_model.trainable = False

    x = base_model.output
    x = layers.Conv2DTranspose(256, (3, 3), strides=(2, 2), padding='same')(x)
    x = layers.BatchNormalization()(x)
    x = layers.Activation('relu')(x)
    x = layers.Dropout(0.3)(x)
    
    x = layers.Conv2DTranspose(128, (3, 3), strides=(2, 2), padding='same')(x)
    x = layers.BatchNormalization()(x)
    x = layers.Activation('relu')(x)
    x = layers.Dropout(0.3)(x)
    
    x = layers.Conv2DTranspose(64, (3, 3), strides=(2, 2), padding='same')(x)
    x = layers.BatchNormalization()(x)
    x = layers.Activation('relu')(x)
    
    x = layers.Conv2DTranspose(32, (3, 3), strides=(2, 2), padding='same')(x)
    x = layers.BatchNormalization()(x)
    x = layers.Activation('relu')(x)
    
    x = layers.Conv2DTranspose(num_classes, (3, 3), strides=(2, 2), 
                               padding='same', activation='softmax')(x)

    model = keras.Model(base_model.input, x)
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
    filenames = []

    for doc in docs:
        try:
            img_data = doc.get('data')
            if img_data is None:
                continue

            img = Image.open(io.BytesIO(img_data))
            img = img.convert('RGB')
            img = img.resize(image_size, Image.Resampling.LANCZOS)
            img_array = np.array(img).astype(np.float32)
            img_array = (img_array - 127.5) / 127.5

            X.append(img_array)
            label = doc.get('material_key', doc.get('material_official', 'unknown'))
            y_labels.append(label)
            filenames.append(doc.get('filename', 'unknown'))
        except Exception as e:
            log_message(
                f"Error processing image {doc.get('filename', 'unknown')}: {str(e)}",
                level='error')
            continue

    client.close()

    X = np.array(X)
    y_labels = np.array(y_labels)

    log_message(f"Loaded {len(X)} images successfully")
    
    unique, counts = np.unique(y_labels, return_counts=True)
    for label, count in zip(unique, counts):
        log_message(f"  Class '{label}': {count} samples")
    
    return X, y_labels, filenames


def mixup_data(X, y, alpha=0.2):
    """Apply mixup augmentation to training data"""
    if alpha > 0:
        lam = np.random.beta(alpha, alpha)
    else:
        lam = 1
    
    batch_size = len(X)
    index = np.random.permutation(batch_size)
    
    mixed_X = lam * X + (1 - lam) * X[index]
    mixed_y = lam * y + (1 - lam) * y[index]
    
    return mixed_X, mixed_y


def augment_dataset(X, y, augmentation_factor=3):
    """Augment the dataset by creating additional samples with enhanced techniques"""
    log_message(f"Augmenting dataset by factor of {augmentation_factor}...")
    
    X_augmented = [X]
    y_augmented = [y]
    
    # Enhanced data augmentation parameters
    datagen = ImageDataGenerator(
        rotation_range=45,
        width_shift_range=0.3,
        height_shift_range=0.3,
        shear_range=0.25,
        zoom_range=0.3,
        horizontal_flip=True,
        vertical_flip=False,
        brightness_range=[0.6, 1.4],
        channel_shift_range=30,
        fill_mode='nearest'
    )
    
    for i in range(augmentation_factor - 1):
        X_aug = np.zeros_like(X)
        for j in range(len(X)):
            img = X[j:j+1]
            img_normalized = (img + 1) * 127.5
            augmented = datagen.random_transform(img_normalized[0])
            # Apply additional PIL augmentation for some samples
            if random.random() > 0.5:
                augmented = np.clip(augmented, 0, 255)
                pil_img = Image.fromarray(augmented.astype(np.uint8))
                # Random color jitter
                if random.random() > 0.5:
                    enhancer = ImageEnhance.Color(pil_img)
                    pil_img = enhancer.enhance(random.uniform(0.8, 1.2))
                # Random sharpness
                if random.random() > 0.7:
                    enhancer = ImageEnhance.Sharpness(pil_img)
                    pil_img = enhancer.enhance(random.uniform(0.8, 1.5))
                augmented = np.array(pil_img).astype(np.float32)
            X_aug[j] = (augmented - 127.5) / 127.5
        X_augmented.append(X_aug)
        y_augmented.append(y)
    
    X_final = np.concatenate(X_augmented, axis=0)
    y_final = np.concatenate(y_augmented, axis=0)
    
    indices = np.random.permutation(len(X_final))
    X_final = X_final[indices]
    y_final = y_final[indices]
    
    log_message(f"Augmented dataset size: {len(X_final)} samples")
    return X_final, y_final


def train_model(args):
    if not TF_AVAILABLE:
        log_message("TensorFlow not available. Cannot train.", level='error')
        sys.exit(1)

    log_message("Initializing improved training pipeline...")
    log_message(f"Configuration: epochs={args.epochs}, batch_size={args.batch_size}, lr={args.learning_rate}")

    X, y_labels, filenames = load_data_from_mongo(args.mongo_uri)

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
    
    labels_map = {i: cls for i, cls in enumerate(le.classes_)}
    log_message(f"Label mapping: {labels_map}")

    X_train, X_val, y_train, y_val = train_test_split(
        X, y, test_size=args.validation_split, stratify=y, random_state=42
    )
    
    log_message(f"Train set: {len(X_train)} samples, Validation set: {len(X_val)} samples")

    augmentation_factor = max(3, 500 // len(X_train))
    augmentation_factor = min(augmentation_factor, 5)
    X_train_aug, y_train_aug = augment_dataset(X_train, y_train, augmentation_factor)
    
    y_train_cat = tf.keras.utils.to_categorical(y_train_aug, num_classes)
    y_val_cat = tf.keras.utils.to_categorical(y_val, num_classes)

    cw = class_weight.compute_class_weight("balanced",
                                           classes=np.unique(y_train_aug),
                                           y=y_train_aug)
    class_weights = {i: float(w) for i, w in enumerate(cw)}
    log_message(f"Class weights: {class_weights}")

    enable_seg = args.enable_segmentation.lower() == 'true'
    log_message(f"Creating improved model (Segmentation: {enable_seg})...")
    
    if enable_seg:
        model, base_model = create_segmentation_model(num_classes)
        preprocess_fn = mobilenet_preprocess
    else:
        model, base_model, preprocess_fn = create_improved_model(num_classes, use_efficientnet=True)

    # Use label smoothing for better generalization
    label_smoothing = 0.1
    model.compile(
        optimizer=optimizers.Adam(learning_rate=args.learning_rate),
        loss=tf.keras.losses.CategoricalCrossentropy(label_smoothing=label_smoothing),
        metrics=['accuracy']
    )
    log_message(f"Using label smoothing: {label_smoothing}")

    log_message(f"Model compiled with {model.count_params():,} parameters")

    model_dir = Path(f"./data/models/{args.model_id}")
    model_dir.mkdir(parents=True, exist_ok=True)

    total_epochs = args.epochs + max(10, args.epochs // 2)
    
    # Create training callback with phase tracking
    training_progress_callback = TrainingCallback(
        total_epochs, 
        phase_name="Feature Extraction", 
        phase_number=1, 
        total_phases=3
    )
    
    training_callbacks = [
        training_progress_callback,
        callbacks.EarlyStopping(
            monitor='val_accuracy',
            patience=8,
            restore_best_weights=True,
            verbose=1,
            min_delta=0.001
        ),
        callbacks.ReduceLROnPlateau(
            monitor='val_loss',
            factor=0.3,
            patience=4,
            min_lr=1e-8,
            verbose=1
        ),
        callbacks.ModelCheckpoint(
            str(model_dir / 'best_model.keras'),
            monitor='val_accuracy',
            save_best_only=True,
            verbose=1
        )
    ]

    log_message("=" * 50)
    log_message("PHASE 1: Training classification head with frozen base")
    log_message("=" * 50)

    history1 = model.fit(
        X_train_aug, y_train_cat,
        epochs=args.epochs,
        batch_size=args.batch_size,
        validation_data=(X_val, y_val_cat),
        class_weight=class_weights,
        callbacks=training_callbacks,
        verbose=1
    )

    best_val_acc_phase1 = max(history1.history.get('val_accuracy', [0]))
    log_message(f"Phase 1 complete. Best val accuracy: {best_val_acc_phase1:.4f}")

    log_message("=" * 50)
    log_message("PHASE 2: Fine-tuning top layers of base model")
    log_message("=" * 50)
    
    # Update phase tracking
    training_progress_callback.set_phase("Fine-tuning", 2)

    base_model.trainable = True
    
    if hasattr(base_model, 'layers'):
        num_layers = len(base_model.layers)
        freeze_until = int(num_layers * 0.7)
        for layer in base_model.layers[:freeze_until]:
            layer.trainable = False
        log_message(f"Unfroze {num_layers - freeze_until} of {num_layers} layers")

    model.compile(
        optimizer=optimizers.Adam(learning_rate=args.learning_rate * 0.1),
        loss=tf.keras.losses.CategoricalCrossentropy(label_smoothing=label_smoothing),
        metrics=['accuracy']
    )

    fine_tune_epochs = max(10, args.epochs // 2)
    
    history2 = model.fit(
        X_train_aug, y_train_cat,
        epochs=fine_tune_epochs,
        batch_size=args.batch_size,
        validation_data=(X_val, y_val_cat),
        class_weight=class_weights,
        callbacks=training_callbacks,
        verbose=1
    )

    best_val_acc_phase2 = max(history2.history.get('val_accuracy', [0]))
    log_message(f"Phase 2 complete. Best val accuracy: {best_val_acc_phase2:.4f}")

    log_message("=" * 50)
    log_message("PHASE 3: Fine-tuning with even lower learning rate")
    log_message("=" * 50)
    
    # Update phase tracking
    training_progress_callback.set_phase("Deep Fine-tuning", 3)

    if hasattr(base_model, 'layers'):
        freeze_until = int(num_layers * 0.5)
        for layer in base_model.layers[:freeze_until]:
            layer.trainable = False
        for layer in base_model.layers[freeze_until:]:
            layer.trainable = True
        log_message(f"Unfroze more layers: {num_layers - freeze_until} of {num_layers}")

    model.compile(
        optimizer=optimizers.Adam(learning_rate=args.learning_rate * 0.01),
        loss=tf.keras.losses.CategoricalCrossentropy(label_smoothing=label_smoothing),
        metrics=['accuracy']
    )

    history3 = model.fit(
        X_train_aug, y_train_cat,
        epochs=fine_tune_epochs // 2,
        batch_size=args.batch_size,
        validation_data=(X_val, y_val_cat),
        class_weight=class_weights,
        callbacks=training_callbacks,
        verbose=1
    )

    final_model_path = model_dir / 'model.keras'
    model.save(str(final_model_path))
    log_message(f"Model saved to {final_model_path}")

    labels_path = model_dir / 'labels.json'
    with open(labels_path, 'w') as f:
        json.dump(labels_map, f, indent=2)
    log_message(f"Labels saved to {labels_path}")

    log_message("Evaluating model on validation set...")
    val_loss, val_accuracy = model.evaluate(X_val, y_val_cat, verbose=0)
    log_message(f"Final validation accuracy: {val_accuracy:.4f}")

    val_predictions = model.predict(X_val, verbose=0)
    val_pred_classes = np.argmax(val_predictions, axis=1)

    from sklearn.metrics import confusion_matrix, classification_report, precision_score, recall_score, f1_score
    
    cm = confusion_matrix(y_val, val_pred_classes)
    log_event("confusion_matrix",
              matrix=cm.tolist(),
              classes=list(labels_map.values()))
    
    report = classification_report(y_val, val_pred_classes, target_names=list(labels_map.values()))
    log_message(f"Classification Report:\n{report}")

    precision = precision_score(y_val, val_pred_classes, average='weighted', zero_division=0)
    recall = recall_score(y_val, val_pred_classes, average='weighted', zero_division=0)
    f1 = f1_score(y_val, val_pred_classes, average='weighted', zero_division=0)

    all_val_accuracies = (
        history1.history.get('val_accuracy', []) + 
        history2.history.get('val_accuracy', []) + 
        history3.history.get('val_accuracy', [])
    )
    best_val_accuracy = max(all_val_accuracies) if all_val_accuracies else val_accuracy
    
    all_accuracies = (
        history1.history.get('accuracy', []) + 
        history2.history.get('accuracy', []) + 
        history3.history.get('accuracy', [])
    )
    final_accuracy = all_accuracies[-1] if all_accuracies else 0

    log_message(f"=" * 50)
    log_message(f"TRAINING COMPLETE!")
    log_message(f"Final Training Accuracy: {final_accuracy:.4f}")
    log_message(f"Best Validation Accuracy: {best_val_accuracy:.4f}")
    log_message(f"Precision: {precision:.4f}")
    log_message(f"Recall: {recall:.4f}")
    log_message(f"F1 Score: {f1:.4f}")
    log_message(f"=" * 50)

    total_epochs_trained = (
        len(history1.history.get('accuracy', [])) +
        len(history2.history.get('accuracy', [])) +
        len(history3.history.get('accuracy', []))
    )

    metadata = {
        'model_id': args.model_id,
        'classes': list(labels_map.values()),
        'num_classes': num_classes,
        'class_indices': labels_map,
        'input_shape': [224, 224, 3],
        'training_samples': len(X_train_aug),
        'original_samples': len(X),
        'validation_samples': len(X_val),
        'augmentation_factor': augmentation_factor,
        'final_accuracy': float(final_accuracy),
        'final_val_accuracy': float(best_val_accuracy),
        'precision': float(precision),
        'recall': float(recall),
        'f1_score': float(f1),
        'epochs_trained': total_epochs_trained,
        'segmentation_enabled': enable_seg,
        'model_architecture': 'EfficientNetB0' if not enable_seg else 'MobileNetV2-Segmentation',
        'training_config': {
            'batch_size': args.batch_size,
            'initial_learning_rate': args.learning_rate,
            'validation_split': args.validation_split
        }
    }

    with open(model_dir / 'metadata.json', 'w') as f:
        json.dump(metadata, f, indent=2)

    log_message("All training artifacts saved successfully!")

    if best_val_accuracy < 0.5:
        log_message("WARNING: Model accuracy is below 50%. Consider adding more training data.", level='warning')
    elif best_val_accuracy < 0.7:
        log_message("Model accuracy is moderate. Adding more diverse training data may help.", level='info')
    elif best_val_accuracy < 0.85:
        log_message("Model accuracy is good! Fine-tuning with more epochs may improve results.", level='info')
    else:
        log_message("Excellent model accuracy achieved!", level='info')

    return {
        'history1': history1,
        'history2': history2,
        'history3': history3,
        'val_accuracy': best_val_accuracy
    }


def main():
    parser = argparse.ArgumentParser(
        description='Train construction material detection model with improved architecture')
    parser.add_argument('--model-id', required=True, help='Model ID')
    parser.add_argument('--mongo-uri',
                        required=True,
                        help='MongoDB connection URI')
    parser.add_argument('--epochs',
                        type=int,
                        default=15,
                        help='Number of epochs for initial training')
    parser.add_argument('--batch-size',
                        type=int,
                        default=16,
                        help='Batch size')
    parser.add_argument('--learning-rate',
                        type=float,
                        default=0.001,
                        help='Initial learning rate')
    parser.add_argument('--validation-split',
                        type=float,
                        default=0.2,
                        help='Validation split')
    parser.add_argument('--enable-segmentation',
                        default='false',
                        help='Enable segmentation mode')

    args = parser.parse_args()

    try:
        result = train_model(args)
        log_message(f"Training completed with best validation accuracy: {result['val_accuracy']:.4f}")
    except Exception as e:
        log_message(f"Training failed: {str(e)}", level='error')
        import traceback
        log_message(traceback.format_exc(), level='error')
        sys.exit(1)


if __name__ == '__main__':
    main()
