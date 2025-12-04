import mongoose, { Schema, Document } from 'mongoose';

export interface IMLModel extends Document {
  name: string;
  version: string;
  description: string;
  status: 'training' | 'ready' | 'failed' | 'deprecated';
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  totalSamples: number;
  epochs: number;
  trainingTime: number;
  modelPath?: string;
  labelsPath?: string;
  classes?: string[];
  classIndices?: Record<string, string>;
  inputShape?: number[];
  architecture?: string;
  mlstudioModelId?: string;
  isActive: boolean;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const MLModelSchema = new Schema<IMLModel>({
  name: { type: String, required: true },
  version: { type: String, required: true },
  description: { type: String },
  status: { 
    type: String, 
    enum: ['training', 'ready', 'failed', 'deprecated'], 
    default: 'training' 
  },
  accuracy: { type: Number, default: 0 },
  precision: { type: Number, default: 0 },
  recall: { type: Number, default: 0 },
  f1Score: { type: Number, default: 0 },
  totalSamples: { type: Number, default: 0 },
  epochs: { type: Number, default: 0 },
  trainingTime: { type: Number, default: 0 },
  modelPath: { type: String },
  labelsPath: { type: String },
  classes: [{ type: String }],
  classIndices: { type: Schema.Types.Mixed },
  inputShape: [{ type: Number }],
  architecture: { type: String },
  mlstudioModelId: { type: String },
  isActive: { type: Boolean, default: false },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true
});

MLModelSchema.index({ status: 1 });
MLModelSchema.index({ isActive: 1 });
MLModelSchema.index({ createdAt: -1 });

export const MLModel = mongoose.model<IMLModel>('MLModel', MLModelSchema);
