#!/usr/bin/env python3
"""
Script to sync trained models from MLStudio to EcoBuild.
This creates/updates the MLModel entry in EcoBuild's MongoDB collection.
"""

import os
import sys
import json
import argparse
from pathlib import Path
from datetime import datetime
from pymongo import MongoClient


def sync_model(model_id: str, mongo_uri: str, activate: bool = True):
    """Sync a trained model to EcoBuild's MLModel collection"""
    
    model_dir = Path(f"./data/models/{model_id}")
    
    if not model_dir.exists():
        print(f"Error: Model directory not found: {model_dir}")
        return False
    
    metadata_path = model_dir / 'metadata.json'
    if not metadata_path.exists():
        print(f"Error: Metadata file not found: {metadata_path}")
        return False
    
    with open(metadata_path, 'r') as f:
        metadata = json.load(f)
    
    model_path = model_dir / 'model.keras'
    if not model_path.exists():
        model_path = model_dir / 'best_model.keras'
        if not model_path.exists():
            print(f"Error: Model file not found in {model_dir}")
            return False
    
    print(f"Syncing model: {model_id}")
    print(f"  Classes: {metadata.get('classes', [])}")
    print(f"  Accuracy: {metadata.get('final_val_accuracy', 0):.4f}")
    print(f"  Model path: {model_path}")
    
    try:
        client = MongoClient(mongo_uri)
        db = client['Construction_test']
        ml_models = db['mlmodels']
        
        version = f"v{datetime.now().strftime('%Y%m%d.%H%M')}"
        
        model_doc = {
            'name': f"EcoBuild Material Detector",
            'version': version,
            'description': f"Trained on {metadata.get('original_samples', 0)} samples, {metadata.get('num_classes', 0)} material classes",
            'status': 'ready',
            'accuracy': float(metadata.get('final_val_accuracy', 0)),
            'precision': float(metadata.get('precision', 0)),
            'recall': float(metadata.get('recall', 0)),
            'f1Score': float(metadata.get('f1_score', 0)),
            'totalSamples': int(metadata.get('original_samples', 0)),
            'epochs': int(metadata.get('epochs_trained', 0)),
            'trainingTime': 0,
            'modelPath': str(model_path.absolute()),
            'labelsPath': str((model_dir / 'labels.json').absolute()),
            'classes': metadata.get('classes', []),
            'classIndices': metadata.get('class_indices', {}),
            'inputShape': metadata.get('input_shape', [224, 224, 3]),
            'architecture': metadata.get('model_architecture', 'EfficientNetB0'),
            'mlstudioModelId': model_id,
            'isActive': False,
            'createdAt': datetime.now(),
            'updatedAt': datetime.now()
        }
        
        existing = ml_models.find_one({'mlstudioModelId': model_id})
        
        if existing:
            ml_models.update_one(
                {'mlstudioModelId': model_id},
                {'$set': {**model_doc, 'updatedAt': datetime.now()}}
            )
            print(f"Updated existing model entry")
            mongo_id = existing['_id']
        else:
            result = ml_models.insert_one(model_doc)
            mongo_id = result.inserted_id
            print(f"Created new model entry with ID: {mongo_id}")
        
        if activate:
            ml_models.update_many(
                {'_id': {'$ne': mongo_id}},
                {'$set': {'isActive': False}}
            )
            ml_models.update_one(
                {'_id': mongo_id},
                {'$set': {'isActive': True}}
            )
            print(f"Model activated as the primary model for EcoBuild")
        
        final_model = ml_models.find_one({'_id': mongo_id})
        print("\nModel synced successfully!")
        print(f"  MongoDB ID: {mongo_id}")
        print(f"  Name: {final_model['name']}")
        print(f"  Version: {final_model['version']}")
        print(f"  Accuracy: {final_model['accuracy']:.4f}")
        print(f"  Active: {final_model['isActive']}")
        
        client.close()
        return True
        
    except Exception as e:
        print(f"Error syncing model: {e}")
        import traceback
        traceback.print_exc()
        return False


def list_available_models():
    """List all trained models available for syncing"""
    models_dir = Path("./data/models")
    
    if not models_dir.exists():
        print("No models directory found")
        return []
    
    models = []
    for model_dir in models_dir.iterdir():
        if model_dir.is_dir():
            metadata_path = model_dir / 'metadata.json'
            if metadata_path.exists():
                with open(metadata_path, 'r') as f:
                    metadata = json.load(f)
                models.append({
                    'id': model_dir.name,
                    'accuracy': metadata.get('final_val_accuracy', 0),
                    'classes': metadata.get('num_classes', 0),
                    'samples': metadata.get('original_samples', 0)
                })
    
    if models:
        print("\nAvailable models:")
        print("-" * 60)
        for m in sorted(models, key=lambda x: x['accuracy'], reverse=True):
            print(f"  {m['id']}")
            print(f"    Accuracy: {m['accuracy']:.4f}")
            print(f"    Classes: {m['classes']}")
            print(f"    Samples: {m['samples']}")
    else:
        print("No trained models found")
    
    return models


def list_ecobuild_models(mongo_uri: str):
    """List models currently in EcoBuild"""
    try:
        client = MongoClient(mongo_uri)
        db = client['Construction_test']
        ml_models = db['mlmodels']
        
        models = list(ml_models.find().sort('createdAt', -1))
        
        if models:
            print("\nModels in EcoBuild:")
            print("-" * 60)
            for m in models:
                active_marker = " [ACTIVE]" if m.get('isActive') else ""
                print(f"  {m.get('name', 'Unknown')} {m.get('version', '')}{active_marker}")
                print(f"    ID: {m['_id']}")
                print(f"    Accuracy: {m.get('accuracy', 0):.4f}")
                print(f"    Status: {m.get('status', 'unknown')}")
                print(f"    MLStudio ID: {m.get('mlstudioModelId', 'N/A')}")
        else:
            print("No models found in EcoBuild")
        
        client.close()
        return models
    except Exception as e:
        print(f"Error listing EcoBuild models: {e}")
        return []


def main():
    parser = argparse.ArgumentParser(description='Sync trained models to EcoBuild')
    parser.add_argument('--mongo-uri', required=True, help='MongoDB connection URI')
    parser.add_argument('--action', choices=['sync', 'list-local', 'list-ecobuild'], 
                        default='list-local', help='Action to perform')
    parser.add_argument('--model-id', help='Model ID to sync')
    parser.add_argument('--activate', action='store_true', default=True,
                        help='Activate this model in EcoBuild (default: True)')
    parser.add_argument('--no-activate', action='store_false', dest='activate',
                        help='Do not activate this model')
    
    args = parser.parse_args()
    
    if args.action == 'list-local':
        list_available_models()
    
    elif args.action == 'list-ecobuild':
        list_ecobuild_models(args.mongo_uri)
    
    elif args.action == 'sync':
        if not args.model_id:
            print("Error: --model-id required for sync action")
            sys.exit(1)
        
        success = sync_model(args.model_id, args.mongo_uri, args.activate)
        if not success:
            sys.exit(1)


if __name__ == '__main__':
    main()
