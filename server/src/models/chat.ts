import mongoose, { Schema, Document, model } from 'mongoose';
import { IMessage, messageSchema } from './message';
import { IInvoice, invoiceSchema } from './invoice';
import User, { userSchema, IUser } from './user';
import { IVendor } from './vendor';

export interface IChat extends Document {
  vendor: IVendor;
  user: IUser;
  time: Date;
  messages: IMessage[];
  invoices: IInvoice[];
}

const chatSchema = new Schema<IChat>(
  {
    vendor: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true},
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true},
    time: { type: Date, default: Date.now },
    messages: [messageSchema],
    invoices: [invoiceSchema],
  },
  { timestamps: true }
);

const Chat = model<IChat>('Chat', chatSchema);
export default Chat;
