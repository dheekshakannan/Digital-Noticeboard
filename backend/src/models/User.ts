import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';

// Define the interface for TypeScript type safety
export interface IUser {
  username: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'student';
  createdAt: Date;
  comparePassword: (password: string) => Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  username: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true, 
    lowercase: true 
  },
  passwordHash: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    enum: ['admin', 'student'], 
    default: 'student' 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Instance method to check password validity
userSchema.methods.comparePassword = async function(password: string): Promise<boolean> {
  return await bcrypt.compare(password, this.passwordHash);
};

export const User = model<IUser>('User', userSchema);
