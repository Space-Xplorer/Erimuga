import express from 'express';
// import { isAdmin, isLoggedIn } from '../middlewares/auth.js';
import { getAllOrders, updateOrderStatus } from '../controllers/adminController.js';
import Order from '../models/orderModel.js';

const adminRouter = express.Router();

// adminRouter.get('/orders', isLoggedIn, isAdmin, getAllOrders);
adminRouter.get('/orders', getAllOrders);
adminRouter.put('/orders/:id', updateOrderStatus);

adminRouter.get('/order-stats', async (req, res) => {
  const orders = await Order.find();

  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

  const ordersByCategory = {};
  const revenueOverTime = {};
  const paymentMethods = {};

  const topProducts = {};

  orders.forEach(o => {
    const date = new Date(o.createdAt).toISOString().split('T')[0];
    revenueOverTime[date] = (revenueOverTime[date] || 0) + o.totalAmount;

    const category = o.category || 'Unknown';
    ordersByCategory[category] = (ordersByCategory[category] || 0) + 1;

    paymentMethods[o.paymentMethod] = (paymentMethods[o.paymentMethod] || 0) + 1;

    o.items.forEach(item => {
      topProducts[item.name] = (topProducts[item.name] || 0) + item.quantity;
    });
  });

  const formattedRevenueOverTime = Object.entries(revenueOverTime).map(([date, revenue]) => ({
    date,
    revenue,
  }));

  const formattedOrdersByCategory = Object.entries(ordersByCategory).map(([category, orders]) => ({
    category,
    orders,
  }));

  const formattedPaymentMethods = Object.entries(paymentMethods).map(([method, count]) => ({
    method,
    count,
  }));

  const topProduct = Object.entries(topProducts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

  res.json({
    totalOrders,
    totalRevenue,
    ordersByCategory: formattedOrdersByCategory,
    revenueOverTime: formattedRevenueOverTime,
    paymentMethods: formattedPaymentMethods,
    topProduct,
  });
});


export default adminRouter;
