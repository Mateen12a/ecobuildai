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
    from tensorflow.keras.applications import EfficientNetB0, MobileNetV2, EfficientNetB2
    from tensorflow.keras.applications.efficientnet import preprocess_input as efficientnet_preprocess
    from tensorflow.keras.applications.mobilenet_v2 import preprocess_input as mobilenet_preprocess
    from sklearn.preprocessing import LabelEncoder
    from sklearn.utils import class_weight
    from sklearn.model_selection import train_test_split
    from PIL import Image, ImageEnhance, ImageFilter, ImageOps
    from pymongo import MongoClient
    
    tf.get_logger().setLevel('ERROR')
    
    gpus = tf.config.experimental.list_physical_devices('GPU')
    if gpus:
        for gpu in gpus:
            tf.config.experimental.set_memory_growth(gpu, True)
        log_message(f"Found {len(gpus)} GPU(s) available")
    else:
        log_message("No GPU found, using CPU (training will be slower)")
    
    try:
        tf.keras.mixed_precision.set_global_policy('mixed_float16')
        log_message("Using mixed precision training for faster performance")
    except Exception as e:
        log_message(f"Mixed precision not available: {e}", level='warning')
    
    TF_AVAILABLE = True
    log_message("TensorFlow and dependencies loaded successfully")
except ImportError as e:
    log_message(f"TensorFlow/dependencies not available: {str(e)}", level='error')
    log_message("Install with: pip install tensorflow pymongo scikit-learn pillow", level='error')


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
        try:
            params = getattr(self, 'params', {})
            steps = params.get('steps') or params.get('samples')
            if steps and params.get('batch_size'):
                if not params.get('steps') and params.get('samples'):
                    self.steps_per_epoch = max(1, int(params.get('samples') / params.get('batch_size')))
                else:
                    self.steps_per_epoch = params.get('steps')
        except Exception:
            self.steps_per_epoch = None

    def on_epoch_end(self, epoch, logs=None):
        logs = logs or {}
        self.global_epoch += 1
        log_event("epoch_end",
                  epoch=self.global_epoch,
                  total_epochs=self.total_epochs,
                  loss=float(logs.get('loss', 0)),
                  accuracy=float(logs.get('accuracy', 0)),
                  val_loss=float(logs.get('val_loss', 0)),
                  val_accuracy=float(logs.get('val_accuracy', 0)))

    def on_batch_end(self, batch, logs=None):
        if batch % 5 == 0:
            logs = logs or {}
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


def create_augmentation_layer():
    return keras.Sequential([
        layers.RandomFlip("horizontal"),
        layers.RandomRotation(0.15),
        layers.RandomZoom(0.15),
        layers.RandomContrast(0.15),
        layers.RandomBrightness(0.1),
        layers.RandomTranslation(0.1, 0.1),
    ], name="augmentation")


def advanced_augment_image(img_array, augmentation_strength=1.0):
    img = Image.fromarray((img_array * 127.5 + 127.5).astype(np.uint8))
    
    if random.random() > 0.4:
        factor = random.uniform(0.6, 1.4) * augmentation_strength
        enhancer = ImageEnhance.Brightness(img)
        img = enhancer.enhance(max(0.3, min(2.0, factor)))
    
    if random.random() > 0.4:
        factor = random.uniform(0.6, 1.4) * augmentation_strength
        enhancer = ImageEnhance.Contrast(img)
        img = enhancer.enhance(max(0.3, min(2.0, factor)))
    
    if random.random() > 0.5:
        factor = random.uniform(0.7, 1.3)
        enhancer = ImageEnhance.Color(img)
        img = enhancer.enhance(factor)
    
    if random.random() > 0.5:
        factor = random.uniform(0.8, 1.5)
        enhancer = ImageEnhance.Sharpness(img)
        img = enhancer.enhance(factor)
    
    if random.random() > 0.8:
        img = img.filter(ImageFilter.GaussianBlur(radius=random.uniform(0.3, 1.0)))
    
    if random.random() > 0.9:
        img = ImageOps.posterize(img, random.randint(4, 7))
    
    if random.random() > 0.85:
        img = ImageOps.solarize(img, random.randint(128, 200))
    
    if random.random() > 0.7:
        angle = random.uniform(-20, 20)
        img = img.rotate(angle, fillcolor=(128, 128, 128))
    
    img_array = np.array(img).astype(np.float32)
    img_array = (img_array - 127.5) / 127.5
    
    return img_array


