import mongoose, { Schema, Document } from 'mongoose';
import { IPushSubscription, PushSubscriptionSchema } from '../types/shared';

export type ExperienceLevel = 'newbie' | 'good' | 'master';
export type AvailabilityStatus = 'available' | 'busy' | 'unavailable';

export interface IPortfolioProject {
  title: string;
  description: string;
  imageUrl: string;
  imageKey: string;
  createdAt: Date;
}

export interface IFreelancer extends Document {
  userId: string;
  lastUpdated: Date;
  isFirstAccess: boolean;
  hasCv: boolean;
  publicData: {
    firstName: string;
    lastName: string;
    bio?: string;
    location?: string;
    mainPortfolioUrl?: string;
    cvUrl?: string;
    profilePicture?: string;
    coverColor?: string;
    macroCategories: string[];
    experienceLevel: ExperienceLevel;
    availability: {
      status: AvailabilityStatus;
    };
    portfolioProjects: IPortfolioProject[];
  };
  internalData: {
    phoneNumber?: string;
    subSpecializations: string[];
    professionalReferences: Array<{ name: string; contact: string; verified: boolean }>;
    certifications: string[];
    languages: string[];
    workPreferences: { remote: boolean; onsite: boolean };
    managerNotes: Array<{ date: Date; managerId: string; note: string }>;
  };
  pushSubscriptions?: IPushSubscription[];
}

const FreelancerSchema: Schema = new Schema<IFreelancer>({
  userId: { type: String, required: true, unique: true },
  lastUpdated: { type: Date, default: Date.now },
  isFirstAccess: { type: Boolean, default: true },
  hasCv: { type: Boolean, default: false },
  publicData: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    bio: String,
    location: String,
    mainPortfolioUrl: String,
    cvUrl: String,
    profilePicture: String,
    coverColor: { type: String, default: '#4f46e5' },
    macroCategories: { type: [String], default: [] },
    experienceLevel: { type: String, enum: ['newbie', 'good', 'master'], default: 'newbie' },
    availability: {
      status: { type: String, enum: ['available', 'busy', 'unavailable'], default: 'available' }
    },
    portfolioProjects: [{
      title: { type: String, required: true },
      description: String,
      imageUrl: String,
      imageKey: String,
      createdAt: { type: Date, default: Date.now }
    }] // Qui lasciamo che Mongoose generi l' _id automatico per identificare i singoli progetti del portfolio
  },
  internalData: {
    phoneNumber: String,
    subSpecializations: [String],
    professionalReferences: [{ _id: false, name: String, contact: String, verified: Boolean }],
    certifications: [String],
    languages: [String],
    workPreferences: { remote: { type: Boolean, default: true }, onsite: { type: Boolean, default: false } },
    managerNotes: [{ _id: false, date: Date, managerId: String, note: String }]
  },
  pushSubscriptions: { type: [PushSubscriptionSchema], default: [] }
}, { timestamps: true });

export default mongoose.models.Freelancer || mongoose.model<IFreelancer>('Freelancer', FreelancerSchema);