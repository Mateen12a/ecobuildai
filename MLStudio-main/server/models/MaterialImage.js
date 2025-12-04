import mongoose from 'mongoose';

const materialImageSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  material_key: { type: String, required: true, index: true },
  material_official: { type: String, required: true },
  data: { type: Buffer, required: true },
  content_type: { type: String, default: 'image/jpeg' },
  width: { type: Number, default: 224 },
  height: { type: Number, default: 224 },
  embodied_energy_mj_per_kg: { type: Number, default: null },
  embodied_energy_mj_per_m2: { type: Number, default: null },
  embodied_energy_mj_per_item: { type: Number, default: null },
  embodied_carbon_kgco2_kg: { type: Number, default: null },
  embodied_carbon_kgco2_m2: { type: Number, default: null },
  embodied_carbon_kgco2_item: { type: Number, default: null },
  density_kg_m3: { type: Number, default: null },
  weight_kg_m2: { type: Number, default: null },
  source: { type: String, default: null },
  original_url: { type: String, default: null },
  segmentation_mask: { type: Buffer, default: null },
  regions: [{
    material_key: String,
    bbox: [Number],
    confidence: Number
  }],
  createdAt: { type: Date, default: Date.now }
});

materialImageSchema.index({ material_key: 1, createdAt: -1 });

export default mongoose.model('MaterialImage', materialImageSchema);