def create_improved_model(num_classes, input_shape=(224, 224, 3), model_size='small'):
    if model_size == 'large' and num_classes > 5:
        base_model = EfficientNetB2(
            input_shape=input_shape,
            include_top=False,
            weights='imagenet'
        )
        log_message("Using EfficientNetB2 for larger dataset")
    else:
        base_model = EfficientNetB0(
            input_shape=input_shape,
            include_top=False,
            weights='imagenet'
        )
        log_message("Using EfficientNetB0 base model")
    
    base_model.trainable = False
    
    inputs = keras.Input(shape=input_shape)
    
    x = keras.layers.Rescaling(1./127.5, offset=-1)(inputs)
    
    x = base_model(x, training=False)
    
    x = layers.GlobalAveragePooling2D()(x)
    
    x = layers.BatchNormalization()(x)
    x = layers.Dense(512, kernel_regularizer=regularizers.l2(0.001))(x)
    x = layers.Activation('swish')(x)
    x = layers.Dropout(0.4)(x)
    
    x = layers.BatchNormalization()(x)
    x = layers.Dense(256, kernel_regularizer=regularizers.l2(0.001))(x)
    x = layers.Activation('swish')(x)
    x = layers.Dropout(0.3)(x)
    
    if num_classes > 5:
        x = layers.BatchNormalization()(x)
        x = layers.Dense(128, kernel_regularizer=regularizers.l2(0.001))(x)
        x = layers.Activation('swish')(x)
        x = layers.Dropout(0.2)(x)
    
    outputs = layers.Dense(num_classes, activation='softmax', dtype='float32',
                          kernel_regularizer=regularizers.l2(0.001))(x)
    
    model = keras.Model(inputs, outputs)
    
    return model, base_model


def create_segmentation_model(num_classes, input_shape=(224, 224, 3)):
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
            
            if img.size[0] < 50 or img.size[1] < 50:
                log_message(f"Skipping small image: {doc.get('filename', 'unknown')}", level='warning')
                continue
            
            img = img.resize(image_size, Image.Resampling.LANCZOS)
            img_array = np.array(img).astype(np.float32) / 255.0

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
    
    min_samples = min(counts)
    if min_samples < 10:
        log_message(f"WARNING: Some classes have fewer than 10 samples. Consider adding more images.", level='warning')
    
    return X, y_labels, filenames


def balance_dataset(X, y_labels, target_samples_per_class=None):
    unique, counts = np.unique(y_labels, return_counts=True)
    
    if target_samples_per_class is None:
        target_samples_per_class = max(counts)
    
    log_message(f"Balancing dataset to {target_samples_per_class} samples per class")
    
    X_balanced = []
    y_balanced = []
    
    for label in unique:
        mask = y_labels == label
        X_class = X[mask]
        n_samples = len(X_class)
        
        if n_samples >= target_samples_per_class:
            indices = np.random.choice(n_samples, target_samples_per_class, replace=False)
        else:
            indices_original = np.arange(n_samples)
            indices_augmented = np.random.choice(n_samples, target_samples_per_class - n_samples, replace=True)
            indices = np.concatenate([indices_original, indices_augmented])
        
        for idx in indices:
            img = X_class[idx % n_samples]
            if idx >= n_samples:
                img_normalized = (img * 255).astype(np.uint8)
                img_pil = Image.fromarray(img_normalized)
                
                if random.random() > 0.5:
                    img_pil = ImageOps.mirror(img_pil)
                if random.random() > 0.5:
                    angle = random.uniform(-15, 15)
                    img_pil = img_pil.rotate(angle, fillcolor=(128, 128, 128))
                if random.random() > 0.5:
                    enhancer = ImageEnhance.Brightness(img_pil)
                    img_pil = enhancer.enhance(random.uniform(0.8, 1.2))
                if random.random() > 0.5:
                    enhancer = ImageEnhance.Contrast(img_pil)
                    img_pil = enhancer.enhance(random.uniform(0.8, 1.2))
                
                img = np.array(img_pil).astype(np.float32) / 255.0
            
            X_balanced.append(img)
            y_balanced.append(label)
    
    X_balanced = np.array(X_balanced)
    y_balanced = np.array(y_balanced)
    
    indices = np.random.permutation(len(X_balanced))
    return X_balanced[indices], y_balanced[indices]


