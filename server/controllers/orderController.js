import orderModel from '../models/orderModel.js';
import userModel from '../models/userModel.js';
import Product from '../models/productModel.js';
import Razorpay from 'razorpay';
import dotenv from 'dotenv';
dotenv.config();
import crypto from 'crypto';
import { generateOrderNumber } from '../utils/generateOrderNumber.js';
import { applyCouponServerSide } from './couponController.js';
import Coupon from '../models/couponModel.js';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

const validateAndEnrichItems = async (items) => {
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new Error('Order must contain at least one item');
  }

  let computedTotal = 0;
  const enriched = [];

  for (const item of items) {
    const product = await Product.findById(item.productId || item.productID);
    if (!product) throw new Error(`Product not found: ${item.productId || item.productID}`);

    const qty = Number(item.quantity);
    if (!qty || qty < 1) throw new Error(`Invalid quantity for product ${product.name}`);

    const size = item.size || '';
    const color = item.color || '';

    // Stock check — only enforced when the product uses the variant system
    if (product.variants && product.variants.length > 0) {
      const variant = product.variants.find(v => v.size === size && v.color === color);
      if (variant && variant.stock < qty) {
        const left = variant.stock;
        throw new Error(
          left === 0
            ? `${product.name} (${size}/${color}) is out of stock`
            : `Only ${left} left for ${product.name} (${size}/${color})`
        );
      }
    }

    computedTotal += product.price * qty;

    enriched.push({
      productID: product._id,
      productName: product.name,
      productCode: product.productCode,
      price: product.price,
      quantity: qty,
      size,
      color,
    });
  }

  return { computedTotal, enriched };
};

// Atomically decrements variant stock. Called after order is confirmed.
const decrementStocks = async (enriched) => {
  for (const item of enriched) {
    if (!item.size && !item.color) continue;
    const updated = await Product.findOneAndUpdate(
      {
        _id: item.productID,
        variants: {
          $elemMatch: {
            size: item.size,
            color: item.color,
            stock: { $gte: item.quantity },
          },
        },
      },
      { $inc: { 'variants.$.stock': -item.quantity } }
    );
    if (!updated) {
      throw new Error(`Stock update failed for ${item.productName} (${item.size}/${item.color}) — may be out of stock`);
    }
  }
};

const placeOrderCOD = async (req, res) => {
  try {
    const { items, amount, address, phone, couponCode } = req.body;

    const { computedTotal, enriched } = await validateAndEnrichItems(items);

    let discountAmount = 0;
    let appliedCouponCode = null;
    if (couponCode) {
      const { coupon, discount } = await applyCouponServerSide(couponCode, computedTotal);
      discountAmount = discount;
      appliedCouponCode = coupon.code;
      await Coupon.findByIdAndUpdate(coupon._id, { $inc: { usedCount: 1 } });
    }

    const finalTotal = computedTotal - discountAmount;

    if (Math.abs(finalTotal - Number(amount)) > 1) {
      return res.status(400).json({ error: 'Order amount mismatch. Please refresh and try again.' });
    }

    const orderNumber = await generateOrderNumber();

    const newOrder = new orderModel({
      orderNumber,
      userID: req.user._id.toString(),
      items: enriched,
      amount: finalTotal,
      address,
      phone,
      paymentMethod: 'COD',
      paymentStatus: 'COD - Pending',
      payment: false,
      couponCode: appliedCouponCode,
      discountAmount,
      statusHistory: [{ status: 'Order Placed', changedAt: new Date() }],
      date: Date.now(),
    });

    await decrementStocks(enriched);
    await newOrder.save();
    await userModel.findByIdAndUpdate(req.user._id, { cartData: [] });

    res.status(200).json({ message: 'Order placed with COD successfully', order: newOrder });
  } catch (error) {
    const status = error.message?.includes('out of stock') || error.message?.includes('Only') ? 400 : 500;
    res.status(status).json({ error: error.message || 'Failed to place COD order' });
  }
};


const placeOrderRazorpay = async (req, res) => {
  try {
    const { items } = req.body;

    const { computedTotal } = await validateAndEnrichItems(items);

    const options = {
      amount: Math.round(computedTotal * 100), // paise, server-computed
      currency: 'INR',
      receipt: 'receipt_' + Date.now(),
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ error: 'Razorpay order creation failed', details: error.message });
  }
};


