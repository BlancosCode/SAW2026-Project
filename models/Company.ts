import mongoose, { Schema, Document } from 'mongoose';
import { IPushSubscription, PushSubscriptionSchema } from '../types/shared'; 

export type CompanyStatus = 'active' | 'suspended' | 'inactive';

export interface ICompany extends Document {
  userId: string;
  name: string;
  industry?: string;
  description?: string;
  website?: string;
  mainContactEmail?: string;
  pIVA?: string;
  coverColor?: string;
  profilePicture?: string;
  status: CompanyStatus;
  freelancersCollaborated: string[];
  internalData: {
    earningsHistory: Array<{ date: Date; amount: number; description: string; projectId: string }>;
    internalNotes: Array<{ date: Date; note: string }>;
  };
  pushSubscriptions?: IPushSubscription[];
}

const CompanySchema: Schema = new Schema<ICompany>({
  userId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  industry: String,
  description: String,
  website: String,
  mainContactEmail: String,
  pIVA: String,
  coverColor: { type: String, default: '#7e7e7e' },
  profilePicture: String,
  status: { type: String, enum: ['active', 'suspended', 'inactive'], default: 'active' },
  freelancersCollaborated: { type: [String], default: [] },
  internalData: {
    earningsHistory: [{
      _id: false, // Evita ID inutili nei sotto-oggetti dello storico
      date: { type: Date, required: true },
      amount: { type: Number, required: true },
      description: String,
      projectId: { type: String, required: true }
    }],
    internalNotes: [{ _id: false, date: Date, note: String }]
  },  
  pushSubscriptions: { type: [PushSubscriptionSchema], default: [] }
}, { timestamps: true });

export default mongoose.models.Company || mongoose.model<ICompany>('Company', CompanySchema);