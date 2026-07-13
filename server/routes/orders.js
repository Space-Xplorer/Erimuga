import {placeOrderCOD,
  placeOrderRazorpay,
  getAllOrders,
  getOrderDetails,
  getOrderByNumber,
  updateOrder,
  getUserOrders,
  verifyAndPlaceOrder,
  cancelOrder} from '../controllers/orderController.js';
import express from 'express';
import { isAdmin, isLoggedIn } from '../middlewares/auth.js';

const orderRouter = express.Router();

// ✅ Fixed route order - specific routes first, generic routes last
orderRouter.post('/place-order/cod', isLoggedIn, placeOrderCOD);
orderRouter.post('/place-order/razorpay', isLoggedIn, placeOrderRazorpay);
orderRouter.post('/verify-payment', isLoggedIn, verifyAndPlaceOrder);

// Admin routes
orderRouter.get('/', isLoggedIn, isAdmin, getAllOrders);

// User-specific routes (must come before generic :id routes)
orderRouter.get('/user/:id', isLoggedIn, getUserOrders);
orderRouter.get('/track/:orderNumber', isLoggedIn, getOrderByNumber); // ownership checked in controller (owner or admin)

// Generic order routes (keep these last)
orderRouter.put('/:id/status', isLoggedIn, isAdmin, updateOrder);
orderRouter.delete('/:id', isLoggedIn, cancelOrder); // ownership checked in controller (owner or admin)
orderRouter.get('/:id', isLoggedIn, getOrderDetails); // ownership checked in controller (owner or admin)

export default orderRouter;
