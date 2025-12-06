import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';

const router = Router();

const materialImageSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  material_key: { type: String, required: true, index: true },
  material_official: { type: String, required: true },
  data: { type: Buffer, required: true },
  content_type: { type: String, default: 'image/jpeg' },
  width: { type: Number, default: 224 },
  height: { type: Number, default: 224 },
  embodied_energy_mj_per_kg: { type: Number, default: null },
  embodied_carbon_kgco2_kg: { type: Number, default: null },
  density_kg_m3: { type: Number, default: null },
  source: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});

const MaterialImage = mongoose.models.MaterialImage || mongoose.model('MaterialImage', materialImageSchema);

const ICE_MATERIALS = {
  bricks: {
    key: 'bricks',
    name: 'Bricks (common)',
    description: 'Common clay bricks used in construction',
    category: 'Masonry',
    embodiedEnergy: 3.0,
    embodiedCarbon: 0.24,
    density: 1700,
    impactLevel: 'Medium',
    alternatives: ['concrete_block', 'aerated_block']
  },
  concrete: {
    key: 'concrete',
    name: 'Concrete (1:1.5:3)',
    description: 'Standard mix concrete for structural elements',
    category: 'Concrete',
    embodiedEnergy: 0.95,
    embodiedCarbon: 0.13,
    density: 2400,
    impactLevel: 'High',
    alternatives: ['rammed_earth', 'limestone_block']
  },
  aggregate: {
    key: 'aggregate',
    name: 'Aggregate',
    description: 'Crushed stone or gravel for construction',
    category: 'Aggregate',
    embodiedEnergy: 0.083,
    embodiedCarbon: 0.0048,
    density: 1500,
    impactLevel: 'Very Low',
    alternatives: []
  },
  aerated_block: {
    key: 'aerated_block',
    name: 'Aerated block',
    description: 'Autoclaved aerated concrete blocks',
    category: 'Masonry',
    embodiedEnergy: 3.5,
    embodiedCarbon: 0.30,
    density: 600,
    impactLevel: 'Medium',
    alternatives: ['concrete_block', 'bricks']
  },
  concrete_block: {
    key: 'concrete_block',
    name: 'Concrete block (Medium density)',
    description: 'Medium density concrete masonry blocks',
    category: 'Masonry',
    embodiedEnergy: 0.67,
    embodiedCarbon: 0.073,
    density: 1350,
    impactLevel: 'Low',
    alternatives: ['bricks', 'aerated_block']
  },
  limestone_block: {
    key: 'limestone_block',
    name: 'Limestone block',
    description: 'Natural limestone building blocks',
    category: 'Stone',
    embodiedEnergy: 0.85,
    embodiedCarbon: 0.017,
    density: 2180,
    impactLevel: 'Very Low',
    alternatives: ['concrete', 'rammed_earth']
  },
  rammed_earth: {
    key: 'rammed_earth',
    name: 'Rammed earth',
    description: 'Compacted earth construction without cement',
    category: 'Earth',
    embodiedEnergy: 0.45,
    embodiedCarbon: 0.023,
    density: 1900,
    impactLevel: 'Very Low',
    alternatives: ['concrete', 'limestone_block']
  },
  timber: {
    key: 'timber',
    name: 'Timber (general)',
    description: 'General timber products',
    category: 'Wood',
    embodiedEnergy: 8.5,
    embodiedCarbon: 0.46,
    density: 600,
    impactLevel: 'Low',
    alternatives: []
  },
  steel: {
    key: 'steel',
    name: 'Steel (general)',
    description: 'General steel products with average recycled content',
    category: 'Metal',
    embodiedEnergy: 20.1,
    embodiedCarbon: 1.37,
    density: 7850,
    impactLevel: 'High',
    alternatives: ['timber']
  },
  glass: {
    key: 'glass',
    name: 'Glass (float)',
    description: 'Float glass for windows and facades',
    category: 'Glass',
    embodiedEnergy: 15.0,
    embodiedCarbon: 0.85,
    density: 2500,
    impactLevel: 'Medium',
    alternatives: []
  },
  aluminum: {
    key: 'aluminum',
    name: 'Aluminum (general)',
    description: 'General aluminum products',
    category: 'Metal',
    embodiedEnergy: 155,
    embodiedCarbon: 8.24,
    density: 2700,
    impactLevel: 'Very High',
    alternatives: ['steel']
  },
  insulation_mineral_wool: {
    key: 'insulation_mineral_wool',
    name: 'Mineral wool insulation',
    description: 'Mineral wool thermal insulation',
    category: 'Insulation',
    embodiedEnergy: 16.6,
    embodiedCarbon: 1.28,
    density: 30,
    impactLevel: 'Medium',
    alternatives: ['insulation_cellulose']
  },
  insulation_cellulose: {
    key: 'insulation_cellulose',
    name: 'Cellulose insulation',
    description: 'Recycled paper cellulose insulation',
    category: 'Insulation',
    embodiedEnergy: 0.94,
    embodiedCarbon: 0.06,
    density: 45,
    impactLevel: 'Very Low',
    alternatives: ['insulation_mineral_wool']
  },
  plasterboard: {
    key: 'plasterboard',
    name: 'Plasterboard (gypsum)',
    description: 'Gypsum plasterboard for walls and ceilings',
    category: 'Finishing',
    embodiedEnergy: 6.75,
    embodiedCarbon: 0.38,
    density: 800,
    impactLevel: 'Medium',
    alternatives: []
  },
  ceramic_tiles: {
    key: 'ceramic_tiles',
    name: 'Ceramic tiles',
    description: 'Ceramic tiles for floors and walls',
    category: 'Finishing',
    embodiedEnergy: 12.0,
    embodiedCarbon: 0.78,
    density: 2000,
    impactLevel: 'Medium',
    alternatives: []
  }
};

