import mongoose, { Schema, Document, model } from 'mongoose';
import { IReview, reviewSchema } from './review';
import { IUser } from './user';

export interface IVendor extends Document {
  user: IUser;
  name: string;
  photos: string[]; // URLs to images
  description: string;
  tags: string[];
  reviews: any[]; // can replace this with a Review ref interface later
  hidden: boolean;
}

const vendorSchema = new Schema<IVendor>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    photos: { type: [String], default: [] },
    description: { type: String },
    tags: { type: [String], default: [] },
    reviews: [reviewSchema],
    hidden: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const Vendor = model<IVendor>('Vendor', vendorSchema);
export default Vendor;
