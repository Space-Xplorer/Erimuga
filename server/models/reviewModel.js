import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const reviewSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'user', required: true },
  userName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, trim: true, maxlength: 1000 },
  verifiedPurchase: { type: Boolean, default: false },
}, { timestamps: true });

reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

const Review = model('Review', reviewSchema);
export default Review;
