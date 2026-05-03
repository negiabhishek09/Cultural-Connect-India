import mongoose, { Document, Schema } from 'mongoose';

export interface IComment {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  content: string;
  createdAt: Date;
}

export interface IPost extends Document {
  _id: mongoose.Types.ObjectId;
  caption: string;
  image: string;
  location?: string;
  userId: mongoose.Types.ObjectId;
  categoryId?: mongoose.Types.ObjectId;
  likes: mongoose.Types.ObjectId[];
  savedBy: mongoose.Types.ObjectId[];
  comments: IComment[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, trim: true, maxlength: 1000 },
    createdAt: { type: Date, default: Date.now }, // ✅ broken link fix
  },
  { _id: true }
);

const PostSchema = new Schema<IPost>(
  {
    caption: { type: String, required: true, trim: true, maxlength: 2200 },
    image: { type: String, required: true },
    location: { type: String, maxlength: 200 },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category' },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    savedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    comments: { type: [CommentSchema], default: [] },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_d, r) => {
        delete (r as any).__v;
        return r;
      },
    },
  }
);

PostSchema.index({ userId: 1 });
PostSchema.index({ categoryId: 1 });
PostSchema.index({ createdAt: -1 });
PostSchema.index({ isActive: 1, createdAt: -1 });

export const Post = mongoose.model<IPost>('Post', PostSchema);