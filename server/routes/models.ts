import { Router, Response } from 'express';
import { MLModel } from '../db/models';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', async (req, res: Response) => {
  try {
    const models = await MLModel.find()
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(models.map(m => ({
      id: m._id,
      name: m.name,
      version: m.version,
      description: m.description,
      status: m.status,
      accuracy: m.accuracy,
      precision: m.precision,
      recall: m.recall,
      f1Score: m.f1Score,
      totalSamples: m.totalSamples,
      isActive: m.isActive,
      createdAt: m.createdAt
    })));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch models' });
  }
});

router.get('/active', async (req, res: Response) => {
  try {
    const activeModel = await MLModel.findOne({ isActive: true, status: 'ready' });
    
    if (!activeModel) {
      res.json({
        available: false,
        message: 'We are currently working on our AI model. The scanner is running in simulation mode.',
        suggestion: 'You can still use the scanner to understand material properties and eco-friendly alternatives.'
      });
      return;
    }

    res.json({
      available: true,
      model: {
        id: activeModel._id,
        name: activeModel.name,
        version: activeModel.version,
        description: activeModel.description,
        accuracy: activeModel.accuracy,
        precision: activeModel.precision,
        recall: activeModel.recall,
        f1Score: activeModel.f1Score
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch active model' });
  }
});

router.get('/stats', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const totalModels = await MLModel.countDocuments();
    const readyModels = await MLModel.countDocuments({ status: 'ready' });
    const trainingModels = await MLModel.countDocuments({ status: 'training' });
    const activeModel = await MLModel.findOne({ isActive: true });

    res.json({
      totalModels,
      readyModels,
      trainingModels,
      activeModel: activeModel ? {
        id: activeModel._id,
        name: activeModel.name,
        version: activeModel.version,
        accuracy: activeModel.accuracy
      } : null
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch model stats' });
  }
});

router.get('/local', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const modelsDir = path.join(process.cwd(), 'MLStudio-main', 'server', 'data', 'models');
    
    if (!fs.existsSync(modelsDir)) {
      res.json([]);
      return;
    }

    const models: { id: string; accuracy: number; classes: number; samples: number }[] = [];
    
    const dirs = fs.readdirSync(modelsDir);
    for (const dir of dirs) {
      const metadataPath = path.join(modelsDir, dir, 'metadata.json');
      if (fs.existsSync(metadataPath)) {
        try {
          const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
          models.push({
            id: dir,
            accuracy: metadata.final_val_accuracy || 0,
            classes: metadata.num_classes || 0,
            samples: metadata.original_samples || 0
          });
        } catch (e) {
          console.error(`Error reading metadata for ${dir}:`, e);
        }
      }
    }

    res.json(models.sort((a, b) => b.accuracy - a.accuracy));
  } catch (error) {
    console.error('Error fetching local models:', error);
    res.status(500).json({ error: 'Failed to fetch local models' });
  }
});

router.get('/:id', async (req, res: Response) => {
  try {
    const model = await MLModel.findById(req.params.id);
    
    if (!model) {
      res.status(404).json({ error: 'Model not found' });
      return;
    }

    res.json({
      id: model._id,
      name: model.name,
      version: model.version,
      description: model.description,
      status: model.status,
      accuracy: model.accuracy,
      precision: model.precision,
      recall: model.recall,
      f1Score: model.f1Score,
      totalSamples: model.totalSamples,
      epochs: model.epochs,
      trainingTime: model.trainingTime,
      isActive: model.isActive,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch model' });
  }
});

router.post('/train', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { epochs = 30, batchSize = 16, learningRate = 0.001, validationSplit = 0.2, enableSegmentation = false } = req.body;
    
    const modelId = `model-${Date.now()}`;
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      res.status(500).json({ error: 'MongoDB URI not configured' });
      return;
    }

    const workerPath = path.join(process.cwd(), 'MLStudio-main', 'worker', 'train.py');
    
    if (!fs.existsSync(workerPath)) {
      res.status(500).json({ error: 'Training script not found' });
      return;
    }

    const args = [
      workerPath,
      '--model-id', modelId,
      '--mongo-uri', mongoUri,
      '--epochs', epochs.toString(),
      '--batch-size', batchSize.toString(),
      '--learning-rate', learningRate.toString(),
      '--validation-split', validationSplit.toString(),
      '--enable-segmentation', enableSegmentation.toString()
    ];

    const process_train = spawn('python3', args, {
      cwd: path.join(process.cwd(), 'MLStudio-main', 'worker'),
      env: { ...process.env }
    });

    process_train.stdout.on('data', (data) => {
      console.log(`Training stdout: ${data}`);
    });

    process_train.stderr.on('data', (data) => {
      console.error(`Training stderr: ${data}`);
    });

    process_train.on('close', (code) => {
      console.log(`Training process exited with code ${code}`);
    });

    res.json({ 
      success: true, 
      modelId, 
      message: 'Training started. Check logs for progress.',
      config: { epochs, batchSize, learningRate, validationSplit, enableSegmentation }
    });
  } catch (error) {
    console.error('Error starting training:', error);
    res.status(500).json({ error: 'Failed to start training' });
  }
});

