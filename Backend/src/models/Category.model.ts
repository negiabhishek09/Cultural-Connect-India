import mongoose, { Document, Schema } from 'mongoose';

export interface ICategory extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  count: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, unique: true, trim: true },

   
    slug: { type: String, required: true, unique: true, lowercase: true },

    description: { type: String, required: true },
    icon: { type: String, required: true },
    color: { type: String, required: true },
    bgColor: { type: String, required: true },
    count: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);


CategorySchema.index({ isActive: 1 });



export const Category = mongoose.model<ICategory>('Category', CategorySchema);