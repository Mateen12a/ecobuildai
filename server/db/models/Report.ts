import mongoose, { Schema, Document } from 'mongoose';

export interface IReport extends Document {
  userId: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  title: string;
  type: 'project' | 'material' | 'sustainability' | 'comparison';
  status: 'draft' | 'completed';
  data: {
    totalCarbonFootprint: number;
    totalEmbodiedEnergy: number;
    carbonReduction: number;
    materialsAnalyzed: number;
    sustainabilityScore: number;
    recommendations: string[];
    chartData?: any;
  };
  generatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema<IReport>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  projectId: { type: Schema.Types.ObjectId, ref: 'Project' },
  title: { type: String, required: true, trim: true },
  type: { 
    type: String, 
    enum: ['project', 'material', 'sustainability', 'comparison'], 
    default: 'project' 
  },
  status: { type: String, enum: ['draft', 'completed'], default: 'draft' },
  data: {
    totalCarbonFootprint: { type: Number, default: 0 },
    totalEmbodiedEnergy: { type: Number, default: 0 },
    carbonReduction: { type: Number, default: 0 },
    materialsAnalyzed: { type: Number, default: 0 },
    sustainabilityScore: { type: Number, default: 0 },
    recommendations: [{ type: String }],
    chartData: { type: Schema.Types.Mixed }
  },
  generatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

ReportSchema.index({ userId: 1 });
ReportSchema.index({ projectId: 1 });
ReportSchema.index({ generatedAt: -1 });

export const Report = mongoose.model<IReport>('Report', ReportSchema);
