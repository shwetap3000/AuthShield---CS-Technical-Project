import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string; // Plaintext passwords MUST NEVER be stored
  failedLoginAttempts: number;
  accountLocked: boolean;
  lockUntil: Date | null;
  lastLogin: Date | null;
  role: 'user' | 'admin' | 'security_analyst';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'User name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
      index: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
      // Stored as bcrypt hash ($2b$10$...) - plaintext is strictly forbidden
      select: false, // Do not return passwordHash in standard queries
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
      min: 0,
    },
    accountLocked: {
      type: Boolean,
      default: false,
    },
    lockUntil: {
      type: Date,
      default: null,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'security_analyst'],
      default: 'user',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent overwriting model if re-imported
export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