def create_tf_dataset(X, y, batch_size, augment=False, shuffle=True):
    dataset = tf.data.Dataset.from_tensor_slices((X, y))
    
    if shuffle:
        dataset = dataset.shuffle(buffer_size=min(len(X), 10000), reshuffle_each_iteration=True)
    
    if augment:
        augmentation = create_augmentation_layer()
        def augment_fn(image, label):
            image = augmentation(image, training=True)
            return image, label
        dataset = dataset.map(augment_fn, num_parallel_calls=tf.data.AUTOTUNE)
    
    dataset = dataset.batch(batch_size)
    dataset = dataset.prefetch(tf.data.AUTOTUNE)
    
    return dataset


def cosine_decay_with_warmup(epoch, total_epochs, warmup_epochs, initial_lr, min_lr):
    if epoch < warmup_epochs:
        return initial_lr * (epoch + 1) / warmup_epochs
    else:
        progress = (epoch - warmup_epochs) / (total_epochs - warmup_epochs)
        return min_lr + 0.5 * (initial_lr - min_lr) * (1 + np.cos(np.pi * progress))


class WarmupCosineDecay(keras.callbacks.Callback):
    def __init__(self, initial_lr, total_epochs, warmup_epochs=5, min_lr=1e-7):
        super().__init__()
        self.initial_lr = initial_lr
        self.total_epochs = total_epochs
        self.warmup_epochs = warmup_epochs
        self.min_lr = min_lr
    
    def on_epoch_begin(self, epoch, logs=None):
        lr = cosine_decay_with_warmup(
            epoch, self.total_epochs, self.warmup_epochs, 
            self.initial_lr, self.min_lr
        )
        keras.backend.set_value(self.model.optimizer.learning_rate, lr)
        log_message(f"Learning rate: {lr:.2e}")


