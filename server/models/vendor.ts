import mongoose from 'mongoose';
const { Schema, model } = mongoose;
const vendorSchema = new Schema({
    name: String, 
    photos: String, //TODO fix type
    description: String, 
    tags: String, //TODO string array
    reviews: Object, //TODO object array
    hidden: Boolean

});
const Vendor = model('Vendor', vendorSchema);
export default Vendor;