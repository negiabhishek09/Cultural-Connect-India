import mongoose, { Document, Schema } from 'mongoose';

export interface IExploreItem extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  category: string;
  location: string;
  rating: number;
  image: string;
  price: string;
  description: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ExploreItemSchema = new Schema<IExploreItem>(
  {
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true },
    location: { type: String, required: true },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    image: { type: String, required: true },
    price: { type: String, required: true },
    description: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        delete (ret as any).__v;
        return ret;
      },
    },
  }
);

ExploreItemSchema.index({ category: 1 });
ExploreItemSchema.index({ isActive: 1 });

export const ExploreItem = mongoose.model<IExploreItem>('ExploreItem', ExploreItemSchema);