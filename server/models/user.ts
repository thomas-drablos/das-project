import mongoose from 'mongoose';
const { Schema, model } = mongoose;
const userSchema = new Schema({
    name: String, 
    email: String, 
    password: String, //hashed
    isAdmin: Boolean
});
const User = model('User', userSchema);
export default User;