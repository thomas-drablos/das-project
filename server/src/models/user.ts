import mongoose from 'mongoose';
const { Schema, model } = mongoose;

export interface IUser {
    name: string;
    email: string;
    isAdmin: boolean;
    userId: string;
    auth0Id: string;
    vendorId: string | null
    profilePic: string;
}

export const userSchema = new Schema<IUser>({
    name: { type: String, required: true },
    email: { type: String, required: true }, 
    isAdmin: { type: Boolean, required: true, default: false },
    userId: { type: String, required: true, unique: true },
    auth0Id: { type: String, required: true, unique: true },
    vendorId: { type: String, required: false, default: null},
    profilePic: { type: String, required: false, unique: false },
});
const User = model<IUser>('User', userSchema);
export default User;
