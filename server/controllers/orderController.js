import orderModel from '../models/orderModel.js';
import userModel from '../models/userModel.js';

const placeOrderCOD = async (req, res) => {
  try {
    const { userID, items, amount, address } = req.body;

    const newOrder = new orderModel({
      userID,
      items,
      amount,
      address,
      paymentMethod: 'COD',
      payment: false,
      date: Date.now(),
    });

    await newOrder.save();

    // Clear user's cart after order
    await userModel.findByIdAndUpdate(userID, { cartData: {} });

    res.status(200).json({ message: 'Order placed with COD successfully', order: newOrder });
  } catch (error) {
    res.status(500).json({ error: 'Failed to place COD order', details: error.message });
  }
};

const placeOrderRazorpay = async (req, res) => {
  try {
    const { userID, items, amount, address } = req.body;

    const newOrder = new orderModel({
      userID,
      items,
      amount,
      address,
      paymentMethod: 'Razorpay',
      payment: true,
      date: Date.now(),
    });

    await newOrder.save();

    // Clear user's cart after order
    await userModel.findByIdAndUpdate(userID, { cartData: {} });

    res.status(200).json({ message: 'Order placed with Razorpay successfully', order: newOrder });
  } catch (error) {
    res.status(500).json({ error: 'Failed to place Razorpay order', details: error.message });
  }
};
// Get all orders

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
    const orderId = req.params.id;
    const order = await orderModel.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order details', details: error.message });
  }
};


const updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;

    const updatedOrder = await orderModel.findByIdAndUpdate(orderId, { status }, { new: true });

    if (!updatedOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.status(200).json({ message: 'Order status updated', order: updatedOrder });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order status', details: error.message });
  }
};


const getUserOrders = async (req, res) => {
  try {
    const userId = req.params.id;
    const orders = await orderModel.find({ userID: userId }).sort({ date: -1 });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user orders', details: error.message });
  }
};


const cancelOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await orderModel.findById(orderId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.status === 'Cancelled') {
      return res.status(400).json({ error: 'Order already cancelled' });
    }

    order.status = 'Cancelled';
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
  updateOrderStatus,
  getUserOrders,
  cancelOrder
};
 