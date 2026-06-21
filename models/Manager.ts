import mongoose, { Schema, Document } from 'mongoose';
import { IPushSubscription, PushSubscriptionSchema } from '../types/shared';

export interface IManager extends Document {
  userId: string;
  firstName: string;
  lastName: string;
  contactNumber?: string;
  coverColor?: string;
  profilePicture?: string;
  pushSubscriptions?: IPushSubscription[];
}

const ManagerSchema: Schema = new Schema<IManager>({
  userId: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  contactNumber: String,
  profilePicture: String,
  coverColor: { type: String, default: '#44070f' },
  pushSubscriptions: { type: [PushSubscriptionSchema], default: [] }
}, { timestamps: true });

export default mongoose.models.Manager || mongoose.model<IManager>('Manager', ManagerSchema);