import { Router, Response } from 'express';
import { Report, Project, Scan } from '../db/models';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const reports = await Report.find({ userId: req.userId })
      .sort({ generatedAt: -1 })
      .populate('projectId', 'name');

    res.json(reports.map(r => ({
      id: r._id,
      title: r.title,
      type: r.type,
      status: r.status,
      projectName: (r.projectId as any)?.name,
      data: r.data,
      generatedAt: r.generatedAt,
      createdAt: r.createdAt
    })));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

router.post('/generate', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { projectId, type = 'project', title } = req.body;

    let reportData = {
      totalCarbonFootprint: 0,
      totalEmbodiedEnergy: 0,
      carbonReduction: 0,
      materialsAnalyzed: 0,
      sustainabilityScore: 0,
      recommendations: [] as string[],
      chartData: null as any
    };

    if (projectId) {
      const project = await Project.findOne({ 
        _id: projectId, 
        userId: req.userId 
      });

      if (!project) {
        res.status(404).json({ error: 'Project not found' });
        return;
      }

      reportData.totalCarbonFootprint = project.totalCarbonFootprint;
      reportData.totalEmbodiedEnergy = project.totalEmbodiedEnergy;
      reportData.materialsAnalyzed = project.materials.length;
      reportData.sustainabilityScore = project.sustainabilityScore;

      const highCarbonMaterials = project.materials.filter(m => m.embodiedCarbon > 0.5);
      if (highCarbonMaterials.length > 0) {
        reportData.recommendations.push(
          `Consider replacing ${highCarbonMaterials.length} high-carbon materials with sustainable alternatives`
        );
      }

      if (project.sustainabilityScore < 70) {
        reportData.recommendations.push(
          'Project sustainability score is below target. Review material selection.'
        );
      }

      reportData.recommendations.push(
        'Use locally sourced materials to reduce transportation emissions',
        'Consider recycled or reclaimed materials where possible',
        'Optimize material quantities to reduce waste'
      );

      reportData.chartData = {
        materialBreakdown: project.materials.map(m => ({
          name: m.materialName,
          carbon: m.embodiedCarbon * m.quantity,
          energy: m.embodiedEnergy * m.quantity
        }))
      };

      reportData.carbonReduction = Math.round(reportData.totalCarbonFootprint * 0.15);
    } else {
      const scans = await Scan.find({ userId: req.userId }).limit(100);
      reportData.materialsAnalyzed = scans.length;
      reportData.totalCarbonFootprint = scans.reduce(
        (sum, s) => sum + (s.materialProperties?.embodiedCarbon || 0), 0
      );
      reportData.totalEmbodiedEnergy = scans.reduce(
        (sum, s) => sum + (s.materialProperties?.embodiedEnergy || 0), 0
      );
      reportData.sustainabilityScore = Math.round(
        100 - (reportData.totalCarbonFootprint / Math.max(scans.length, 1)) * 10
      );
      reportData.recommendations.push(
        'Continue analyzing materials to build a comprehensive sustainability profile',
        'Focus on low-carbon alternatives for frequently used materials'
      );
    }

    const report = await Report.create({
      userId: req.userId,
      projectId: projectId || null,
      title: title || `Sustainability Report - ${new Date().toLocaleDateString()}`,
      type,
      status: 'completed',
      data: reportData,
      generatedAt: new Date()
    });

    res.status(201).json({
      id: report._id,
      title: report.title,
      type: report.type,
      status: report.status,
      data: report.data,
      generatedAt: report.generatedAt
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const report = await Report.findOne({ 
      _id: req.params.id, 
      userId: req.userId 
    }).populate('projectId', 'name location');

    if (!report) {
      res.status(404).json({ error: 'Report not found' });
      return;
    }

    res.json({
      id: report._id,
      title: report.title,
      type: report.type,
      status: report.status,
      project: report.projectId,
      data: report.data,
      generatedAt: report.generatedAt,
      createdAt: report.createdAt
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch report' });
  }
});

router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const report = await Report.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.userId 
    });

    if (!report) {
      res.status(404).json({ error: 'Report not found' });
      return;
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete report' });
  }
});

router.get('/dashboard/stats', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const [projectCount, scanCount, reports] = await Promise.all([
      Project.countDocuments({ userId: req.userId }),
      Scan.countDocuments({ userId: req.userId }),
      Report.find({ userId: req.userId }).sort({ generatedAt: -1 }).limit(5)
    ]);

    const projects = await Project.find({ userId: req.userId });
    const totalCarbon = projects.reduce((sum, p) => sum + p.totalCarbonFootprint, 0);
    const avgSustainability = projects.length > 0
      ? projects.reduce((sum, p) => sum + p.sustainabilityScore, 0) / projects.length
      : 0;

    res.json({
      totalProjects: projectCount,
      totalScans: scanCount,
      totalCarbonFootprint: totalCarbon,
      averageSustainabilityScore: Math.round(avgSustainability),
      recentReports: reports.map(r => ({
        id: r._id,
        title: r.title,
        type: r.type,
        generatedAt: r.generatedAt
      }))
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

export default router;
