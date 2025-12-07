import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';
import { Scan, User, MLModel } from '../db/models';
import { authMiddleware, AuthRequest, optionalAuthMiddleware } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';
import { predictWithModel } from '../services/modelInference';

const router = Router();

const UPLOADS_DIR = path.join(process.cwd(), 'uploads', 'scans');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

const ICE_MATERIALS: Record<string, any> = {
  bricks: { 
    name: 'Bricks (common)', 
    embodiedEnergy: 3.0, 
    embodiedCarbon: 0.24, 
    density: 1700, 
    thermalConductivity: 0.84,
    recyclability: 'High - Can be crushed and reused',
    alternatives: ['concrete_block', 'aerated_block'] 
  },
  concrete: { 
    name: 'Concrete (1:1.5:3)', 
    embodiedEnergy: 0.95, 
    embodiedCarbon: 0.13, 
    density: 2400, 
    thermalConductivity: 1.7,
    recyclability: 'Medium - Can be crushed for aggregate',
    alternatives: ['rammed_earth', 'limestone_block'] 
  },
  aggregate: { 
    name: 'Aggregate', 
    embodiedEnergy: 0.083, 
    embodiedCarbon: 0.0048, 
    density: 1500,
    thermalConductivity: 0.5,
    recyclability: 'High - Natural material',
    alternatives: [] 
  },
  aerated_block: { 
    name: 'Aerated block', 
    embodiedEnergy: 3.5, 
    embodiedCarbon: 0.30, 
    density: 600,
    thermalConductivity: 0.16,
    recyclability: 'Medium - Limited recycling options',
    alternatives: ['concrete_block', 'bricks'] 
  },
  concrete_block: { 
    name: 'Concrete block', 
    embodiedEnergy: 0.67, 
    embodiedCarbon: 0.073, 
    density: 1350,
    thermalConductivity: 1.2,
    recyclability: 'Medium - Can be crushed',
    alternatives: ['bricks', 'aerated_block'] 
  },
  limestone_block: { 
    name: 'Limestone block', 
    embodiedEnergy: 0.85, 
    embodiedCarbon: 0.017, 
    density: 2180,
    thermalConductivity: 1.5,
    recyclability: 'High - Natural material',
    alternatives: ['concrete', 'rammed_earth'] 
  },
  rammed_earth: { 
    name: 'Rammed earth', 
    embodiedEnergy: 0.45, 
    embodiedCarbon: 0.023, 
    density: 1900,
    thermalConductivity: 1.0,
    recyclability: 'High - Fully recyclable',
    alternatives: ['concrete', 'limestone_block'] 
  },
  timber: { 
    name: 'Timber (general)', 
    embodiedEnergy: 8.5, 
    embodiedCarbon: 0.46, 
    density: 600,
    thermalConductivity: 0.14,
    recyclability: 'High - Biodegradable',
    alternatives: [] 
  },
  steel: { 
    name: 'Steel (general)', 
    embodiedEnergy: 20.1, 
    embodiedCarbon: 1.37, 
    density: 7850,
    thermalConductivity: 50,
    recyclability: 'High - Highly recyclable',
    alternatives: ['timber'] 
  },
  glass: { 
    name: 'Glass (float)', 
    embodiedEnergy: 15.0, 
    embodiedCarbon: 0.85, 
    density: 2500,
    thermalConductivity: 1.0,
    recyclability: 'High - Fully recyclable',
    alternatives: [] 
  },
  aluminum: { 
    name: 'Aluminum (general)', 
    embodiedEnergy: 155, 
    embodiedCarbon: 8.24, 
    density: 2700,
    thermalConductivity: 237,
    recyclability: 'Very High - Infinitely recyclable',
    alternatives: ['steel'] 
  },
  insulation_mineral_wool: { 
    name: 'Mineral wool insulation', 
    embodiedEnergy: 16.6, 
    embodiedCarbon: 1.28, 
    density: 30,
    thermalConductivity: 0.035,
    recyclability: 'Low - Difficult to recycle',
    alternatives: ['insulation_cellulose'] 
  },
  insulation_cellulose: { 
    name: 'Cellulose insulation', 
    embodiedEnergy: 0.94, 
    embodiedCarbon: 0.06, 
    density: 45,
    thermalConductivity: 0.040,
    recyclability: 'High - Made from recycled paper',
    alternatives: ['insulation_mineral_wool'] 
  },
  plasterboard: { 
    name: 'Plasterboard', 
    embodiedEnergy: 6.75, 
    embodiedCarbon: 0.38, 
    density: 800,
    thermalConductivity: 0.25,
    recyclability: 'Medium - Can be recycled',
    alternatives: [] 
  },
  ceramic_tiles: { 
    name: 'Ceramic tiles', 
    embodiedEnergy: 12.0, 
    embodiedCarbon: 0.78, 
    density: 2000,
    thermalConductivity: 1.0,
    recyclability: 'Low - Difficult to recycle',
    alternatives: [] 
  }
};

