import { Router, Response } from 'express';
import { MLModel } from '../db/models';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

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

export default router;
