import CustomMaterial from '../models/CustomMaterial.js';

export const ICE_MATERIALS = {
  aggregate: {
    key: 'aggregate',
    name: 'Aggregate',
    description: 'Crushed stone or gravel for construction',
    embodiedEnergy_MJ_kg: 0.083,
    embodiedCarbon_kgCO2_kg: 0.0048,
    density_kg_m3: 2240,
    alternatives: []
  },
  concrete: {
    key: 'concrete',
    name: 'Concrete (1:1.5:3 eg in-situ floor slabs, structure)',
    description: 'Standard mix concrete for structural elements',
    embodiedEnergy_MJ_kg: 1.11,
    embodiedCarbon_kgCO2_kg: 0.159,
    density_kg_m3: 2400,
    alternatives: ['rammed_earth', 'limestone_block']
  },
  concrete_pfa: {
    key: 'concrete_pfa',
    name: 'Concrete with 25% PFA RC40',
    description: 'Concrete with pulverized fuel ash for reduced carbon',
    embodiedEnergy_MJ_kg: 0.97,
    embodiedCarbon_kgCO2_kg: 0.132,
    density_kg_m3: 2400,
    alternatives: ['concrete', 'concrete_ggbs']
  },
  concrete_ggbs: {
    key: 'concrete_ggbs',
    name: 'Concrete with 50% GGBS RC40',
    description: 'Concrete with ground granulated blast-furnace slag',
    embodiedEnergy_MJ_kg: 0.88,
    embodiedCarbon_kgCO2_kg: 0.101,
    density_kg_m3: 2400,
    alternatives: ['concrete', 'concrete_pfa']
  },
  bricks: {
    key: 'bricks',
    name: 'Bricks (common)',
    description: 'Common clay bricks used in construction',
    embodiedEnergy_MJ_kg: 3.0,
    embodiedCarbon_kgCO2_kg: 0.24,
    density_kg_m3: 1700,
    alternatives: ['concrete_block', 'aerated_block']
  },
  concrete_block: {
    key: 'concrete_block',
    name: 'Concrete block (Medium density 10 N/mm2)',
    description: 'Medium density concrete masonry blocks',
    embodiedEnergy_MJ_kg: 0.67,
    embodiedCarbon_kgCO2_kg: 0.073,
    density_kg_m3: 1450,
    alternatives: ['bricks', 'aerated_block']
  },
  aerated_block: {
    key: 'aerated_block',
    name: 'Aerated block',
    description: 'Autoclaved aerated concrete blocks',
    embodiedEnergy_MJ_kg: 3.5,
    embodiedCarbon_kgCO2_kg: 0.3,
    density_kg_m3: 750,
    alternatives: ['concrete_block', 'bricks']
  },
  rammed_earth: {
    key: 'rammed_earth',
    name: 'Rammed earth (no cement content)',
    description: 'Compacted earth construction without cement',
    embodiedEnergy_MJ_kg: 0.45,
    embodiedCarbon_kgCO2_kg: 0.023,
    density_kg_m3: 1460,
    alternatives: ['concrete', 'limestone_block']
  },
  limestone_block: {
    key: 'limestone_block',
    name: 'Limestone block',
    description: 'Natural limestone building blocks',
    embodiedEnergy_MJ_kg: 0.85,
    embodiedCarbon_kgCO2_kg: null,
    density_kg_m3: 2180,
    alternatives: ['concrete', 'rammed_earth']
  },
  marble: {
    key: 'marble',
    name: 'Marble',
    description: 'Natural marble for flooring and cladding',
    embodiedEnergy_MJ_kg: 2.0,
    embodiedCarbon_kgCO2_kg: 0.116,
    density_kg_m3: 2500,
    alternatives: ['terrazzo_tiles', 'ceramic_tiles']
  },
  cement_mortar: {
    key: 'cement_mortar',
    name: 'Cement mortar (1:3)',
    description: 'Cement and sand mortar mix',
    embodiedEnergy_MJ_kg: 1.33,
    embodiedCarbon_kgCO2_kg: 0.208,
    density_kg_m3: null,
    alternatives: []
  },
  steel: {
    key: 'steel',
    name: 'Steel (general - average recycled content)',
    description: 'General steel products with average recycled content',
    embodiedEnergy_MJ_kg: 20.1,
    embodiedCarbon_kgCO2_kg: 1.37,
    density_kg_m3: 7800,
    alternatives: ['timber']
  },
  steel_section: {
    key: 'steel_section',
    name: 'Steel (section - average recycled content)',
    description: 'Structural steel sections',
    embodiedEnergy_MJ_kg: 21.5,
    embodiedCarbon_kgCO2_kg: 1.42,
    density_kg_m3: 7800,
    alternatives: ['steel', 'timber']
  },
  steel_pipe: {
    key: 'steel_pipe',
    name: 'Steel (pipe - average recycled content)',
    description: 'Steel pipes and tubes',
    embodiedEnergy_MJ_kg: 19.8,
    embodiedCarbon_kgCO2_kg: 1.37,
    density_kg_m3: 7800,
    alternatives: ['pvc_pipe']
  },
  stainless_steel: {
    key: 'stainless_steel',
    name: 'Stainless steel',
    description: 'Stainless steel products',
    embodiedEnergy_MJ_kg: 56.7,
    embodiedCarbon_kgCO2_kg: 6.15,
    density_kg_m3: null,
    alternatives: ['steel', 'aluminum']
  },
  timber: {
    key: 'timber',
    name: 'Timber (general - excludes sequestration)',
    description: 'General timber products',
    embodiedEnergy_MJ_kg: 10.0,
    embodiedCarbon_kgCO2_kg: 0.72,
    density_kg_m3: 480,
    density_kg_m3_max: 720,
    alternatives: ['steel']
  },
  glue_laminated_timber: {
    key: 'glue_laminated_timber',
    name: 'Glue laminated timber',
    description: 'Engineered wood product',
    embodiedEnergy_MJ_kg: 12.0,
    embodiedCarbon_kgCO2_kg: 0.87,
    density_kg_m3: null,
    alternatives: ['timber', 'steel']
  },
  sawn_hardwood: {
    key: 'sawn_hardwood',
    name: 'Sawn hardwood',
    description: 'Sawn hardwood timber',
    embodiedEnergy_MJ_kg: 10.4,
    embodiedCarbon_kgCO2_kg: 0.86,
    density_kg_m3: 700,
    density_kg_m3_max: 800,
    alternatives: ['timber']
  },
  insulation_cellulose: {
    key: 'insulation_cellulose',
    name: 'Cellulose insulation (loose fill)',
    description: 'Recycled paper cellulose insulation',
    embodiedEnergy_MJ_kg: 3.3,
    embodiedCarbon_kgCO2_kg: null,
    density_kg_m3: 43,
    alternatives: ['insulation_rockwool', 'insulation_glass_fibre']
  },
  insulation_cork: {
    key: 'insulation_cork',
    name: 'Cork insulation',
    description: 'Natural cork insulation material',
    embodiedEnergy_MJ_kg: 26.0,
    embodiedCarbon_kgCO2_kg: null,
    density_kg_m3: 160,
    alternatives: ['insulation_cellulose']
  },
  insulation_glass_fibre: {
    key: 'insulation_glass_fibre',
    name: 'Glass fibre insulation (glass wool)',
    description: 'Glass wool thermal insulation',
    embodiedEnergy_MJ_kg: 28.0,
    embodiedCarbon_kgCO2_kg: 1.35,
    density_kg_m3: 12,
    alternatives: ['insulation_rockwool', 'insulation_cellulose']
  },
  insulation_cellular_glass: {
    key: 'insulation_cellular_glass',
    name: 'Cellular glass insulation',
    description: 'Foamed glass insulation material',
    embodiedEnergy_MJ_kg: 27.0,
    embodiedCarbon_kgCO2_kg: null,
    density_kg_m3: null,
    alternatives: ['insulation_rockwool', 'insulation_eps']
  },
  insulation_flax: {
    key: 'insulation_flax',
    name: 'Flax insulation',
    description: 'Natural flax fibre insulation',
    embodiedEnergy_MJ_kg: 39.5,
    embodiedCarbon_kgCO2_kg: 1.7,
    density_kg_m3: 30,
    alternatives: ['insulation_cellulose', 'insulation_wool']
  },
  insulation_wool: {
    key: 'insulation_wool',
    name: 'Wool (recycled) insulation',
    description: 'Recycled wool thermal insulation',
    embodiedEnergy_MJ_kg: 20.9,
    embodiedCarbon_kgCO2_kg: null,
    density_kg_m3: 25,
    alternatives: ['insulation_flax', 'insulation_cellulose']
  },
  straw_bale: {
    key: 'straw_bale',
    name: 'Straw bale',
    description: 'Compressed straw bale for construction',
    embodiedEnergy_MJ_kg: 0.91,
    embodiedCarbon_kgCO2_kg: null,
    density_kg_m3: 100,
    density_kg_m3_max: 110,
    alternatives: ['rammed_earth', 'timber']
  },
  insulation_rockwool: {
    key: 'insulation_rockwool',
    name: 'Rockwool (slab)',
    description: 'Mineral wool insulation slabs',
    embodiedEnergy_MJ_kg: 16.8,
    embodiedCarbon_kgCO2_kg: 1.05,
    density_kg_m3: 24,
    alternatives: ['insulation_glass_fibre', 'insulation_cellulose']
  },
  insulation_eps: {
    key: 'insulation_eps',
    name: 'Expanded Polystyrene insulation',
    description: 'EPS rigid foam insulation',
    embodiedEnergy_MJ_kg: 88.6,
    embodiedCarbon_kgCO2_kg: 2.55,
    density_kg_m3: 15,
    density_kg_m3_max: 30,
    alternatives: ['insulation_polyurethane', 'insulation_rockwool']
  },
  insulation_polyurethane: {
    key: 'insulation_polyurethane',
    name: 'Polyurethane insulation (rigid foam)',
    description: 'PUR rigid foam insulation',
    embodiedEnergy_MJ_kg: 101.5,
    embodiedCarbon_kgCO2_kg: 3.48,
    density_kg_m3: 30,
    alternatives: ['insulation_eps', 'insulation_rockwool']
  },
  insulation_woodwool: {
    key: 'insulation_woodwool',
    name: 'Woodwool board insulation',
    description: 'Wood wool cement board insulation',
    embodiedEnergy_MJ_kg: 20.0,
    embodiedCarbon_kgCO2_kg: 0.98,
    density_kg_m3: null,
    alternatives: ['insulation_cellulose']
  },
  slate_uk: {
    key: 'slate_uk',
    name: 'Slate (UK)',
    description: 'UK sourced natural slate for roofing',
    embodiedEnergy_MJ_kg: 0.1,
    embodiedCarbon_kgCO2_kg: 0.006,
    density_kg_m3: 1600,
    alternatives: ['clay_tile']
  },
  slate_imported: {
    key: 'slate_imported',
    name: 'Slate (imported)',
    description: 'Imported natural slate',
    embodiedEnergy_MJ_kg: 1.0,
    embodiedCarbon_kgCO2_kg: 0.058,
    density_kg_m3: 1600,
    alternatives: ['slate_uk', 'clay_tile']
  },
  clay_tile: {
    key: 'clay_tile',
    name: 'Clay tile',
    description: 'Clay roofing tiles',
    embodiedEnergy_MJ_kg: 6.5,
    embodiedCarbon_kgCO2_kg: 0.45,
    density_kg_m3: 1900,
    alternatives: ['slate_uk', 'slate_imported']
  },
  aluminum: {
    key: 'aluminum',
    name: 'Aluminium (general & incl 33% recycled)',
    description: 'General aluminum products with recycled content',
    embodiedEnergy_MJ_kg: 155.0,
    embodiedCarbon_kgCO2_kg: 8.24,
    density_kg_m3: 2700,
    alternatives: ['steel']
  },
  bitumen: {
    key: 'bitumen',
    name: 'Bitumen (general)',
    description: 'Bitumen for roofing and waterproofing',
    embodiedEnergy_MJ_kg: 51.0,
    embodiedCarbon_kgCO2_kg: 0.38,
    embodiedCarbon_kgCO2_kg_max: 0.43,
    density_kg_m3: null,
    alternatives: []
  },
  hardboard: {
    key: 'hardboard',
    name: 'Hardboard',
    description: 'High density fibreboard',
    embodiedEnergy_MJ_kg: 16.0,
    embodiedCarbon_kgCO2_kg: 1.05,
    density_kg_m3: 600,
    density_kg_m3_max: 1000,
    alternatives: ['mdf', 'plywood']
  },
  mdf: {
    key: 'mdf',
    name: 'MDF',
    description: 'Medium density fibreboard',
    embodiedEnergy_MJ_kg: 11.0,
    embodiedCarbon_kgCO2_kg: 0.72,
    density_kg_m3: 680,
    density_kg_m3_max: 760,
    alternatives: ['hardboard', 'plywood']
  },
  osb: {
    key: 'osb',
    name: 'OSB',
    description: 'Oriented strand board',
    embodiedEnergy_MJ_kg: 15.0,
    embodiedCarbon_kgCO2_kg: 0.96,
    density_kg_m3: 640,
    alternatives: ['plywood', 'mdf']
  },
  plywood: {
    key: 'plywood',
    name: 'Plywood',
    description: 'Plywood sheets',
    embodiedEnergy_MJ_kg: 15.0,
    embodiedCarbon_kgCO2_kg: 1.07,
    density_kg_m3: 540,
    density_kg_m3_max: 700,
    alternatives: ['osb', 'mdf']
  },
  plasterboard: {
    key: 'plasterboard',
    name: 'Plasterboard',
    description: 'Gypsum plasterboard for walls and ceilings',
    embodiedEnergy_MJ_kg: 6.75,
    embodiedCarbon_kgCO2_kg: 0.38,
    density_kg_m3: 800,
    alternatives: []
  },
  gypsum_plaster: {
    key: 'gypsum_plaster',
    name: 'Gypsum plaster',
    description: 'Gypsum-based plaster',
    embodiedEnergy_MJ_kg: 1.8,
    embodiedCarbon_kgCO2_kg: 0.12,
    density_kg_m3: 1120,
    alternatives: ['cement_mortar']
  },
  glass: {
    key: 'glass',
    name: 'Glass',
    description: 'Float glass for windows and facades',
    embodiedEnergy_MJ_kg: 15.0,
    embodiedCarbon_kgCO2_kg: 0.85,
    density_kg_m3: 2500,
    alternatives: []
  },
  pvc: {
    key: 'pvc',
    name: 'PVC (general)',
    description: 'General PVC plastic products',
    embodiedEnergy_MJ_kg: 77.2,
    embodiedCarbon_kgCO2_kg: 28.1,
    density_kg_m3: 1380,
    alternatives: []
  },
  pvc_pipe: {
    key: 'pvc_pipe',
    name: 'PVC pipe',
    description: 'PVC pipes for drainage and plumbing',
    embodiedEnergy_MJ_kg: 67.5,
    embodiedCarbon_kgCO2_kg: 24.4,
    density_kg_m3: 1400,
    alternatives: ['steel_pipe']
  },
  linoleum: {
    key: 'linoleum',
    name: 'Linoleum',
    description: 'Natural linoleum floor covering',
    embodiedEnergy_MJ_kg: 25.0,
    embodiedCarbon_kgCO2_kg: 1.21,
    density_kg_m3: 1200,
    alternatives: ['pvc_vinyl_flooring']
  },
  pvc_vinyl_flooring: {
    key: 'pvc_vinyl_flooring',
    name: 'PVC Vinyl flooring',
    description: 'Vinyl floor covering',
    embodiedEnergy_MJ_kg: 65.64,
    embodiedCarbon_kgCO2_kg: 2.92,
    density_kg_m3: 1200,
    alternatives: ['linoleum']
  },
  terrazzo_tiles: {
    key: 'terrazzo_tiles',
    name: 'Terrazzo tiles',
    description: 'Terrazzo floor and wall tiles',
    embodiedEnergy_MJ_kg: 1.4,
    embodiedCarbon_kgCO2_kg: 0.12,
    density_kg_m3: 1750,
    alternatives: ['ceramic_tiles', 'marble']
  },
  ceramic_tiles: {
    key: 'ceramic_tiles',
    name: 'Ceramic tiles',
    description: 'Ceramic tiles for floors and walls',
    embodiedEnergy_MJ_kg: 12.0,
    embodiedCarbon_kgCO2_kg: 0.74,
    density_kg_m3: 2000,
    alternatives: ['terrazzo_tiles']
  },
  wool_carpet: {
    key: 'wool_carpet',
    name: 'Wool carpet',
    description: 'Natural wool carpet flooring',
    embodiedEnergy_MJ_kg: 106.0,
    embodiedCarbon_kgCO2_kg: 5.53,
    density_kg_m3: null,
    alternatives: ['linoleum']
  },
  iron: {
    key: 'iron',
    name: 'Iron (general & average)',
    description: 'Cast and wrought iron products',
    embodiedEnergy_MJ_kg: 25.0,
    embodiedCarbon_kgCO2_kg: 1.91,
    density_kg_m3: 7870,
    alternatives: ['steel']
  },
  copper: {
    key: 'copper',
    name: 'Copper (average incl. 37% recycled)',
    description: 'Copper with recycled content',
    embodiedEnergy_MJ_kg: 42.0,
    embodiedCarbon_kgCO2_kg: 2.6,
    density_kg_m3: 8600,
    alternatives: ['aluminum']
  },
  lead: {
    key: 'lead',
    name: 'Lead (incl 61% recycled)',
    description: 'Lead with recycled content for roofing',
    embodiedEnergy_MJ_kg: 25.21,
    embodiedCarbon_kgCO2_kg: 1.57,
    density_kg_m3: 11340,
    alternatives: ['copper']
  },
  ceramic_sanitary_ware: {
    key: 'ceramic_sanitary_ware',
    name: 'Ceramic sanitary ware',
    description: 'Ceramic bathroom fixtures',
    embodiedEnergy_MJ_kg: 29.0,
    embodiedCarbon_kgCO2_kg: 1.51,
    density_kg_m3: null,
    alternatives: []
  },
  vitrified_clay_pipe: {
    key: 'vitrified_clay_pipe',
    name: 'Vitrified clay pipe',
    description: 'Clay drainage pipes',
    embodiedEnergy_MJ_kg: 7.9,
    embodiedCarbon_kgCO2_kg: 0.52,
    density_kg_m3: null,
    alternatives: ['pvc_pipe']
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
