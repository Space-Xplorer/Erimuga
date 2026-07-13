import Coupon from '../models/couponModel.js';

const applyCouponToAmount = (coupon, amount) => {
  if (coupon.type === 'percent') {
    return Math.min((coupon.value / 100) * amount, amount);
  }
  return Math.min(coupon.value, amount);
};

export const validateCoupon = async (req, res) => {
  try {
    const { code, amount } = req.body;
    if (!code) return res.status(400).json({ error: 'Coupon code is required' });

    const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() });
    if (!coupon) return res.status(404).json({ error: 'Coupon code not found' });
    if (!coupon.active) return res.status(400).json({ error: 'This coupon is no longer active' });
    if (coupon.expiresAt && new Date() > coupon.expiresAt) return res.status(400).json({ error: 'This coupon has expired' });
    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) return res.status(400).json({ error: 'This coupon has reached its usage limit' });
    if (amount < coupon.minOrderAmount) return res.status(400).json({ error: `Minimum order amount is ₹${coupon.minOrderAmount} for this coupon` });

    const discount = applyCouponToAmount(coupon, amount);

    res.json({
      valid: true,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      discount: Math.round(discount),
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to validate coupon', details: err.message });
  }
};

// Returns coupon + discount amount, throws if invalid — used internally by order controller
export const applyCouponServerSide = async (code, amount) => {
  const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() });
  if (!coupon) throw new Error('Coupon code not found');
  if (!coupon.active) throw new Error('Coupon is no longer active');
  if (coupon.expiresAt && new Date() > coupon.expiresAt) throw new Error('Coupon has expired');
  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) throw new Error('Coupon usage limit reached');
  if (amount < coupon.minOrderAmount) throw new Error(`Minimum order amount for this coupon is ₹${coupon.minOrderAmount}`);
  const discount = Math.round(applyCouponToAmount(coupon, amount));
  return { coupon, discount };
};

export const createCoupon = async (req, res) => {
  try {
    const { code, type, value, minOrderAmount, expiresAt, usageLimit } = req.body;
    if (!code || !type || value === undefined) return res.status(400).json({ error: 'code, type, and value are required' });
    const coupon = new Coupon({ code, type, value, minOrderAmount, expiresAt: expiresAt || null, usageLimit: usageLimit || null });
    await coupon.save();
    res.status(201).json({ message: 'Coupon created', coupon });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'A coupon with that code already exists' });
    res.status(500).json({ error: 'Failed to create coupon', details: err.message });
  }
};

export const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch coupons', details: err.message });
  }
};

export const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!coupon) return res.status(404).json({ error: 'Coupon not found' });
    res.json({ message: 'Coupon updated', coupon });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update coupon', details: err.message });
  }
};

export const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ error: 'Coupon not found' });
    res.json({ message: 'Coupon deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete coupon', details: err.message });
  }
};
