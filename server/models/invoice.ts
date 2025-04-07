import mongoose from 'mongoose';
const validate = require('validator');
const { Schema, model } = mongoose;
const invoiceSchema = new Schema({
    user: Object, 
    vendor: Object, 
    time: Date, 
    price: Number, 
    paid: Boolean, 
    specs: String

});
const Invoice = model('Invoice', invoiceSchema);
module.exports = Invoice;
export default Invoice;