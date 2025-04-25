import mongoose, { Schema, Document, model } from 'mongoose';
import { IUser } from './user';
import { IVendor } from './vendor';

export interface IMessage {
  user: IUser;
  vendor: IVendor;
  time: Date;
  text: string;
  sender: string;
}

export const messageSchema = new Schema<IMessage>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    vendor: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true},
    time: { type: Date, default: Date.now },
    text: { type: String, required: true },
    sender: { type: String, required: true }
  },
  { timestamps: true }
);

// Removed as redundant and used in chat.ts
const Message = model<IMessage>('Message', messageSchema);
export default Message;