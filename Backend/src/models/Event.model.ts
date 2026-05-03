import mongoose, { Document, Schema } from 'mongoose';

export interface IEvent extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  image: string;
  tag: string;
  startDate: Date;
  endDate: Date;
  location: string;
  venue?: string;
  stateId: mongoose.Types.ObjectId;
  categoryId: mongoose.Types.ObjectId;
  isActive: boolean;
  isFeatured: boolean;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    name: { type: String, required: true, trim: true },

 
    slug: { type: String, required: true, unique: true, lowercase: true },

    description: { type: String, required: true },
    image: { type: String, required: true },
    tag: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    location: { type: String, required: true },
    venue: { type: String },

    stateId: { type: Schema.Types.ObjectId, ref: 'State', required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },

    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    viewCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: any) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// ✅ KEEP THESE (important indexes)
EventSchema.index({ stateId: 1 });
EventSchema.index({ categoryId: 1 });
EventSchema.index({ isFeatured: -1, startDate: 1 });
EventSchema.index({ startDate: 1, isActive: 1 });



export const Event =
  mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);