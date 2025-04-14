import mongoose, { Schema, Document, model, Types } from 'mongoose';
import { IUser } from './user';

export interface IMessage extends Document {
  user: IUser;
  vendor: IUser;
  time: Date;
  text: string;
}

export const messageSchema = new Schema<IMessage>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    vendor: {type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
    time: { type: Date, default: Date.now },
    text: { type: String, required: true },
  },
  { timestamps: true } 
);

const Message = model<IMessage>('Message', messageSchema);
module.exports = Message;
export default Message;