import mongoose, { Schema, Document, model } from 'mongoose';
import User, { IUser } from './user';
import { IVendor } from './vendor';

export interface IReview extends Document {
  user: IUser;
  vendor: IVendor;
  name: string,
  text: string;
  rating: number;
  time: Date;
  hidden: boolean;
}

export const reviewSchema = new Schema<IReview>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    vendor: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true},
    name: { type: String, required: true },
    text: { type: String, required: true },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    time: { type: Date, default: Date.now },
    hidden: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Review = model<IReview>('Review', reviewSchema);
module.exports = Review;
export default Review;