import mongoose from 'mongoose';

const stagedImageSchema = new mongoose.Schema({
  searchQuery: { type: String, required: true, index: true },
  thumbnailUrl: { type: String, required: true },
  fullImageUrl: { type: String, required: true },
  source: { type: String },
  title: { type: String },
  width: { type: Number },
  height: { type: Number },
  status: { 
    type: String, 
    enum: ['staged', 'accepted', 'discarded'], 
    default: 'staged',
    index: true 
  },
  expiresAt: { 
    type: Date, 
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000)
  },
  createdAt: { type: Date, default: Date.now }
});

stagedImageSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('StagedImage', stagedImageSchema);
