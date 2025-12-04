import CustomMaterial from '../models/CustomMaterial.js';

export const ICE_MATERIALS = {
  bricks: {
    key: 'bricks',
    name: 'Bricks (common)',
    description: 'Common clay bricks used in construction',
    embodiedEnergy_MJ_kg: 3.0,
    embodiedCarbon_kgCO2_kg: 0.24,
    density_kg_m3: 1700,
    alternatives: ['concrete_block', 'aerated_block']
  },
  concrete: {
    key: 'concrete',
    name: 'Concrete (1:1.5:3 eg in-situ floor slabs, structure)',
    description: 'Standard mix concrete for structural elements',
    embodiedEnergy_MJ_kg: 0.95,
    embodiedCarbon_kgCO2_kg: 0.13,
    density_kg_m3: 2400,
    alternatives: ['rammed_earth', 'limestone_block']
  },
  aggregate: {
    key: 'aggregate',
    name: 'Aggregate',
    description: 'Crushed stone or gravel for construction',
    embodiedEnergy_MJ_kg: 0.083,
    embodiedCarbon_kgCO2_kg: 0.0048,
    density_kg_m3: 1500,
    alternatives: []
  },
  aerated_block: {
    key: 'aerated_block',
    name: 'Aerated block',
    description: 'Autoclaved aerated concrete blocks',
    embodiedEnergy_MJ_kg: 3.5,
    embodiedCarbon_kgCO2_kg: 0.30,
    density_kg_m3: 600,
    alternatives: ['concrete_block', 'bricks']
  },
  concrete_block: {
    key: 'concrete_block',
    name: 'Concrete block (Medium density 10 N/mm2)',
    description: 'Medium density concrete masonry blocks',
    embodiedEnergy_MJ_kg: 0.67,
    embodiedCarbon_kgCO2_kg: 0.073,
    density_kg_m3: 1350,
    alternatives: ['bricks', 'aerated_block']
  },
  limestone_block: {
    key: 'limestone_block',
    name: 'Limestone block',
    description: 'Natural limestone building blocks',
    embodiedEnergy_MJ_kg: 0.85,
    embodiedCarbon_kgCO2_kg: 0.017,
    density_kg_m3: 2180,
    alternatives: ['concrete', 'rammed_earth']
  },
  rammed_earth: {
    key: 'rammed_earth',
    name: 'Rammed earth (no cement content)',
    description: 'Compacted earth construction without cement',
    embodiedEnergy_MJ_kg: 0.45,
    embodiedCarbon_kgCO2_kg: 0.023,
    density_kg_m3: 1900,
    alternatives: ['concrete', 'limestone_block']
  },
  timber: {
    key: 'timber',
    name: 'Timber (general – excludes sequestration)',
    description: 'General timber products',
    embodiedEnergy_MJ_kg: 8.5,
    embodiedCarbon_kgCO2_kg: 0.46,
    density_kg_m3: 600,
    alternatives: []
  },
  steel: {
    key: 'steel',
    name: 'Steel (general - average recycled content)',
    description: 'General steel products with average recycled content',
    embodiedEnergy_MJ_kg: 20.1,
    embodiedCarbon_kgCO2_kg: 1.37,
    density_kg_m3: 7850,
    alternatives: ['timber']
  },
  glass: {
    key: 'glass',
    name: 'Glass (float)',
    description: 'Float glass for windows and facades',
    embodiedEnergy_MJ_kg: 15.0,
    embodiedCarbon_kgCO2_kg: 0.85,
    density_kg_m3: 2500,
    alternatives: []
  },
  aluminum: {
    key: 'aluminum',
    name: 'Aluminum (general)',
    description: 'General aluminum products',
    embodiedEnergy_MJ_kg: 155,
    embodiedCarbon_kgCO2_kg: 8.24,
    density_kg_m3: 2700,
    alternatives: ['steel']
  },
  insulation_mineral_wool: {
    key: 'insulation_mineral_wool',
    name: 'Mineral wool insulation',
    description: 'Mineral wool thermal insulation',
    embodiedEnergy_MJ_kg: 16.6,
    embodiedCarbon_kgCO2_kg: 1.28,
    density_kg_m3: 30,
    alternatives: ['insulation_cellulose']
  },
  insulation_cellulose: {
    key: 'insulation_cellulose',
    name: 'Cellulose insulation',
    description: 'Recycled paper cellulose insulation',
    embodiedEnergy_MJ_kg: 0.94,
    embodiedCarbon_kgCO2_kg: 0.06,
    density_kg_m3: 45,
    alternatives: ['insulation_mineral_wool']
  },
  plasterboard: {
    key: 'plasterboard',
    name: 'Plasterboard (gypsum)',
    description: 'Gypsum plasterboard for walls and ceilings',
    embodiedEnergy_MJ_kg: 6.75,
    embodiedCarbon_kgCO2_kg: 0.38,
    density_kg_m3: 800,
    alternatives: []
  },
  ceramic_tiles: {
    key: 'ceramic_tiles',
    name: 'Ceramic tiles',
    description: 'Ceramic tiles for floors and walls',
    embodiedEnergy_MJ_kg: 12.0,
    embodiedCarbon_kgCO2_kg: 0.78,
    density_kg_m3: 2000,
    alternatives: []
  }
};

export const MATERIAL_KEYS = Object.keys(ICE_MATERIALS);
export const MATERIAL_NAMES = Object.values(ICE_MATERIALS).map(m => m.name);

export async function getMaterialByKey(key) {
  if (ICE_MATERIALS[key]) {
    return ICE_MATERIALS[key];
  }
  
  try {
    const customMaterial = await CustomMaterial.findOne({ key });
    if (customMaterial) {
      return {
        key: customMaterial.key,
        name: customMaterial.name,
        description: customMaterial.description,
        embodiedEnergy_MJ_kg: customMaterial.embodiedEnergy_MJ_kg,
        embodiedCarbon_kgCO2_kg: customMaterial.embodiedCarbon_kgCO2_kg,
        density_kg_m3: customMaterial.density_kg_m3,
        alternatives: customMaterial.alternatives || [],
        isCustom: true
      };
    }
  } catch (error) {
    console.error('Error fetching custom material:', error);
  }
  
  return null;
}

export async function getAllMaterials() {
  const iceMaterials = Object.values(ICE_MATERIALS).map(m => ({
    ...m,
    isCustom: false
  }));
  
  try {
    const customMaterials = await CustomMaterial.find({});
    const customFormatted = customMaterials.map(m => ({
      key: m.key,
      name: m.name,
      description: m.description,
      embodiedEnergy_MJ_kg: m.embodiedEnergy_MJ_kg,
      embodiedCarbon_kgCO2_kg: m.embodiedCarbon_kgCO2_kg,
      density_kg_m3: m.density_kg_m3,
      alternatives: m.alternatives || [],
      isCustom: true
    }));
    
    return [...iceMaterials, ...customFormatted];
  } catch (error) {
    console.error('Error fetching custom materials:', error);
    return iceMaterials;
  }
}

export function getMaterialByName(name) {
  return Object.values(ICE_MATERIALS).find(m => m.name === name) || null;
}
