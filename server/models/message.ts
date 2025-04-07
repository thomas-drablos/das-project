import mongoose from 'mongoose';
const validate = require('validator');
const { Schema, model } = mongoose;
const messageSchema = new Schema({
    user: Object, 
    vendor: Object, 
    time: Date, 
    text: String
});
const Message = model('Message', messageSchema);
module.exports = Message;
export default Message;