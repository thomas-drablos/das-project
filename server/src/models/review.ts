import mongoose from 'mongoose';
const { Schema, model } = mongoose;
const reviewSchema = new Schema({
   user: Object, 
   vendor: Object, 
   text: String, 
   rating: Number, 
   time: Date

});
const Review = model('Review', reviewSchema);
export default Review;