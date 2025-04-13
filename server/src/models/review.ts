import mongoose, { Schema, Document, model } from 'mongoose';

export interface IReview extends Document {
  user: {
    id: string;
    name: string;
    email?: string;
  };
  vendor: {
    id: string;
    name: string;
    email?: string;
  };
  text: string;
  rating: number;
  time: Date;
}

export const reviewSchema = new Schema<IReview>(
  {
    user: {
      id: { type: String, required: true },
      name: { type: String, required: true },
      email: { type: String },
    },
    vendor: {
      id: { type: String, required: true },
      name: { type: String, required: true },
      email: { type: String },
    },
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
export default Review;