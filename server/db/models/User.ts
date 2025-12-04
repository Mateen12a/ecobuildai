import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  googleId?: string;
  provider: 'local' | 'google';
  role: 'user' | 'admin';
  company?: string;
  jobTitle?: string;
  totalScans: number;
  carbonSaved: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String },
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  avatar: { type: String },
  googleId: { type: String, sparse: true },
  provider: { type: String, enum: ['local', 'google'], default: 'local' },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  company: { type: String, trim: true },
  jobTitle: { type: String, trim: true },
  totalScans: { type: Number, default: 0 },
  carbonSaved: { type: Number, default: 0 }
}, {
  timestamps: true
});

UserSchema.index({ email: 1 });
UserSchema.index({ googleId: 1 });

export const User = mongoose.model<IUser>('User', UserSchema);