router.post('/sync/:modelId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { modelId } = req.params;
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      res.status(500).json({ error: 'MongoDB URI not configured' });
      return;
    }

    const modelDir = path.join(process.cwd(), 'MLStudio-main', 'server', 'data', 'models', modelId);
    
    if (!fs.existsSync(modelDir)) {
      res.status(404).json({ error: 'Model not found locally' });
      return;
    }

    const metadataPath = path.join(modelDir, 'metadata.json');
    if (!fs.existsSync(metadataPath)) {
      res.status(404).json({ error: 'Model metadata not found' });
      return;
    }

    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
    
    const version = `v${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.${Date.now() % 10000}`;
    
    const modelDoc = {
      name: 'EcoBuild Material Detector',
      version,
      description: `Trained on ${metadata.original_samples || 0} samples, ${metadata.num_classes || 0} material classes`,
      status: 'ready',
      accuracy: metadata.final_val_accuracy || 0,
      precision: metadata.precision || 0,
      recall: metadata.recall || 0,
      f1Score: metadata.f1_score || 0,
      totalSamples: metadata.original_samples || 0,
      epochs: metadata.epochs_trained || 0,
      trainingTime: 0,
      modelPath: path.join(modelDir, 'model.keras'),
      labelsPath: path.join(modelDir, 'labels.json'),
      classes: metadata.classes || [],
      classIndices: metadata.class_indices || {},
      inputShape: metadata.input_shape || [224, 224, 3],
      architecture: metadata.model_architecture || 'EfficientNetB0',
      mlstudioModelId: modelId,
      isActive: false,
      updatedAt: new Date()
    };

    const existing = await MLModel.findOne({ mlstudioModelId: modelId });
    
    if (existing) {
      await MLModel.updateOne(
        { mlstudioModelId: modelId },
        { $set: modelDoc }
      );
    } else {
      await MLModel.create(modelDoc);
    }

    res.json({ success: true, message: 'Model synced to EcoBuild', version });
  } catch (error) {
    console.error('Error syncing model:', error);
    res.status(500).json({ error: 'Failed to sync model' });
  }
});

router.post('/:id/activate', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    await MLModel.updateMany({}, { isActive: false });
    
    await MLModel.updateOne({ _id: id }, { isActive: true });
    
    const model = await MLModel.findById(id);
    
    if (!model) {
      res.status(404).json({ error: 'Model not found' });
      return;
    }

    res.json({ 
      success: true, 
      message: 'Model activated',
      model: {
        id: model._id,
        name: model.name,
        version: model.version,
        isActive: true
      }
    });
  } catch (error) {
    console.error('Error activating model:', error);
    res.status(500).json({ error: 'Failed to activate model' });
  }
});

router.post('/test', authMiddleware, upload.single('image'), async (req: AuthRequest, res: Response) => {
  try {
    const file = req.file;
    
    if (!file) {
      res.status(400).json({ error: 'No image provided' });
      return;
    }

    const activeModel = await MLModel.findOne({ isActive: true, status: 'ready' });
    
    if (!activeModel || !activeModel.modelPath) {
      const simulatedMaterials = ['concrete', 'steel', 'glass', 'wood', 'brick', 'aluminum'];
      const randomMaterial = simulatedMaterials[Math.floor(Math.random() * simulatedMaterials.length)];
      const randomConfidence = 0.75 + Math.random() * 0.2;
      
      res.json({
        prediction: randomMaterial,
        confidence: randomConfidence,
        allPredictions: simulatedMaterials.map(m => ({
          class: m,
          confidence: m === randomMaterial ? randomConfidence : Math.random() * 0.3
        })).sort((a, b) => b.confidence - a.confidence),
        isSimulation: true,
        message: 'No active model. Results are simulated.'
      });
      return;
    }

    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const tempImagePath = path.join(tempDir, `test_${Date.now()}.jpg`);
    fs.writeFileSync(tempImagePath, file.buffer);

    const predictScript = path.join(process.cwd(), 'MLStudio-main', 'worker', 'predict.py');
    
    if (!fs.existsSync(predictScript)) {
      fs.unlinkSync(tempImagePath);
      res.status(500).json({ error: 'Prediction script not found' });
      return;
    }

    const predictProcess = spawn('python3', [
      predictScript,
      '--model-path', activeModel.modelPath,
      '--labels-path', activeModel.labelsPath || '',
      '--image-path', tempImagePath
    ], {
      cwd: path.join(process.cwd(), 'MLStudio-main', 'worker')
    });

    let output = '';
    let errorOutput = '';

    predictProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    predictProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    predictProcess.on('close', (code) => {
      fs.unlinkSync(tempImagePath);

      if (code !== 0) {
        console.error('Prediction error:', errorOutput);
        res.status(500).json({ error: 'Prediction failed', details: errorOutput });
        return;
      }

      try {
        const lines = output.trim().split('\n');
        const resultLine = lines.find(l => l.startsWith('{'));
        
        if (resultLine) {
          const result = JSON.parse(resultLine);
          res.json({
            prediction: result.prediction || result.class,
            confidence: result.confidence,
            allPredictions: result.all_predictions || [{ class: result.prediction, confidence: result.confidence }],
            isSimulation: false
          });
        } else {
          res.status(500).json({ error: 'Invalid prediction output' });
        }
      } catch (e) {
        console.error('Error parsing prediction output:', e, output);
        res.status(500).json({ error: 'Failed to parse prediction' });
      }
    });
  } catch (error) {
    console.error('Error testing model:', error);
    res.status(500).json({ error: 'Failed to test model' });
  }
});

export default router;
