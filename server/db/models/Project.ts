import mongoose, { Schema, Document } from 'mongoose';

export interface IProjectMaterial {
  materialKey: string;
  materialName: string;
  quantity: number;
  unit: string;
  embodiedCarbon: number;
  embodiedEnergy: number;
}

export interface IProject extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  location: string;
  status: 'Planning' | 'In Progress' | 'Completed' | 'On Hold';
  progress: number;
  sustainabilityScore: number;
  targetCompletionDate: Date;
  image?: string;
  totalCarbonFootprint: number;
  totalEmbodiedEnergy: number;
  materials: IProjectMaterial[];
  teamMembers: string[];
  budget?: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectMaterialSchema = new Schema({
  materialKey: { type: String, required: true },
  materialName: { type: String, required: true },
  quantity: { type: Number, required: true, default: 1 },
  unit: { type: String, default: 'kg' },
  embodiedCarbon: { type: Number, default: 0 },
  embodiedEnergy: { type: Number, default: 0 }
}, { _id: false });

const ProjectSchema = new Schema<IProject>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  location: { type: String, required: true, trim: true },
  status: { 
    type: String, 
    enum: ['Planning', 'In Progress', 'Completed', 'On Hold'], 
    default: 'Planning' 
  },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  sustainabilityScore: { type: Number, default: 0, min: 0, max: 100 },
  targetCompletionDate: { type: Date },
  image: { type: String },
  totalCarbonFootprint: { type: Number, default: 0 },
  totalEmbodiedEnergy: { type: Number, default: 0 },
  materials: [ProjectMaterialSchema],
  teamMembers: [{ type: String }],
  budget: { type: Number }
}, {
  timestamps: true
});

ProjectSchema.index({ userId: 1 });
ProjectSchema.index({ status: 1 });

export const Project = mongoose.model<IProject>('Project', ProjectSchema);
