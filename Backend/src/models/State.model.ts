import mongoose, { Document, Schema } from 'mongoose';

export interface IState extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  image: string;
  highlights: string;
  region: string;
  capital: string;
  language: string[];
  isActive: boolean;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const StateSchema = new Schema<IState>(
  {
    name: { type: String, required: true, unique: true, trim: true },

   
    slug: { type: String, required: true, unique: true, lowercase: true },

    description: { type: String, required: true },
    image: { type: String, required: true },
    highlights: { type: String, required: true },

    region: {
      type: String,
      required: true,
      enum: ['North', 'South', 'East', 'West', 'Northeast', 'Central'],
    },

    capital: { type: String, required: true },
    language: [{ type: String }],

    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
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


StateSchema.index({ isFeatured: -1, name: 1 });
StateSchema.index({ region: 1 });



export const State = mongoose.model<IState>('State', StateSchema);