import mongoose, { Schema, Document } from 'mongoose';

export interface IScanPrediction {
  class: string;
  className: string;
  confidence: number;
}

export interface IScan extends Document {
  userId?: mongoose.Types.ObjectId;
  guestToken?: string;
  projectId?: mongoose.Types.ObjectId;
  imagePath: string;
  wireframePath?: string;
  topPrediction: IScanPrediction;
  allPredictions: IScanPrediction[];
  materialProperties: {
    name: string;
    embodiedEnergy: number;
    embodiedCarbon: number;
    density: number;
    thermalConductivity?: number;
    recyclability?: string;
    alternatives: string[];
  };
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  modelId: string;
  modelName: string;
  confidence: number;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
}

const ScanPredictionSchema = new Schema({
  class: { type: String, required: true },
  className: { type: String, required: true },
  confidence: { type: Number, required: true }
}, { _id: false });

const BoundingBoxSchema = new Schema({
  x: { type: Number },
  y: { type: Number },
  width: { type: Number },
  height: { type: Number }
}, { _id: false });

const ScanSchema = new Schema<IScan>({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  guestToken: { type: String, sparse: true },
  projectId: { type: Schema.Types.ObjectId, ref: 'Project' },
  imagePath: { type: String, required: true },
  wireframePath: { type: String },
  topPrediction: { type: ScanPredictionSchema, required: true },
  allPredictions: [ScanPredictionSchema],
  materialProperties: {
    name: { type: String },
    embodiedEnergy: { type: Number },
    embodiedCarbon: { type: Number },
    density: { type: Number },
    thermalConductivity: { type: Number },
    recyclability: { type: String },
    alternatives: [{ type: String }]
  },
  boundingBox: { type: BoundingBoxSchema },
  modelId: { type: String },
  modelName: { type: String },
  confidence: { type: Number },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' }
}, {
  timestamps: true
});

ScanSchema.index({ userId: 1 });
ScanSchema.index({ guestToken: 1 });
ScanSchema.index({ projectId: 1 });
ScanSchema.index({ createdAt: -1 });

export const Scan = mongoose.model<IScan>('Scan', ScanSchema);
