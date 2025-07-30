import {placeOrderCOD,
  placeOrderRazorpay,
  getAllOrders,
  getOrderDetails,
  updateOrderStatus,
  getUserOrders,
  verifyAndPlaceOrder,
  cancelOrder} from '../controllers/orderController.js';
import express from 'express';
import { isAdmin, isLoggedIn } from '../middlewares/auth.js';

const orderRouter = express.Router();

orderRouter.post('/place-order/cod', isLoggedIn, placeOrderCOD);
orderRouter.post('/place-order/razorpay', isLoggedIn, placeOrderRazorpay);

orderRouter.get('/', isLoggedIn, isAdmin, getAllOrders);
orderRouter.get('/:id', isLoggedIn, getOrderDetails);
orderRouter.put('/:id/status', isLoggedIn, updateOrderStatus);
orderRouter.get('/user/:id', isLoggedIn, getUserOrders);
orderRouter.delete('/:id', isLoggedIn, cancelOrder);
orderRouter.post('/verify-payment', isLoggedIn, verifyAndPlaceOrder);

export default orderRouter;
