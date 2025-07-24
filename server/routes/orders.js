import {placeOrderCOD,
  placeOrderRazorpay,
  getAllOrders,
  getOrderDetails,
  updateOrderStatus,
  getUserOrders,
  cancelOrder} from '../controllers/orderController.js';
import express from 'express';

const orderRouter = express.Router();

orderRouter.post('/place-order/cod', placeOrderCOD);
orderRouter.post('/place-order/razorpay', placeOrderRazorpay);
orderRouter.get('/', getAllOrders);
orderRouter.get('/:id', getOrderDetails);
orderRouter.put('/:id/status', updateOrderStatus);
orderRouter.get('/user/:id', getUserOrders);
orderRouter.delete('/:id', cancelOrder);

export default orderRouter;
