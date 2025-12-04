#!/usr/bin/env python3
"""
Script to run inference using a trained model.
Used by EcoBuild to make predictions on uploaded images.
"""

import os
import sys
import json
import argparse
import numpy as np
from pathlib import Path
import io

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

try:
    import tensorflow as tf
    from tensorflow import keras
    from PIL import Image
    TF_AVAILABLE = True
except ImportError:
    TF_AVAILABLE = False


def load_and_preprocess_image(image_path: str, target_size=(224, 224)):
    """Load and preprocess an image for prediction"""
    img = Image.open(image_path)
    img = img.convert('RGB')
    img = img.resize(target_size, Image.Resampling.LANCZOS)
    img_array = np.array(img).astype(np.float32)
    img_array = (img_array - 127.5) / 127.5
    img_array = np.expand_dims(img_array, axis=0)
    return img_array


def predict(image_path: str, model_path: str, labels_path: str):
    """Run prediction on an image using the trained model"""
    
    if not TF_AVAILABLE:
        return {
            'error': 'TensorFlow not available',
            'predictions': []
        }
    
    if not os.path.exists(model_path):
        return {
            'error': f'Model not found: {model_path}',
            'predictions': []
        }
    
    if not os.path.exists(labels_path):
        return {
            'error': f'Labels not found: {labels_path}',
            'predictions': []
        }
    
    if not os.path.exists(image_path):
        return {
            'error': f'Image not found: {image_path}',
            'predictions': []
        }
    
    try:
        with open(labels_path, 'r') as f:
            labels_map = json.load(f)
        
        labels_map = {int(k): v for k, v in labels_map.items()}
        
        model = keras.models.load_model(model_path, compile=False)
        
        img_array = load_and_preprocess_image(image_path)
        
        predictions = model.predict(img_array, verbose=0)
        
        pred_classes = []
        for idx, confidence in enumerate(predictions[0]):
            class_name = labels_map.get(idx, f'class_{idx}')
            pred_classes.append({
                'class': class_name,
                'confidence': float(confidence)
            })
        
        pred_classes.sort(key=lambda x: x['confidence'], reverse=True)
        
        return {
            'predictions': pred_classes,
            'model': os.path.basename(model_path),
            'success': True
        }
        
    except Exception as e:
        return {
            'error': str(e),
            'predictions': []
        }


def main():
    parser = argparse.ArgumentParser(description='Run inference on an image')
    parser.add_argument('--image', required=True, help='Path to image file')
    parser.add_argument('--model', required=True, help='Path to model file')
    parser.add_argument('--labels', required=True, help='Path to labels JSON file')
    
    args = parser.parse_args()
    
    result = predict(args.image, args.model, args.labels)
    
    print(json.dumps(result))


if __name__ == '__main__':
    main()
