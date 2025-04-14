import mongoose, { Schema, Document, model, Types } from 'mongoose';
import User, { IUser } from './user';

export interface IReview extends Document {
  user: IUser;
  vendor: Types.ObjectId | IUser;
  text: string;
  rating: number;
  time: Date;
}

export const reviewSchema = new Schema<IReview>(
  {
    user: { type: User, ref: 'User', required: true },
    vendor: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
    text: { type: String, required: true },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    time: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Review = model<IReview>('Review', reviewSchema);
module.exports = Review;
export default Review;