const verifyAndPlaceOrder = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      items,
      amount,
      address,
      phone,
      couponCode,
    } = req.body;

    // Verify Razorpay HMAC signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    const { computedTotal, enriched } = await validateAndEnrichItems(items);

    let discountAmount = 0;
    let appliedCouponCode = null;
    if (couponCode) {
      const { coupon, discount } = await applyCouponServerSide(couponCode, computedTotal);
      discountAmount = discount;
      appliedCouponCode = coupon.code;
      await Coupon.findByIdAndUpdate(coupon._id, { $inc: { usedCount: 1 } });
    }

    const finalTotal = computedTotal - discountAmount;

    if (Math.abs(finalTotal - Number(amount)) > 1) {
      return res.status(400).json({ error: 'Order amount mismatch' });
    }

    const orderNumber = await generateOrderNumber();

    const newOrder = new orderModel({
      orderNumber,
      userID: req.user._id.toString(),
      items: enriched,
      amount: finalTotal,
      address,
      phone,
      paymentMethod: 'Online',
      paymentStatus: 'Razorpay - Received',
      payment: true,
      couponCode: appliedCouponCode,
      discountAmount,
      statusHistory: [{ status: 'Order Placed', changedAt: new Date() }],
      date: Date.now(),
    });

    await decrementStocks(enriched);
    await newOrder.save();
    await userModel.findByIdAndUpdate(req.user._id, { cartData: [] });

    res.status(200).json({ message: 'Order placed successfully', order: newOrder });
  } catch (err) {
    const status = err.message?.includes('out of stock') || err.message?.includes('Only') ? 400 : 500;
    res.status(status).json({ error: err.message || 'Payment verification failed' });
  }
};


const getAllOrders = async (req, res) => {
  try {
    const orders = await orderModel.find().sort({ date: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders', details: error.message });
  }
};


const getOrderDetails = async (req, res) => {
  try {
    const order = await orderModel.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const isOwner = order.userID.toString() === req.user._id.toString();
    if (!isOwner && req.user.userType !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: You can only access your own orders' });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order details', details: error.message });
  }
};


// Looks an order up by its human-readable orderNumber (e.g. ERM-2026-00042),
// for a customer-facing "track my order" flow rather than a raw Mongo _id.
const getOrderByNumber = async (req, res) => {
  try {
    const order = await orderModel.findOne({ orderNumber: req.params.orderNumber });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const isOwner = order.userID.toString() === req.user._id.toString();
    if (!isOwner && req.user.userType !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: You can only access your own orders' });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order details', details: error.message });
  }
};


const updateOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status, payment, paymentStatus } = req.body;

    const order = await orderModel.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const previousStatus = order.status;
    const statusChanged = status && status !== previousStatus;

    if (status) order.status = status;
    if (typeof payment === 'boolean') order.payment = payment;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (statusChanged) order.statusHistory.push({ status, changedAt: new Date() });

    await order.save();

    // Track real sales (soldCount) as orders enter/leave 'Delivered' — feeds the admin's
    // bestseller-hybrid view without touching the manual isBestSeller flag itself.
    if (statusChanged && status === 'Delivered') {
      await Promise.all(order.items.map(item =>
        Product.findByIdAndUpdate(item.productID, { $inc: { soldCount: item.quantity } })
      ));
    } else if (statusChanged && previousStatus === 'Delivered') {
      await Promise.all(order.items.map(item =>
        Product.findByIdAndUpdate(item.productID, { $inc: { soldCount: -item.quantity } })
      ));
    }

    res.status(200).json({ message: 'Order updated successfully', order });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order', details: error.message });
  }
};


const getUserOrders = async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const userId = req.params.id;
    const authenticatedUserId = req.user._id.toString();

    if (userId !== authenticatedUserId) {
      return res.status(403).json({ error: 'Forbidden: You can only access your own orders' });
    }

    const orders = await orderModel.find({ userID: userId }).sort({ date: -1 });

    res.status(200).json({
      success: true,
      orders,
      count: orders.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user orders', details: error.message });
  }
};


const cancelOrder = async (req, res) => {
  try {
    const order = await orderModel.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const isOwner = order.userID.toString() === req.user._id.toString();
    if (!isOwner && req.user.userType !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: You can only cancel your own orders' });
    }

    if (order.status === 'Cancelled') {
      return res.status(400).json({ error: 'Order already cancelled' });
    }

    order.status = 'Cancelled';
    order.statusHistory.push({ status: 'Cancelled', changedAt: new Date() });
    await order.save();

    res.status(200).json({ message: 'Order cancelled successfully', order });
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel order', details: error.message });
  }
};


export {
  placeOrderCOD,
  placeOrderRazorpay,
  getAllOrders,
  getOrderDetails,
  getOrderByNumber,
  updateOrder,
  getUserOrders,
  cancelOrder,
  verifyAndPlaceOrder
};
