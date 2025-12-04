#!/usr/bin/env python3
"""
Script to add more training images to MongoDB for improved model training.
This script can download images from URLs or process local images.
"""

import os
import sys
import json
import io
import requests
from pathlib import Path
from PIL import Image
from pymongo import MongoClient
import hashlib
import time

MATERIAL_CATEGORIES = {
    'bricks': {
        'keywords': ['red brick wall', 'clay brick texture', 'brick masonry', 'brick pattern'],
        'description': 'Common clay bricks used in construction'
    },
    'concrete': {
        'keywords': ['concrete texture', 'gray concrete wall', 'concrete surface', 'cement texture'],
        'description': 'Standard mix concrete for structural elements'
    },
    'aggregate': {
        'keywords': ['gravel texture', 'crushed stone', 'aggregate pile', 'construction gravel'],
        'description': 'Crushed stone or gravel for construction'
    },
    'aerated_block': {
        'keywords': ['aac block', 'autoclaved aerated concrete', 'lightweight block', 'aerated concrete block'],
        'description': 'Autoclaved aerated concrete blocks'
    },
    'concrete_block': {
        'keywords': ['concrete block wall', 'cinder block', 'masonry block', 'CMU block'],
        'description': 'Medium density concrete masonry blocks'
    },
    'limestone_block': {
        'keywords': ['limestone wall', 'limestone texture', 'natural stone block', 'limestone masonry'],
        'description': 'Natural limestone building blocks'
    },
    'rammed_earth': {
        'keywords': ['rammed earth wall', 'earth construction', 'compressed earth', 'pisé wall'],
        'description': 'Compacted earth construction without cement'
    },
    'timber': {
        'keywords': ['wood grain', 'timber texture', 'wooden planks', 'lumber surface'],
        'description': 'General timber products'
    },
    'steel': {
        'keywords': ['steel beam', 'metal texture', 'steel structure', 'galvanized steel'],
        'description': 'General steel products with average recycled content'
    },
    'glass': {
        'keywords': ['glass panel', 'window glass', 'float glass', 'glass facade'],
        'description': 'Float glass for windows and facades'
    }
}

SAMPLE_IMAGES = {
    'bricks': [
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
        'https://images.unsplash.com/photo-1587582423116-ec07293f0395?w=400',
    ],
    'concrete': [
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    ],
    'timber': [
        'https://images.unsplash.com/photo-1541123603104-512919d6a96c?w=400',
    ]
}


def get_image_hash(img_data):
    """Generate hash for image data to avoid duplicates"""
    return hashlib.md5(img_data).hexdigest()


