import mongoose from 'mongoose';

const customMaterialSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  embodiedEnergy_MJ_kg: { type: Number, default: 0 },
  embodiedCarbon_kgCO2_kg: { type: Number, default: 0 },
  density_kg_m3: { type: Number, default: 0 },
  alternatives: [{ type: String }],
  isCustom: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('CustomMaterial', customMaterialSchema);
