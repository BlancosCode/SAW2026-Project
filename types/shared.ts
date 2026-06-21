import { Schema } from 'mongoose';



// Tipo condiviso dai vari modelli per gestire le sottoscrizioni alle notifiche PWA push
export interface IPushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export const PushSubscriptionSchema = new Schema<IPushSubscription>({
  endpoint: { type: String, required: true },
  keys: {
    p256dh: { type: String, required: true },
    auth: { type: String, required: true }
  }
}, { _id: false }); 