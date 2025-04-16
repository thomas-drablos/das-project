import mongoose, { Schema, Document, model } from 'mongoose';
import { IUser } from './user';
import { IVendor } from './vendor';

export interface IInvoice extends Document {
  user: IUser;
  vendor: IVendor;
  time: Date;
  price: number;
  paid: boolean;
  specs: string;
}

export const invoiceSchema = new Schema<IInvoice>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    vendor:{ type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
    time: { type: Date, default: Date.now },
    price: { type: Number, required: true },
    paid: { type: Boolean, default: false },
    specs: { type: String, required: true },
  },
  { timestamps: true }
);

const Invoice = model<IInvoice>('Invoice', invoiceSchema);
export default Invoice;