import {placeOrderCOD,
  placeOrderRazorpay,
  getAllOrders,
  getOrderDetails,
  updateOrder,
  getUserOrders,
  verifyAndPlaceOrder,
  cancelOrder} from '../controllers/orderController.js';
import express from 'express';
import { isAdmin, isLoggedIn } from '../middlewares/auth.js';

const orderRouter = express.Router();

orderRouter.post('/place-order/cod', isLoggedIn, placeOrderCOD);
orderRouter.post('/place-order/razorpay', isLoggedIn, placeOrderRazorpay);

orderRouter.get('/', isLoggedIn, isAdmin, getAllOrders);

orderRouter.get('/user/:id', isLoggedIn, getUserOrders);   // 👈 move above
orderRouter.put('/:id/status', isLoggedIn, updateOrder);   // 👈 more specific before
orderRouter.delete('/:id', isLoggedIn, cancelOrder);
orderRouter.get('/:id', isLoggedIn, getOrderDetails);      // 👈 keep generic last

orderRouter.post('/verify-payment', isLoggedIn, verifyAndPlaceOrder);


export default orderRouter;
