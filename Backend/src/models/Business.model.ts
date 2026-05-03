import mongoose, { Document, Schema } from 'mongoose';

export interface IReview {
  userId: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface IBusiness extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  image: string;
  categoryName: string;
  location: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  rating: number;
  reviewCount: number;
  reviews: IReview[];
  isVerified: boolean;
  isActive: boolean;
  isFeatured: boolean;
  ownerId: mongoose.Types.ObjectId;
  categoryId: mongoose.Types.ObjectId;
  stateId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, minlength: 5, maxlength: 1000 },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const BusinessSchema = new Schema<IBusiness>(
  {
    name: { type: String, required: true, trim: true },

    
    slug: { type: String, required: true, unique: true, lowercase: true },

    description: { type: String, required: true },
    image: { type: String, required: true },
    categoryName: { type: String, required: true },
    location: { type: String, required: true },
    address: { type: String },
    phone: { type: String },
    email: { type: String },
    website: { type: String },

    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    reviews: { type: [ReviewSchema], default: [] },

    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },

    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    stateId: { type: Schema.Types.ObjectId, ref: 'State', required: true },
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

//  useful indexes
BusinessSchema.index({ stateId: 1 });
BusinessSchema.index({ categoryId: 1 });
BusinessSchema.index({ isVerified: 1, rating: -1 });
BusinessSchema.index({ isFeatured: -1, rating: -1 });



export const Business = mongoose.model<IBusiness>('Business', BusinessSchema);