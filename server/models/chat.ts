import mongoose from 'mongoose';
const validate = require('validator');
const message = require('./message');
const invoice = require('./invoice');
const { Schema, model } = mongoose;
const chatSchema = new Schema({
    vendor: Object, 
    user: Object, 
    time: Date,
    messages: [message.schema],
    invoices: [invoice.schema]
});
const Chat = model('Chat', chatSchema);
export default Chat;