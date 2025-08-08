import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userID: { type: String, required: true },
  items: { type: Array, required: true },
  amount: { type: Number, required: true },
  address: { type: Object, required: true },
  status: { type: String, required: true, default: 'Order Placed' },
  paymentMethod: { type: String, required: true },
  
  // ✅ ADD THIS LINE
  paymentStatus: { type: String, trim: true },

  payment: { type: Boolean, required: true, default: false },
  date: { type: Number, required: true }
});

// A small best practice is to use a capitalized name for your model.
const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

export default Order;