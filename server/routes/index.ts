import { Router } from 'express';
import authRoutes from './auth';
import projectRoutes from './projects';
import materialRoutes from './materials';
import scanRoutes from './scans';
import reportRoutes from './reports';
import modelRoutes from './models';

const router = Router();

router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/materials', materialRoutes);
router.use('/scans', scanRoutes);
router.use('/reports', reportRoutes);
router.use('/models', modelRoutes);

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
