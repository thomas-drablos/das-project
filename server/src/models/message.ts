import mongoose, { Schema, Document, model } from 'mongoose';

export interface IMessage extends Document {
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
  time: Date;
  text: string;
  sender?: 'user' | 'vendor';
}

export const messageSchema = new Schema<IMessage>(
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
    text: { type: String, required: true },
  },
  { timestamps: true }
);

const Message = model<IMessage>('Message', messageSchema);
export default Message;