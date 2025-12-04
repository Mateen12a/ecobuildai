import mongoose from 'mongoose';

const trainedModelSchema = new mongoose.Schema({
  modelId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  status: { type: String, enum: ['training', 'completed', 'failed', 'stopped'], default: 'training' },
  isActive: { type: Boolean, default: false },
  classes: [String],
  classLabels: { type: Map, of: String },
  config: {
    epochs: { type: Number, default: 10 },
    batchSize: { type: Number, default: 16 },
    learningRate: { type: Number, default: 0.0001 },
    validationSplit: { type: Number, default: 0.2 },
    enableSegmentation: { type: Boolean, default: false }
  },
  metrics: {
    accuracy: { type: Number, default: 0 },
    valAccuracy: { type: Number, default: 0 },
    loss: { type: Number, default: 0 },
    valLoss: { type: Number, default: 0 },
    confusionMatrix: [[Number]],
    classAccuracies: { type: Map, of: Number }
  },
  trainingHistory: {
    loss: [Number],
    accuracy: [Number],
    valLoss: [Number],
    valAccuracy: [Number]
  },
  logs: [{
    message: String,
    level: { type: String, default: 'info' },
    timestamp: { type: Date, default: Date.now }
  }],
  modelData: { type: Buffer },
  labelsJson: { type: String },
  samplesUsed: { type: Number, default: 0 },
  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
});

export default mongoose.model('TrainedModel', trainedModelSchema);