def download_image(url, timeout=10):
    """Download image from URL"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(url, headers=headers, timeout=timeout)
        response.raise_for_status()
        return response.content
    except Exception as e:
        print(f"Error downloading {url}: {e}")
        return None


def process_image(img_data, target_size=(224, 224)):
    """Process image data and resize"""
    try:
        img = Image.open(io.BytesIO(img_data))
        img = img.convert('RGB')
        
        width, height = img.size
        min_dim = min(width, height)
        left = (width - min_dim) // 2
        top = (height - min_dim) // 2
        right = left + min_dim
        bottom = top + min_dim
        img = img.crop((left, top, right, bottom))
        
        img = img.resize(target_size, Image.Resampling.LANCZOS)
        
        buffer = io.BytesIO()
        img.save(buffer, format='JPEG', quality=95)
        return buffer.getvalue()
    except Exception as e:
        print(f"Error processing image: {e}")
        return None


def add_image_to_mongodb(mongo_uri, material_key, img_data, filename, source='manual'):
    """Add a single image to MongoDB"""
    try:
        client = MongoClient(mongo_uri)
        db = client['Construction_test']
        collection = db['materialimages']
        
        img_hash = get_image_hash(img_data)
        existing = collection.find_one({'hash': img_hash})
        if existing:
            print(f"Image already exists in database (hash: {img_hash[:8]}...)")
            client.close()
            return False
        
        processed_data = process_image(img_data)
        if processed_data is None:
            client.close()
            return False
        
        doc = {
            'material_key': material_key,
            'material_official': material_key,
            'filename': filename,
            'data': processed_data,
            'hash': img_hash,
            'source': source,
            'size': len(processed_data),
            'added_at': time.time()
        }
        
        collection.insert_one(doc)
        print(f"Added image '{filename}' for material '{material_key}'")
        
        client.close()
        return True
    except Exception as e:
        print(f"Error adding image to MongoDB: {e}")
        return False


def add_images_from_directory(mongo_uri, directory, material_key):
    """Add all images from a directory for a specific material"""
    directory = Path(directory)
    if not directory.exists():
        print(f"Directory not found: {directory}")
        return 0
    
    count = 0
    for img_path in directory.glob('*'):
        if img_path.suffix.lower() in ['.jpg', '.jpeg', '.png', '.webp', '.bmp']:
            try:
                with open(img_path, 'rb') as f:
                    img_data = f.read()
                if add_image_to_mongodb(mongo_uri, material_key, img_data, img_path.name, 'local'):
                    count += 1
            except Exception as e:
                print(f"Error processing {img_path}: {e}")
    
    return count


def add_images_from_urls(mongo_uri, material_key, urls):
    """Add images from a list of URLs"""
    count = 0
    for i, url in enumerate(urls):
        print(f"Downloading image {i+1}/{len(urls)} for {material_key}...")
        img_data = download_image(url)
        if img_data:
            filename = f"{material_key}_{i+1}_{int(time.time())}.jpg"
            if add_image_to_mongodb(mongo_uri, material_key, img_data, filename, 'url'):
                count += 1
        time.sleep(0.5)
    return count


def get_dataset_stats(mongo_uri):
    """Get statistics about the current dataset"""
    try:
        client = MongoClient(mongo_uri)
        db = client['Construction_test']
        collection = db['materialimages']
        
        pipeline = [
            {'$group': {'_id': '$material_key', 'count': {'$sum': 1}}}
        ]
        stats = list(collection.aggregate(pipeline))
        
        total = sum(s['count'] for s in stats)
        
        print("\n" + "=" * 50)
        print("DATASET STATISTICS")
        print("=" * 50)
        print(f"Total images: {total}")
        print("\nImages per class:")
        for s in sorted(stats, key=lambda x: x['count'], reverse=True):
            print(f"  {s['_id']}: {s['count']} images")
        
        min_samples = min(s['count'] for s in stats) if stats else 0
        recommended = max(100, min_samples)
        
        print(f"\nMinimum samples per class: {min_samples}")
        print(f"Recommended minimum: {recommended}")
        
        if min_samples < 50:
            print("\nWARNING: Some classes have very few samples.")
            print("Consider adding more images for better training results.")
        
        client.close()
        return stats
    except Exception as e:
        print(f"Error getting stats: {e}")
        return []


def balance_dataset(mongo_uri, target_per_class=100):
    """Suggest which classes need more images"""
    stats = get_dataset_stats(mongo_uri)
    
    print("\n" + "=" * 50)
    print("DATASET BALANCE ANALYSIS")
    print("=" * 50)
    
    for s in stats:
        material_key = s['_id']
        count = s['count']
        needed = max(0, target_per_class - count)
        
        if needed > 0:
            print(f"\n{material_key}:")
            print(f"  Current: {count} images")
            print(f"  Needed: {needed} more images")
            if material_key in MATERIAL_CATEGORIES:
                keywords = MATERIAL_CATEGORIES[material_key]['keywords']
                print(f"  Search keywords: {', '.join(keywords)}")


def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Manage training images in MongoDB')
    parser.add_argument('--mongo-uri', required=True, help='MongoDB connection URI')
    parser.add_argument('--action', choices=['stats', 'balance', 'add-dir', 'add-urls'], 
                        default='stats', help='Action to perform')
    parser.add_argument('--material', help='Material key for adding images')
    parser.add_argument('--directory', help='Directory containing images')
    parser.add_argument('--urls', nargs='+', help='URLs of images to add')
    parser.add_argument('--target', type=int, default=100, help='Target images per class')
    
    args = parser.parse_args()
    
    if args.action == 'stats':
        get_dataset_stats(args.mongo_uri)
    
    elif args.action == 'balance':
        balance_dataset(args.mongo_uri, args.target)
    
    elif args.action == 'add-dir':
        if not args.material or not args.directory:
            print("Error: --material and --directory required for add-dir")
            sys.exit(1)
        count = add_images_from_directory(args.mongo_uri, args.directory, args.material)
        print(f"\nAdded {count} images for {args.material}")
    
    elif args.action == 'add-urls':
        if not args.material or not args.urls:
            print("Error: --material and --urls required for add-urls")
            sys.exit(1)
        count = add_images_from_urls(args.mongo_uri, args.material, args.urls)
        print(f"\nAdded {count} images for {args.material}")


if __name__ == '__main__':
    main()
