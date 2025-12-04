import { Router, Response } from 'express';
import { Project } from '../db/models';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const projects = await Project.find({ userId: req.userId })
      .sort({ updatedAt: -1 });

    res.json(projects.map(p => ({
      id: p._id,
      name: p.name,
      description: p.description,
      location: p.location,
      status: p.status,
      progress: p.progress,
      sustainabilityScore: p.sustainabilityScore,
      targetCompletionDate: p.targetCompletionDate,
      image: p.image,
      totalCarbonFootprint: p.totalCarbonFootprint,
      totalEmbodiedEnergy: p.totalEmbodiedEnergy,
      materialsCount: p.materials.length,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt
    })));
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const project = await Project.findOne({ 
      _id: req.params.id, 
      userId: req.userId 
    });

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    res.json({
      id: project._id,
      name: project.name,
      description: project.description,
      location: project.location,
      status: project.status,
      progress: project.progress,
      sustainabilityScore: project.sustainabilityScore,
      targetCompletionDate: project.targetCompletionDate,
      image: project.image,
      totalCarbonFootprint: project.totalCarbonFootprint,
      totalEmbodiedEnergy: project.totalEmbodiedEnergy,
      materials: project.materials,
      teamMembers: project.teamMembers,
      budget: project.budget,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { 
      name, description, location, status, 
      targetCompletionDate, image, teamMembers, budget 
    } = req.body;

    if (!name || !location) {
      res.status(400).json({ error: 'Name and location are required' });
      return;
    }

    const project = await Project.create({
      userId: req.userId,
      name,
      description,
      location,
      status: status || 'Planning',
      targetCompletionDate,
      image,
      teamMembers: teamMembers || [],
      budget
    });

    res.status(201).json({
      id: project._id,
      name: project.name,
      description: project.description,
      location: project.location,
      status: project.status,
      progress: project.progress,
      sustainabilityScore: project.sustainabilityScore,
      targetCompletionDate: project.targetCompletionDate,
      image: project.image,
      createdAt: project.createdAt
    });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { 
      name, description, location, status, progress,
      targetCompletionDate, image, teamMembers, budget 
    } = req.body;

    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { 
        name, description, location, status, progress,
        targetCompletionDate, image, teamMembers, budget 
      },
      { new: true }
    );

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    res.json({
      id: project._id,
      name: project.name,
      description: project.description,
      location: project.location,
      status: project.status,
      progress: project.progress,
      sustainabilityScore: project.sustainabilityScore,
      targetCompletionDate: project.targetCompletionDate,
      image: project.image,
      totalCarbonFootprint: project.totalCarbonFootprint,
      totalEmbodiedEnergy: project.totalEmbodiedEnergy,
      materials: project.materials,
      teamMembers: project.teamMembers,
      budget: project.budget,
      updatedAt: project.updatedAt
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update project' });
  }
});

router.post('/:id/materials', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { materialKey, materialName, quantity, unit, embodiedCarbon, embodiedEnergy } = req.body;

    const project = await Project.findOne({ 
      _id: req.params.id, 
      userId: req.userId 
    });

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    project.materials.push({
      materialKey,
      materialName,
      quantity: quantity || 1,
      unit: unit || 'kg',
      embodiedCarbon: embodiedCarbon || 0,
      embodiedEnergy: embodiedEnergy || 0
    });

    project.totalCarbonFootprint = project.materials.reduce(
      (sum, m) => sum + (m.embodiedCarbon * m.quantity), 0
    );
    project.totalEmbodiedEnergy = project.materials.reduce(
      (sum, m) => sum + (m.embodiedEnergy * m.quantity), 0
    );

    const maxCarbon = 100;
    project.sustainabilityScore = Math.max(0, Math.min(100, 
      100 - (project.totalCarbonFootprint / maxCarbon) * 10
    ));

    await project.save();

    res.json({
      id: project._id,
      materials: project.materials,
      totalCarbonFootprint: project.totalCarbonFootprint,
      totalEmbodiedEnergy: project.totalEmbodiedEnergy,
      sustainabilityScore: project.sustainabilityScore
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add material' });
  }
});

router.delete('/:id/materials/:materialIndex', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const project = await Project.findOne({ 
      _id: req.params.id, 
      userId: req.userId 
    });

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    const index = parseInt(req.params.materialIndex);
    if (index >= 0 && index < project.materials.length) {
      project.materials.splice(index, 1);
      
      project.totalCarbonFootprint = project.materials.reduce(
        (sum, m) => sum + (m.embodiedCarbon * m.quantity), 0
      );
      project.totalEmbodiedEnergy = project.materials.reduce(
        (sum, m) => sum + (m.embodiedEnergy * m.quantity), 0
      );

      await project.save();
    }

    res.json({ success: true, materials: project.materials });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove material' });
  }
});

router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const project = await Project.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.userId 
    });

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

export default router;
