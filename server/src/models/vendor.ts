import mongoose, { Schema, Document, model } from 'mongoose';

export interface IVendor extends Document {
  name: string;
  photos: string[]; // URLs to images
  description: string;
  tags: string[];
  reviews: any[]; // can replace this with a Review ref interface later
  hidden: boolean;
}

const vendorSchema = new Schema<IVendor>(
  {
    name: { type: String, required: true },
    photos: { type: [String], default: [] },
    description: { type: String },
    tags: { type: [String], default: [] },
    reviews: { type: [Schema.Types.Mixed], default: [] }, // replace with subdocument or ObjectId later
    hidden: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const Vendor = model<IVendor>('Vendor', vendorSchema);
export default Vendor;