def train_model(args):
    if not TF_AVAILABLE:
        log_message("TensorFlow not available. Cannot train.", level='error')
        sys.exit(1)

    log_message("Initializing improved training pipeline...")
    log_message(f"Configuration: epochs={args.epochs}, batch_size={args.batch_size}, lr={args.learning_rate}")

    X, y_labels, filenames = load_data_from_mongo(args.mongo_uri)

    if len(X) < 10:
        log_message("Not enough samples for training (minimum 10 required)", level='error')
        sys.exit(1)

    unique_classes = np.unique(y_labels)
    num_classes = len(unique_classes)

    if num_classes < 2:
        log_message("At least 2 classes are required for training", level='error')
        sys.exit(1)

    log_message(f"Training with {num_classes} classes: {list(unique_classes)}")

    le = LabelEncoder()
    y = le.fit_transform(y_labels)
    
    labels_map = {i: cls for i, cls in enumerate(le.classes_)}
    log_message(f"Label mapping: {labels_map}")

    X_train, X_val, y_train, y_val = train_test_split(
        X, y, test_size=args.validation_split, stratify=y, random_state=42
    )
    
    log_message(f"Initial train set: {len(X_train)} samples, Validation set: {len(X_val)} samples")

    train_unique, train_counts = np.unique(y_train, return_counts=True)
    max_samples = max(train_counts)
    target_samples = min(max_samples * 2, max(150, max_samples))
    
    y_train_labels = le.inverse_transform(y_train)
    X_train_balanced, y_train_balanced_labels = balance_dataset(X_train, y_train_labels, target_samples)
    y_train_balanced = le.transform(y_train_balanced_labels)
    
    log_message(f"Balanced training set: {len(X_train_balanced)} samples")

    y_train_cat = tf.keras.utils.to_categorical(y_train_balanced, num_classes)
    y_val_cat = tf.keras.utils.to_categorical(y_val, num_classes)

    cw = class_weight.compute_class_weight("balanced",
                                           classes=np.unique(y_train_balanced),
                                           y=y_train_balanced)
    class_weights = {i: float(w) for i, w in enumerate(cw)}
    log_message(f"Class weights: {class_weights}")

    enable_seg = args.enable_segmentation.lower() == 'true'
    model_size = 'large' if len(X) > 200 and num_classes > 5 else 'small'
    log_message(f"Creating improved model (Segmentation: {enable_seg}, Size: {model_size})...")
    
    if enable_seg:
        model, base_model = create_segmentation_model(num_classes)
    else:
        model, base_model = create_improved_model(num_classes, model_size=model_size)

    label_smoothing = 0.15
    
    model.compile(
        optimizer=optimizers.AdamW(learning_rate=args.learning_rate, weight_decay=1e-5),
        loss=tf.keras.losses.CategoricalCrossentropy(label_smoothing=label_smoothing),
        metrics=['accuracy']
    )
    log_message(f"Using label smoothing: {label_smoothing}, weight decay: 1e-5")

    log_message(f"Model compiled with {model.count_params():,} parameters")

    model_dir = Path(f"./data/models/{args.model_id}")
    model_dir.mkdir(parents=True, exist_ok=True)

    phase1_epochs = args.epochs
    phase2_epochs = max(10, args.epochs // 2)
    phase3_epochs = max(5, args.epochs // 4)
    total_epochs = phase1_epochs + phase2_epochs + phase3_epochs
    
    training_progress_callback = TrainingCallback(
        total_epochs, 
        phase_name="Feature Extraction", 
        phase_number=1, 
        total_phases=3
    )
    
    warmup_lr_callback = WarmupCosineDecay(
        initial_lr=args.learning_rate,
        total_epochs=phase1_epochs,
        warmup_epochs=3,
        min_lr=1e-7
    )
    
    base_callbacks = [
        training_progress_callback,
        callbacks.EarlyStopping(
            monitor='val_accuracy',
            patience=12,
            restore_best_weights=True,
            verbose=1,
            min_delta=0.002,
            mode='max'
        ),
        callbacks.ModelCheckpoint(
            str(model_dir / 'best_model.keras'),
            monitor='val_accuracy',
            save_best_only=True,
            verbose=1,
            mode='max'
        )
    ]

    log_message("=" * 50)
    log_message("PHASE 1: Training classification head with frozen base")
    log_message("=" * 50)

    train_dataset = create_tf_dataset(X_train_balanced, y_train_cat, args.batch_size, augment=True)
    val_dataset = create_tf_dataset(X_val, y_val_cat, args.batch_size, augment=False, shuffle=False)

    history1 = model.fit(
        train_dataset,
        epochs=phase1_epochs,
        validation_data=val_dataset,
        class_weight=class_weights,
        callbacks=base_callbacks + [warmup_lr_callback],
        verbose=1
    )

    best_val_acc_phase1 = max(history1.history.get('val_accuracy', [0]))
    log_message(f"Phase 1 complete. Best val accuracy: {best_val_acc_phase1:.4f}")

    log_message("=" * 50)
    log_message("PHASE 2: Fine-tuning top layers of base model")
    log_message("=" * 50)
    
    training_progress_callback.set_phase("Fine-tuning", 2)

    base_model.trainable = True
    
    if hasattr(base_model, 'layers'):
        num_layers = len(base_model.layers)
        freeze_until = int(num_layers * 0.75)
        for layer in base_model.layers[:freeze_until]:
            layer.trainable = False
        log_message(f"Unfroze {num_layers - freeze_until} of {num_layers} layers")

    fine_tune_lr = args.learning_rate * 0.1
    model.compile(
        optimizer=optimizers.AdamW(learning_rate=fine_tune_lr, weight_decay=1e-5),
        loss=tf.keras.losses.CategoricalCrossentropy(label_smoothing=label_smoothing),
        metrics=['accuracy']
    )

    phase2_warmup = WarmupCosineDecay(
        initial_lr=fine_tune_lr,
        total_epochs=phase2_epochs,
        warmup_epochs=2,
        min_lr=1e-8
    )
    
    history2 = model.fit(
        train_dataset,
        epochs=phase2_epochs,
        validation_data=val_dataset,
        class_weight=class_weights,
        callbacks=base_callbacks + [phase2_warmup],
        verbose=1
    )

    best_val_acc_phase2 = max(history2.history.get('val_accuracy', [0]))
    log_message(f"Phase 2 complete. Best val accuracy: {best_val_acc_phase2:.4f}")

    if best_val_acc_phase2 > 0.5:
        log_message("=" * 50)
        log_message("PHASE 3: Deep fine-tuning with very low learning rate")
        log_message("=" * 50)
        
        training_progress_callback.set_phase("Deep Fine-tuning", 3)

        if hasattr(base_model, 'layers'):
            freeze_until = int(num_layers * 0.5)
            for layer in base_model.layers[:freeze_until]:
                layer.trainable = False
            for layer in base_model.layers[freeze_until:]:
                layer.trainable = True
            log_message(f"Unfroze more layers: {num_layers - freeze_until} of {num_layers}")

        deep_fine_tune_lr = args.learning_rate * 0.01
        model.compile(
            optimizer=optimizers.AdamW(learning_rate=deep_fine_tune_lr, weight_decay=1e-6),
            loss=tf.keras.losses.CategoricalCrossentropy(label_smoothing=label_smoothing * 0.5),
            metrics=['accuracy']
        )

        phase3_warmup = WarmupCosineDecay(
            initial_lr=deep_fine_tune_lr,
            total_epochs=phase3_epochs,
            warmup_epochs=1,
            min_lr=1e-9
        )
        
        history3 = model.fit(
            train_dataset,
            epochs=phase3_epochs,
            validation_data=val_dataset,
            class_weight=class_weights,
            callbacks=base_callbacks + [phase3_warmup],
            verbose=1
        )
    else:
        log_message("Skipping phase 3 - accuracy still below threshold", level='warning')
        history3 = type('obj', (object,), {'history': {'accuracy': [], 'val_accuracy': [], 'loss': [], 'val_loss': []}})()

    best_model = keras.models.load_model(str(model_dir / 'best_model.keras'))
    final_model_path = model_dir / 'model.keras'
    best_model.save(str(final_model_path))
    log_message(f"Model saved to {final_model_path}")

    labels_path = model_dir / 'labels.json'
    with open(labels_path, 'w') as f:
        json.dump(labels_map, f, indent=2)
    log_message(f"Labels saved to {labels_path}")

    log_message("Evaluating model on validation set...")
    val_loss, val_accuracy = best_model.evaluate(X_val, y_val_cat, verbose=0)
    log_message(f"Final validation accuracy: {val_accuracy:.4f}")

    val_predictions = best_model.predict(X_val, verbose=0)
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
        'training_samples': len(X_train_balanced),
        'original_samples': len(X),
        'validation_samples': len(X_val),
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
            'validation_split': args.validation_split,
            'label_smoothing': label_smoothing,
            'optimizer': 'AdamW',
            'data_augmentation': 'tf.keras.layers + PIL advanced'
        }
    }

    with open(model_dir / 'metadata.json', 'w') as f:
        json.dump(metadata, f, indent=2)

    log_message("All training artifacts saved successfully!")

    if best_val_accuracy < 0.4:
        log_message("=" * 50)
        log_message("WARNING: Model accuracy is low!")
        log_message("Recommendations:")
        log_message("  1. Add more diverse training images (aim for 100+ per class)")
        log_message("  2. Ensure images are clear and well-lit")
        log_message("  3. Remove duplicate or very similar images")
        log_message("  4. Make sure each class has distinct visual features")
        log_message("=" * 50)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Train a material classification model')
    parser.add_argument('--mongo-uri',
                        required=True,
                        help='MongoDB connection URI')
    parser.add_argument('--model-id',
                        required=True,
                        help='Unique model identifier')
    parser.add_argument('--epochs',
                        type=int,
                        default=25,
                        help='Number of epochs for initial training phase')
    parser.add_argument('--batch-size',
                        type=int,
                        default=16,
                        help='Training batch size')
    parser.add_argument('--learning-rate',
                        type=float,
                        default=0.001,
                        help='Initial learning rate')
    parser.add_argument('--validation-split',
                        type=float,
                        default=0.2,
                        help='Validation split ratio')
    parser.add_argument('--enable-segmentation',
                        default='false',
                        help='Enable segmentation model')
    
    args = parser.parse_args()
    train_model(args)
