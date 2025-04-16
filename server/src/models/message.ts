import mongoose, { Schema, Document, model } from 'mongoose';
import { IUser } from './user';
import { IVendor } from './vendor';

export interface IMessage {
  user: IUser;
  vendor: IVendor;
  time: Date;
  text: string;
  sender?: 'user' | 'vendor';
}

export const messageSchema = new Schema<IMessage>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    vendor: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true},
    time: { type: Date, default: Date.now },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

const Message = model<IMessage>('Message', messageSchema);
export default Message;