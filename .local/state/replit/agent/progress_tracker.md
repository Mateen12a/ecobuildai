[x] 1. Install the required packages
[x] 2. Fix port configuration (changed from 5050 to 5000)
[x] 3. Restart the workflow to see if the project is working
[x] 4. Verify the project is working using the screenshot tool
[x] 5. Import completed

## ML Training Improvements and EcoBuild Integration

[x] 1. Improved ML training script (train.py) with:
   - EfficientNetB0 architecture (better than MobileNetV2)
   - 3-phase training with progressive unfreezing
   - Enhanced data augmentation (brightness, contrast, color, blur, sharpness)
   - Better regularization (L2, dropout, batch normalization)
   - Automatic dataset augmentation to increase training samples
   - Class weighting for imbalanced datasets
   - Comprehensive metrics tracking (precision, recall, F1)

[x] 2. Created add_training_images.py for managing training data:
   - Add images from directories or URLs
   - Automatic deduplication via hashing
   - Image preprocessing and resizing
   - Dataset statistics and balance analysis

[x] 3. Created sync_model_to_ecobuild.py for model integration:
   - Sync trained models to EcoBuild's MLModel collection
   - Automatic activation of new models
   - List local and EcoBuild models

[x] 4. Created predict.py for model inference:
   - Load and run inference on trained models
   - Used by EcoBuild for real predictions

[x] 5. Updated EcoBuild integration:
   - Created modelInference.ts service
   - Updated scans.ts to use real model inference
   - Updated MLModel schema with new fields

[x] 6. Test the full pipeline - TensorFlow 2.20.0 installed and working

## Usage Instructions

### Training a New Model
```bash
cd MLStudio-main/worker
python3 train.py --run-id my_training_run --epochs 100 --batch-size 16
```

### Adding Training Images
```bash
cd MLStudio-main/worker
python3 add_training_images.py --mongo-uri "YOUR_MONGO_URI" --action stats
python3 add_training_images.py --mongo-uri "YOUR_MONGO_URI" --action add-dir --material concrete --directory ./images/concrete
```

### Syncing Model to EcoBuild
```bash
cd MLStudio-main/worker
python3 sync_model_to_ecobuild.py --run-id my_training_run
```

### Listing Models
```bash
python3 sync_model_to_ecobuild.py --list-local    # Show local models
python3 sync_model_to_ecobuild.py --list-ecobuild # Show EcoBuild models
```