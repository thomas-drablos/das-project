import mongoose from 'mongoose';
const { Schema, model } = mongoose;
const loginSchema = new Schema({
    user_id: Object, 
    time: Date, 
    failed: Boolean
});
const Login = model('Login', loginSchema);
export default Login;