const MATERIAL_KEYS = Object.keys(ICE_MATERIALS);

router.get('/model-status', async (req: Request, res: Response) => {
  try {
    const activeModel = await MLModel.findOne({ isActive: true, status: 'ready' });
    
    if (activeModel) {
      res.json({
        available: true,
        model: {
          id: activeModel._id,
          name: activeModel.name,
          version: activeModel.version,
          accuracy: activeModel.accuracy
        }
      });
    } else {
      res.json({
        available: false,
        message: 'We are currently working on our AI model. Please check back soon for improved material detection.'
      });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to check model status' });
  }
});

router.post('/predict', optionalAuthMiddleware, upload.single('image'), async (req: any, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No image provided' });
      return;
    }

    const guestToken = req.body.guestToken;
    const isGuest = !req.userId;

    if (isGuest && !guestToken) {
      res.status(400).json({ error: 'Guest token required for anonymous scans' });
      return;
    }

    if (isGuest) {
      const guestScanCount = await Scan.countDocuments({ guestToken });
      if (guestScanCount >= 3) {
        res.status(403).json({ 
          error: 'Guest scan limit reached',
          message: 'You have used all 3 free scans. Please sign up to continue.',
          limitReached: true
        });
        return;
      }
    }

    let activeModel = null;
    let modelSource = 'none';
    
    // PRIORITY 1: Check for active model in ML Studio's TrainedModel collection
    const db = mongoose.connection.db;
    if (db) {
      const trainedModelsCollection = db.collection('trainedmodels');
      const mlStudioModel = await trainedModelsCollection.findOne({ 
        isActive: true, 
        status: 'completed' 
      });
      
      if (mlStudioModel) {
        // Build model paths from ML Studio's data/models directory
        const mlStudioModelsDir = path.join(process.cwd(), '..', 'MLStudio-main', 'data', 'models', mlStudioModel.modelId);
        const modelFile = fs.existsSync(path.join(mlStudioModelsDir, 'model.keras')) 
          ? path.join(mlStudioModelsDir, 'model.keras')
          : path.join(mlStudioModelsDir, 'best_model.keras');
        
        if (fs.existsSync(modelFile)) {
          activeModel = {
            modelPath: modelFile,
            labelsPath: path.join(mlStudioModelsDir, 'labels.json'),
            classes: mlStudioModel.classes || [],
            classIndices: mlStudioModel.classLabels ? Object.fromEntries(mlStudioModel.classLabels) : {},
            inputShape: [224, 224, 3],
            modelId: mlStudioModel.modelId,
            name: mlStudioModel.name || `MLStudio-${mlStudioModel.modelId}`
          };
          modelSource = 'mlstudio';
          console.log(`✓ Using active ML Studio model: ${mlStudioModel.modelId}`);
        }
      }
    }
    
    // PRIORITY 2: Fall back to EcoBuild's MLModel if no ML Studio model found
    if (!activeModel) {
      const ecobuildModel = await MLModel.findOne({ isActive: true, status: 'ready' });
      if (ecobuildModel && ecobuildModel.modelPath) {
        activeModel = {
          modelPath: ecobuildModel.modelPath,
          labelsPath: ecobuildModel.labelsPath || '',
          classes: ecobuildModel.classes || [],
          classIndices: ecobuildModel.classIndices || {},
          inputShape: ecobuildModel.inputShape || [224, 224, 3]
        };
        modelSource = 'ecobuild';
        console.log(`✓ Using active EcoBuild model: ${ecobuildModel._id}`);
      }
    }
    
    // Require an active AI model - no simulation fallback
    if (!activeModel) {
      res.status(503).json({ 
        error: 'No AI model available',
        message: 'No trained AI model is currently active. Please train and activate a model in MLStudio first.',
        modelRequired: true
      });
      return;
    }
    
    let predictionResult;
    const imagePath = path.join(UPLOADS_DIR, req.file.filename);
    
    try {
      predictionResult = await predictWithModel(imagePath, {
        modelPath: activeModel.modelPath,
        labelsPath: activeModel.labelsPath || '',
        classes: activeModel.classes || [],
        classIndices: activeModel.classIndices || {},
        inputShape: activeModel.inputShape || [224, 224, 3]
      });
    } catch (err: any) {
      console.error('Model prediction error:', err);
      res.status(503).json({ 
        error: 'AI prediction failed',
        message: err.message || 'The AI model failed to make a prediction. Please try again or retrain the model.',
        modelRequired: true
      });
      return;
    }
    
    const predictions = predictionResult.predictions;
    const topPrediction = predictionResult.topPrediction;
    const predictedKey = topPrediction.class;
    
    const material = ICE_MATERIALS[predictedKey] || ICE_MATERIALS['concrete'];

    const boundingBox = {
      x: Math.floor(Math.random() * 50) + 50,
      y: Math.floor(Math.random() * 50) + 50,
      width: Math.floor(Math.random() * 100) + 200,
      height: Math.floor(Math.random() * 100) + 200
    };

    const scanData: any = {
      imagePath: `/uploads/scans/${req.file.filename}`,
      topPrediction: {
        class: topPrediction.class,
        className: topPrediction.className,
        confidence: topPrediction.confidence
      },
      allPredictions: predictions.slice(0, 5),
      materialProperties: {
        name: material.name,
        embodiedEnergy: material.embodiedEnergy,
        embodiedCarbon: material.embodiedCarbon,
        density: material.density,
        thermalConductivity: material.thermalConductivity,
        recyclability: material.recyclability,
        alternatives: material.alternatives
      },
      boundingBox,
      modelId: activeModel ? (activeModel.modelId || (activeModel._id ? activeModel._id.toString() : 'unknown')) : 'simulation-v1',
      modelName: activeModel ? (activeModel.name || 'Trained Model') : 'EcoBuild Simulation Mode',
      confidence: topPrediction.confidence,
      status: 'completed'
    };

    if (req.userId) {
      scanData.userId = req.userId;
      scanData.projectId = req.body.projectId || null;
    } else {
      scanData.guestToken = guestToken;
    }

    let scan;
    try {
      scan = await Scan.create(scanData);
    } catch (dbErr) {
      console.error('Failed to create Scan document:', dbErr && dbErr.stack ? dbErr.stack : dbErr);
      // try to persist minimal record to avoid blocking the user
      try {
        const minimal = {
          imagePath: scanData.imagePath,
          topPrediction: scanData.topPrediction || { class: 'unknown', className: 'Unknown', confidence: 0 },
          allPredictions: scanData.allPredictions || [],
          materialProperties: scanData.materialProperties || {},
          modelId: scanData.modelId || 'unknown',
          modelName: scanData.modelName || 'unknown',
          confidence: scanData.confidence || 0,
          status: 'completed'
        };
        scan = await Scan.create(minimal);
      } catch (minimalErr) {
        console.error('Also failed to create minimal Scan document:', minimalErr && minimalErr.stack ? minimalErr.stack : minimalErr);
        throw dbErr; // rethrow original db error to be caught by outer handler
      }
    }

    if (req.userId) {
      await User.findByIdAndUpdate(req.userId, {
        $inc: { 
          totalScans: 1,
          carbonSaved: material.embodiedCarbon * 0.1
        }
      });
    }

    res.json({
      success: true,
      scanId: scan._id,
      prediction: topPrediction,
      allPredictions: predictions.slice(0, 5),
      material: {
        name: material.name,
        embodiedEnergy: material.embodiedEnergy,
        embodiedCarbon: material.embodiedCarbon,
        density: material.density,
        thermalConductivity: material.thermalConductivity,
        recyclability: material.recyclability,
        alternatives: material.alternatives.map((alt: string) => ({
          key: alt,
          name: ICE_MATERIALS[alt]?.name || alt,
          embodiedCarbon: ICE_MATERIALS[alt]?.embodiedCarbon || 0,
          embodiedEnergy: ICE_MATERIALS[alt]?.embodiedEnergy || 0
        }))
      },
      analysis: {
        imagePath: scan.imagePath,
        confidence: topPrediction.confidence,
        modelName: scanData.modelName,
        boundingBox,
        isSimulation: false
      },
      isGuest,
      scansRemaining: isGuest ? 3 - (await Scan.countDocuments({ guestToken })) : null
    });
  } catch (error) {
    try {
      const errText = (error && error.stack) ? error.stack : String(error);
      console.error('Prediction error:', errText);
      const logDir = path.join(process.cwd(), 'logs');
      if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
      const logPath = path.join(logDir, 'prediction-error.log');
      fs.appendFileSync(logPath, `${new Date().toISOString()}\n${errText}\n\n`);
    } catch (e) {
      console.error('Failed to write prediction error log:', e);
    }
    res.status(500).json({ error: 'Prediction failed' });
  }
});

