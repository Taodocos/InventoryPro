import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  isAdmin: boolean;
  isApprover: boolean;
  location: string;
  permissions: {
    canRegisterItems: boolean;
    canIssueItems: boolean;
    canRequestItems: boolean;
    canViewRequests: boolean;
    canManageLocations: boolean;
    canManageCategories: boolean;
    canApproveItems: boolean;
    canViewReports: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
  comparePassword(password: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    isApprover: { type: Boolean, default: false },
    location: { type: String, required: true },
    permissions: {
      canRegisterItems: { type: Boolean, default: false },
      canIssueItems: { type: Boolean, default: false },
      canRequestItems: { type: Boolean, default: false },
      canViewRequests: { type: Boolean, default: false },
      canManageLocations: { type: Boolean, default: false },
      canManageCategories: { type: Boolean, default: false },
      canApproveItems: { type: Boolean, default: false },
      canViewReports: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function(password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
