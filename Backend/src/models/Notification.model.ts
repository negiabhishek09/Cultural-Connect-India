import mongoose, { Document, Schema } from 'mongoose';

export type NotificationType =
  | 'ORDER_UPDATE'
  | 'NEW_LIKE'
  | 'NEW_COMMENT'
  | 'EVENT_REMINDER'
  | 'SYSTEM';

export interface INotification extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['ORDER_UPDATE', 'NEW_LIKE', 'NEW_COMMENT', 'EVENT_REMINDER', 'SYSTEM'],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true, toJSON: { transform: (_d, r: Record<string, any>) => { delete r.__v; return r; } } }
);

NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, isRead: 1 });

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);