import mongoose, { Schema, Document } from 'mongoose';

export interface IUserPreferences {
  emailAlerts: boolean;
  marketingEmails: boolean;
  pushNotifications: boolean;
  measurementSystem: 'metric' | 'imperial';
  currency: 'USD' | 'EUR' | 'GBP';
}

export interface IUserAppearance {
  darkMode: boolean;
  compactView: boolean;
  reduceMotion: boolean;
}

export interface IUserPrivacy {
  publicProfile: boolean;
  showActivity: boolean;
  allowDataCollection: boolean;
}

export interface IUser extends Document {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  bio?: string;
  avatar?: string;
  googleId?: string;
  provider: 'local' | 'google';
  role: 'user' | 'admin';
  company?: string;
  jobTitle?: string;
  totalScans: number;
  carbonSaved: number;
  preferences: IUserPreferences;
  appearance: IUserAppearance;
  privacy: IUserPrivacy;
  subscriptionPlan: 'free' | 'pro' | 'enterprise';
  subscriptionStatus: 'active' | 'cancelled' | 'expired';
  createdAt: Date;
  updatedAt: Date;
}

const PreferencesSchema = new Schema({
  emailAlerts: { type: Boolean, default: true },
  marketingEmails: { type: Boolean, default: false },
  pushNotifications: { type: Boolean, default: true },
  measurementSystem: { type: String, enum: ['metric', 'imperial'], default: 'metric' },
  currency: { type: String, enum: ['USD', 'EUR', 'GBP'], default: 'USD' }
}, { _id: false });

const AppearanceSchema = new Schema({
  darkMode: { type: Boolean, default: false },
  compactView: { type: Boolean, default: false },
  reduceMotion: { type: Boolean, default: false }
}, { _id: false });

const PrivacySchema = new Schema({
  publicProfile: { type: Boolean, default: true },
  showActivity: { type: Boolean, default: true },
  allowDataCollection: { type: Boolean, default: true }
}, { _id: false });

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String },
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  bio: { type: String, trim: true, maxlength: 500 },
  avatar: { type: String },
  googleId: { type: String, sparse: true },
  provider: { type: String, enum: ['local', 'google'], default: 'local' },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  company: { type: String, trim: true },
  jobTitle: { type: String, trim: true },
  totalScans: { type: Number, default: 0 },
  carbonSaved: { type: Number, default: 0 },
  preferences: { type: PreferencesSchema, default: () => ({}) },
  appearance: { type: AppearanceSchema, default: () => ({}) },
  privacy: { type: PrivacySchema, default: () => ({}) },
  subscriptionPlan: { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' },
  subscriptionStatus: { type: String, enum: ['active', 'cancelled', 'expired'], default: 'active' }
}, {
  timestamps: true
});

UserSchema.index({ email: 1 });
UserSchema.index({ googleId: 1 });

export const User = mongoose.model<IUser>('User', UserSchema);