function getImpactColor(level: string) {
  switch (level) {
    case 'Very Low': return { bg: 'bg-green-100', text: 'text-green-700' };
    case 'Low': return { bg: 'bg-green-100', text: 'text-green-700' };
    case 'Medium': return { bg: 'bg-yellow-100', text: 'text-yellow-700' };
    case 'High': return { bg: 'bg-red-100', text: 'text-red-700' };
    case 'Very High': return { bg: 'bg-red-200', text: 'text-red-800' };
    default: return { bg: 'bg-gray-100', text: 'text-gray-700' };
  }
}

router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, search } = req.query;
    
    let materials = Object.values(ICE_MATERIALS);
    
    if (category && typeof category === 'string') {
      materials = materials.filter(m => m.category.toLowerCase() === category.toLowerCase());
    }
    
    if (search && typeof search === 'string') {
      const searchLower = search.toLowerCase();
      materials = materials.filter(m => 
        m.name.toLowerCase().includes(searchLower) ||
        m.description.toLowerCase().includes(searchLower) ||
        m.category.toLowerCase().includes(searchLower)
      );
    }

    res.json(materials.map(m => ({
      id: m.key,
      key: m.key,
      name: m.name,
      description: m.description,
      category: m.category,
      embodiedEnergy: m.embodiedEnergy,
      embodiedCarbon: m.embodiedCarbon,
      density: m.density,
      impactLevel: m.impactLevel,
      impactColor: getImpactColor(m.impactLevel),
      alternatives: m.alternatives
    })));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch materials' });
  }
});

