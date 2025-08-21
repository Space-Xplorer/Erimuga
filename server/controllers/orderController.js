import orderModel from '../models/orderModel.js';
import userModel from '../models/userModel.js';
import Razorpay from 'razorpay';
import dotenv from 'dotenv';
dotenv.config();
import crypto from 'crypto';

// const placeOrderCOD = async (req, res) => {
//   try {
//     const { userID, items, amount, address } = req.body;

//     const newOrder = new orderModel({
//       userID,
//       items,
//       amount,
//       address,
//       paymentMethod: 'COD',
//       payment: false,
//       date: Date.now(),
//     });

//     await newOrder.save();

//     // Clear user's cart after order
//     await userModel.findByIdAndUpdate(userID, { cartData: {} });

//     res.status(200).json({ message: 'Order placed with COD successfully', order: newOrder });
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to place COD order', details: error.message });
//   }
// };

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});


const placeOrderCOD = async (req, res) => {
  try {
    const { userID, items, amount, address, phone } = req.body; // ✅ include phone

    const newOrder = new orderModel({
      userID,
      items,
      amount,
      address,
      phone, // ✅ save phone
      paymentMethod: 'COD',
      payment: false,
      date: Date.now(),
    });

    await newOrder.save();
    await userModel.findByIdAndUpdate(userID, { cartData: {} });

    res.status(200).json({ message: 'Order placed with COD successfully', order: newOrder });
  } catch (error) {
    res.status(500).json({ error: 'Failed to place COD order', details: error.message });
  }
};


const placeOrderRazorpay = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount) return res.status(400).json({ error: "Amount required" });

    const options = {
      amount: amount * 100, // convert ₹ to paise
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    };

    const order = await razorpay.orders.create(options);
    console.log("🟢 Razorpay order created:", order);

    res.status(200).json(order);
  } catch (error) {
    console.error("🔴 Razorpay order error:", error);
    res.status(500).json({ error: "Razorpay order creation failed", details: error });
  }
};

// const verifyAndPlaceOrder = async (req, res) => {
//   try {
//     const {
//       razorpay_order_id,
//       razorpay_payment_id,
//       razorpay_signature,
//       userID,
//       items,
//       amount,
//       address,
//     } = req.body;

//     // STEP 1: Verify signature
//     const body = razorpay_order_id + "|" + razorpay_payment_id;
//     const expectedSignature = crypto
//      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//       .update(body.toString())
//       .digest("hex");

//     if (expectedSignature !== razorpay_signature) {
//       return res.status(400).json({ error: "Invalid payment signature" });
//     }

//     // STEP 2: Save order
//     const newOrder = new orderModel({
//       userID,
//       items,
//       amount,
//       address,
//       paymentMethod: 'Razorpay',
//       payment: true,
//       date: Date.now(),
//     });

//     await newOrder.save();
//     console.log("🟢 Order saved after payment");

//     res.status(200).json({ message: "Order placed successfully" });
//   } catch (err) {
//     console.error("🔴 Error verifying or saving order:", err);
//     res.status(500).json({ error: "Payment verification failed" });
//   }
// };


const verifyAndPlaceOrder = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userID,
      items,
      amount,
      address,
      phone, // ✅ accept phone
    } = req.body;

    // verify signature...
    
    const newOrder = new orderModel({
      userID,
      items,
      amount,
      address,
      phone, // ✅ save phone
      paymentMethod: 'Razorpay',
      payment: true,
      paymentStatus: 'paid',
      date: Date.now(),
    });

    await newOrder.save();
    res.status(200).json({ message: "Order placed successfully", order: newOrder });
  } catch (err) {
    res.status(500).json({ error: "Payment verification failed" });
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


// const updateOrderStatus = async (req, res) => {
//   try {
//     const orderId = req.params.id;
//     const { status } = req.body;

//     const updatedOrder = await orderModel.findByIdAndUpdate(orderId, { status }, { new: true });

//     if (!updatedOrder) {
//       return res.status(404).json({ error: 'Order not found' });
//     }

//     res.status(200).json({ message: 'Order status updated', order: updatedOrder });
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to update order status', details: error.message });
//   }
// };


// const updateOrder = async (req, res) => {
//   try {
//     const orderId = req.params.id;
//     const { status, payment, paymentMethod } = req.body;

//     const updateFields = {};
//     if (status) updateFields.status = status;
//     if (typeof payment === 'boolean') updateFields.payment = payment;
//     if (paymentMethod) updateFields.paymentMethod = paymentMethod;

//     const updatedOrder = await orderModel.findByIdAndUpdate(orderId, updateFields, { new: true });

//     if (!updatedOrder) {
//       return res.status(404).json({ error: 'Order not found' });
//     }

//     res.status(200).json({ message: 'Order updated successfully', order: updatedOrder });
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to update order', details: error.message });
//   }
// };


// const updateOrder = async (req, res) => {
//   try {
//     const orderId = req.params.id;
//     // ✅ 1. Add 'paymentStatus' to the destructuring
//     const { status, payment, paymentStatus, paymentMethod } = req.body;

//     const updateFields = {};
//     if (status) updateFields.status = status;
//     if (typeof payment === 'boolean') updateFields.payment = payment;
//     if (paymentMethod) updateFields.paymentMethod = paymentMethod;
//     // ✅ 2. Add 'paymentStatus' to the update object if it exists
//     if (paymentStatus) updateFields.paymentStatus = paymentStatus;

//     const updatedOrder = await orderModel.findByIdAndUpdate(
//       orderId,
//       updateFields,
//       { new: true }
//     );

//     if (!updatedOrder) {
//       return res.status(404).json({ error: 'Order not found' });
//     }

//     res.status(200).json({
//       message: 'Order updated successfully',
//       order: updatedOrder
//     });
//   } catch (error) {
//     res.status(500).json({
//       error: 'Failed to update order',
//       details: error.message
//     });
//   }
// };


// In your backend order controller file

const updateOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    
    // Log the raw data coming from the frontend
    console.log('--- Order Update Request Received ---');
    console.log('1. Request Body:', req.body);

    const { status, payment, paymentStatus } = req.body;

    const updateFields = {};
    if (status) updateFields.status = status;
    if (typeof payment === 'boolean') updateFields.payment = payment;
    if (paymentStatus) updateFields.paymentStatus = paymentStatus;
    
    // Log the data we are preparing to save
    console.log('2. Fields to be Saved:', updateFields);

    const updatedOrder = await orderModel.findByIdAndUpdate(
      orderId,
      updateFields,
      { new: true, runValidators: true } // Added runValidators as a good practice
    );
    
    // Log what the database returned after the update
    console.log('3. Result from Database:', updatedOrder);

    if (!updatedOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.status(200).json({ message: 'Order updated successfully', order: updatedOrder });
  } catch (error) {
    // Log any errors that occurred
    console.error('5. CRITICAL ERROR:', error);
    res.status(500).json({ error: 'Failed to update order', details: error.message });
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
  updateOrder,
  getUserOrders,
  cancelOrder,
  verifyAndPlaceOrder
};
 