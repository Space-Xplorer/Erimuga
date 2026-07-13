import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  // Human-readable order number, e.g. ERM-2026-00042
  orderNumber: { type: String, unique: true, sparse: true },

  userID: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true, index: true },

  // Snapshot of items at time of purchase so product edits don't affect history
  items: [
    {
      productID: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      productName: { type: String },
      productCode: { type: String },
      price: { type: Number },
      quantity: { type: Number, required: true },
      size: { type: String },
      color: { type: String },
    }
  ],

  amount: { type: Number, required: true },

  address: {
    street: String,
    city: String,
    state: String,
    zip: String,
    postalCode: String,
    country: String,
  },

  phone: { type: String, required: true },

  status: {
    type: String,
    enum: ['Order Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned'],
    default: 'Order Placed',
    required: true,
    index: true,
  },

  paymentMethod: {
    type: String,
    required: true,
    enum: ['Online', 'COD'],
  },

  paymentStatus: {
    type: String,
    trim: true,
    enum: [
      'pending',
      'paid',
      'failed',
      'COD - Pending',
      'COD - Received',
      'refunded',
      'Razorpay - Pending',
      'Razorpay - Received',
      'Razorpay - Refunded'
    ],
    default: 'pending'
  },

  payment: { type: Boolean, required: true, default: false },

  couponCode: { type: String, default: null },
  discountAmount: { type: Number, default: 0 },

  // Timeline of status changes, for customer-facing order tracking
  statusHistory: {
    type: [{ status: String, changedAt: { type: Date, default: Date.now } }],
    default: [],
  },

  date: { type: Date, default: Date.now }
});

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
export default Order;