router.get('/categories', async (req: Request, res: Response) => {
  try {
    const categories = [...new Set(Object.values(ICE_MATERIALS).map(m => m.category))];
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const material = ICE_MATERIALS[req.params.id as keyof typeof ICE_MATERIALS];
    
    if (!material) {
      res.status(404).json({ error: 'Material not found' });
      return;
    }

    const alternativeMaterials = material.alternatives
      .map(key => ICE_MATERIALS[key as keyof typeof ICE_MATERIALS])
      .filter(Boolean);

    res.json({
      id: material.key,
      key: material.key,
      name: material.name,
      description: material.description,
      category: material.category,
      embodiedEnergy: material.embodiedEnergy,
      embodiedCarbon: material.embodiedCarbon,
      density: material.density,
      impactLevel: material.impactLevel,
      impactColor: getImpactColor(material.impactLevel),
      alternatives: alternativeMaterials.map(alt => ({
        id: alt.key,
        key: alt.key,
        name: alt.name,
        embodiedCarbon: alt.embodiedCarbon,
        impactLevel: alt.impactLevel
      }))
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch material' });
  }
});

router.get('/:id/compare', async (req: Request, res: Response) => {
  try {
    const material = ICE_MATERIALS[req.params.id as keyof typeof ICE_MATERIALS];
    
    if (!material) {
      res.status(404).json({ error: 'Material not found' });
      return;
    }

    const allMaterials = Object.values(ICE_MATERIALS);
    const categoryMaterials = allMaterials.filter(m => m.category === material.category);
    
    const avgCarbon = categoryMaterials.reduce((sum, m) => sum + m.embodiedCarbon, 0) / categoryMaterials.length;
    const avgEnergy = categoryMaterials.reduce((sum, m) => sum + m.embodiedEnergy, 0) / categoryMaterials.length;

    res.json({
      material: {
        name: material.name,
        embodiedCarbon: material.embodiedCarbon,
        embodiedEnergy: material.embodiedEnergy
      },
      categoryAverage: {
        category: material.category,
        embodiedCarbon: avgCarbon,
        embodiedEnergy: avgEnergy
      },
      carbonDifference: ((material.embodiedCarbon - avgCarbon) / avgCarbon) * 100,
      energyDifference: ((material.embodiedEnergy - avgEnergy) / avgEnergy) * 100
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to compare materials' });
  }
});

router.get('/with-images/list', async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 10);
    
    const materialsWithImages = await MaterialImage.aggregate([
      {
        $group: {
          _id: '$material_key',
          material_official: { $first: '$material_official' },
          imageId: { $first: '$_id' },
          content_type: { $first: '$content_type' },
          embodied_carbon: { $first: '$embodied_carbon_kgco2_kg' },
          embodied_energy: { $first: '$embodied_energy_mj_per_kg' },
          density: { $first: '$density_kg_m3' },
          count: { $sum: 1 },
          createdAt: { $max: '$createdAt' }
        }
      },
      { $sort: { count: -1, createdAt: -1 } },
      { $limit: limit }
    ]);

    const result = materialsWithImages.map(m => {
      const iceMaterial = ICE_MATERIALS[m._id as keyof typeof ICE_MATERIALS];
      return {
        key: m._id,
        name: m.material_official || iceMaterial?.name || m._id,
        description: iceMaterial?.description || `Training material: ${m.material_official}`,
        category: iceMaterial?.category || 'Training',
        embodiedEnergy: m.embodied_energy || iceMaterial?.embodiedEnergy || 0,
        embodiedCarbon: m.embodied_carbon || iceMaterial?.embodiedCarbon || 0,
        density: m.density || iceMaterial?.density || 0,
        impactLevel: iceMaterial?.impactLevel || 'Medium',
        impactColor: getImpactColor(iceMaterial?.impactLevel || 'Medium'),
        imageId: m.imageId.toString(),
        imageCount: m.count,
        hasImage: true
      };
    });

    res.json(result);
  } catch (error) {
    console.error('Failed to fetch materials with images:', error);
    res.status(500).json({ error: 'Failed to fetch materials with images' });
  }
});

router.get('/image/:id', async (req: Request, res: Response) => {
  try {
    const image = await MaterialImage.findById(req.params.id).select('data content_type');
    
    if (!image || !image.data) {
      res.status(404).json({ error: 'Image not found' });
      return;
    }

    res.set('Content-Type', image.content_type || 'image/jpeg');
    res.set('Cache-Control', 'public, max-age=86400');
    res.send(image.data);
  } catch (error) {
    console.error('Failed to fetch material image:', error);
    res.status(500).json({ error: 'Failed to fetch image' });
  }
});

router.get('/by-key/:materialKey/images', async (req: Request, res: Response) => {
  try {
    const { materialKey } = req.params;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 10);
    
    const images = await MaterialImage.find({ material_key: materialKey })
      .select('_id filename material_official content_type createdAt')
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json(images.map(img => ({
      id: img._id.toString(),
      filename: img.filename,
      materialOfficial: img.material_official,
      contentType: img.content_type
    })));
  } catch (error) {
    console.error('Failed to fetch material images:', error);
    res.status(500).json({ error: 'Failed to fetch material images' });
  }
});

export default router;
