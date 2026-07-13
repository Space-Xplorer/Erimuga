import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const couponSchema = new Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  type: { type: String, enum: ['percent', 'flat'], required: true },
  value: { type: Number, required: true, min: 0 },
  minOrderAmount: { type: Number, default: 0 },
  expiresAt: { type: Date, default: null },
  usageLimit: { type: Number, default: null },
  usedCount: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
}, { timestamps: true });

const Coupon = model('Coupon', couponSchema);
export default Coupon;
