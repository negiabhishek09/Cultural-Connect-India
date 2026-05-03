import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  image: string;
  price: number;
  originalPrice: number;
  category: string;
  tag: string;
  rating: number;
  soldCount: number;
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  businessId?: mongoose.Types.ObjectId;
  categoryId?: mongoose.Types.ObjectId;
  stateId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },

    // auto-generate hoga, required nahi
    slug: { type: String, unique: true, lowercase: true },

    description: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, required: true, min: 0 },

    // plain string category — admin form se directly aata hai
    category: { type: String, default: '' },

    // tag enum hata diya — admin free text bhejta hai
    tag: { type: String, default: '' },

    rating: { type: Number, default: 0, min: 0, max: 5 },
    soldCount: { type: Number, default: 0 },
    stock: { type: Number, default: 100, min: 0 },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },

    // optional — admin panel se nahi aata
    businessId: { type: Schema.Types.ObjectId, ref: 'Business' },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category' },
    stateId:    { type: Schema.Types.ObjectId, ref: 'State' },
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

ProductSchema.index({ isActive: 1, isFeatured: -1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ soldCount: -1 });

export const Product = mongoose.model<IProduct>('Product', ProductSchema);