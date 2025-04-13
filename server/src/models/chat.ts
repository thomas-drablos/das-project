import mongoose, { Schema, Document, model } from 'mongoose';
import { IMessage, messageSchema } from './message';
import { IInvoice, invoiceSchema } from './invoice';

export interface IChat extends Document {
  vendor: {
    id: string;
    name: string;
    email?: string;
  };
  user: {
    id: string;
    name: string;
    email?: string;
  };
  time: Date;
  messages: IMessage[];
  invoices: IInvoice[];
}

const chatSchema = new Schema<IChat>(
  {
    vendor: {
      id: { type: String, required: true },
      name: { type: String, required: true },
      email: { type: String },
    },
    user: {
      id: { type: String, required: true },
      name: { type: String, required: true },
      email: { type: String },
    },
    time: { type: Date, default: Date.now },
    messages: [messageSchema],
    invoices: [invoiceSchema],
  },
  { timestamps: true }
);

const Chat = model<IChat>('Chat', chatSchema);
export default Chat;
