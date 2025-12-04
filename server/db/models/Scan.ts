import mongoose, { Schema, Document } from 'mongoose';

export interface IScanPrediction {
  class: string;
  className: string;
  confidence: number;
}

export interface IScan extends Document {
  userId: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  imagePath: string;
  topPrediction: IScanPrediction;
  allPredictions: IScanPrediction[];
  materialProperties: {
    name: string;
    embodiedEnergy: number;
    embodiedCarbon: number;
    density: number;
    alternatives: string[];
  };
  modelId: string;
  modelName: string;
  confidence: number;
  createdAt: Date;
}

const ScanPredictionSchema = new Schema({
  class: { type: String, required: true },
  className: { type: String, required: true },
  confidence: { type: Number, required: true }
}, { _id: false });

const ScanSchema = new Schema<IScan>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  projectId: { type: Schema.Types.ObjectId, ref: 'Project' },
  imagePath: { type: String, required: true },
  topPrediction: { type: ScanPredictionSchema, required: true },
  allPredictions: [ScanPredictionSchema],
  materialProperties: {
    name: { type: String },
    embodiedEnergy: { type: Number },
    embodiedCarbon: { type: Number },
    density: { type: Number },
    alternatives: [{ type: String }]
  },
  modelId: { type: String },
  modelName: { type: String },
  confidence: { type: Number }
}, {
  timestamps: true
});

ScanSchema.index({ userId: 1 });
ScanSchema.index({ projectId: 1 });
ScanSchema.index({ createdAt: -1 });

export const Scan = mongoose.model<IScan>('Scan', ScanSchema);