router.get('/guest/:guestToken', async (req: Request, res: Response) => {
  try {
    const { guestToken } = req.params;
    
    const scans = await Scan.find({ guestToken })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      scans: scans.map(s => ({
        id: s._id,
        imagePath: s.imagePath,
        prediction: s.topPrediction,
        material: s.materialProperties,
        confidence: s.confidence,
        boundingBox: s.boundingBox,
        createdAt: s.createdAt
      })),
      count: scans.length,
      remaining: Math.max(0, 3 - scans.length)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch guest scans' });
  }
});

router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { limit = 20, projectId } = req.query;
    
    const query: any = { userId: req.userId };
    if (projectId) {
      query.projectId = projectId;
    }

    const scans = await Scan.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.json(scans.map(s => ({
      id: s._id,
      imagePath: s.imagePath,
      prediction: s.topPrediction,
      allPredictions: s.allPredictions,
      material: s.materialProperties,
      confidence: s.confidence,
      boundingBox: s.boundingBox,
      modelName: s.modelName,
      createdAt: s.createdAt
    })));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch scans' });
  }
});

router.get('/stats', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const totalScans = await Scan.countDocuments({ userId: req.userId });
    
    const scans = await Scan.find({ userId: req.userId });
    const totalCarbonAnalyzed = scans.reduce((sum, s) => 
      sum + (s.materialProperties?.embodiedCarbon || 0), 0
    );

    const materialCounts: Record<string, number> = {};
    scans.forEach(s => {
      const material = s.topPrediction?.className || 'Unknown';
      materialCounts[material] = (materialCounts[material] || 0) + 1;
    });

    const topMaterials = Object.entries(materialCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    res.json({
      totalScans,
      totalCarbonAnalyzed,
      averageConfidence: scans.length > 0 
        ? scans.reduce((sum, s) => sum + (s.confidence || 0), 0) / scans.length 
        : 0,
      topMaterials
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch scan stats' });
  }
});

router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const scan = await Scan.findOne({ 
      _id: req.params.id, 
      userId: req.userId 
    });

    if (!scan) {
      res.status(404).json({ error: 'Scan not found' });
      return;
    }

    res.json({
      id: scan._id,
      imagePath: scan.imagePath,
      wireframePath: scan.wireframePath,
      topPrediction: scan.topPrediction,
      allPredictions: scan.allPredictions,
      materialProperties: scan.materialProperties,
      boundingBox: scan.boundingBox,
      modelId: scan.modelId,
      modelName: scan.modelName,
      confidence: scan.confidence,
      projectId: scan.projectId,
      status: scan.status,
      createdAt: scan.createdAt
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch scan' });
  }
});

router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const scan = await Scan.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.userId 
    });

    if (!scan) {
      res.status(404).json({ error: 'Scan not found' });
      return;
    }

    await User.findByIdAndUpdate(req.userId, {
      $inc: { totalScans: -1 }
    });

    res.json({ message: 'Scan deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete scan' });
  }
});

export default router;
