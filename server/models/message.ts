import mongoose from 'mongoose';
const { Schema, model } = mongoose;
const messageSchema = new Schema({
    user: Object, 
    vendor: Object, 
    time: Date, 
    text: String
});
const Message = model('Message', messageSchema);
export default Message;