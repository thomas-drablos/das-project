import mongoose, { Schema, Document, model, Types } from 'mongoose';
import { IUser } from './user';

export interface IInvoice extends Document {
  user: Types.ObjectId | IUser;
  vendor: Types.ObjectId | IUser;
  time: Date;
  price: number;
  paid: boolean;
  specs: string;
}

export const invoiceSchema = new Schema<IInvoice>(
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
    time: { type: Date, default: Date.now },
    price: { type: Number, required: true },
    paid: { type: Boolean, default: false },
    specs: { type: String, required: true },
  },
  { timestamps: true }
);

const Invoice = model<IInvoice>('Invoice', invoiceSchema);
export default Invoice;