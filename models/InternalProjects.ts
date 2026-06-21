import mongoose, { Schema, Document } from 'mongoose';
import { ExperienceLevel } from './Freelancer'; 

export type ProjectStatus = 'pending' | 'active' | 'completed' | 'cancelled';

export interface IInternalProject extends Document {
  title: string;
  description: string;
  companyId: string; 
  freelancersId: string[]; 
  status: ProjectStatus;
  proposalDate?: Date;
  acceptanceDate?: Date;
  completionDate?: Date;
  requiredExperienceLevel: ExperienceLevel;
  budget: {
    amount: number;
    currency: string;
  };
  internalEvaluation?: {
    rating: number;
    comments: string;
    evaluatorId: string;
    date: Date;
  };
  clientFeedback?: {
    rating: number;
    comments: string;
    date: Date;
  };
}

const InternalProjectSchema: Schema = new Schema<IInternalProject>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  companyId: { type: String, required: true }, 
  freelancersId: { type: [String], default: [] }, 
  status: { type: String, enum: ['pending', 'active', 'completed', 'cancelled'], default: 'pending' }, 
  proposalDate: Date,
  acceptanceDate: Date,
  completionDate: Date,
  requiredExperienceLevel: { type: String, enum: ['newbie', 'good', 'master'], default: 'newbie' },
  budget: {
    amount: { type: Number, required: true, default: 0 },
    currency: { type: String, default: 'EUR' }
  },
  internalEvaluation: {
    _id: false,
    rating: Number,
    comments: String,
    evaluatorId: String,
    date: Date
  },
  clientFeedback: {
    _id: false,
    rating: Number,
    comments: String,
    date: Date
  }
}, { timestamps: true });

export default mongoose.models.InternalProject || mongoose.model<IInternalProject>('InternalProject', InternalProjectSchema);