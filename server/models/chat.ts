import mongoose from 'mongoose';
const { Schema, model } = mongoose;
const chatSchema = new Schema({
    vendor: Object, 
    user: Object, 
    time: Date,
    messages: Object, //TODO
    invoices: Object //TODO
});
const Chat = model('Chat', chatSchema);
export default Chat;