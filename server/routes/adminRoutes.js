import express from 'express';
import { isAdmin, isLoggedIn } from '../middlewares/auth.js';
import { validateProduct } from '../middlewares/validate.js';
import { getAllOrders, addProduct, getAllProducts, editProduct, deleteProduct, getOrderStats, getAllCustomers, getCustomerDetail, getContactMessages, markContactMessageRead } from '../controllers/adminController.js';
import upload from '../middlewares/multer.js';


const adminRouter = express.Router();

adminRouter.get('/orders', isLoggedIn, isAdmin, getAllOrders);
// Order status updates go through orders.js's PUT /orders/:id/status (orderController.updateOrder) —
// that was the one the admin UI actually calls; this duplicate route/controller has been removed.
adminRouter.post('/add-product', isLoggedIn, isAdmin, upload.array('images'), validateProduct, addProduct);
adminRouter.get('/products', isLoggedIn, isAdmin, getAllProducts);
// Edit now runs the same validation as add — it previously ran none, so an edit
// could write a category pair that add would have rejected.
adminRouter.put('/edit-product/:id', isLoggedIn, isAdmin, upload.array('images'), validateProduct, editProduct);
adminRouter.delete('/delete-product/:id', isLoggedIn, isAdmin, deleteProduct);
adminRouter.get('/order-stats', isLoggedIn, isAdmin, getOrderStats);
adminRouter.get('/customers', isLoggedIn, isAdmin, getAllCustomers);
adminRouter.get('/customers/:id', isLoggedIn, isAdmin, getCustomerDetail);
adminRouter.get('/contact-messages', isLoggedIn, isAdmin, getContactMessages);
adminRouter.put('/contact-messages/:id/read', isLoggedIn, isAdmin, markContactMessageRead);




export default adminRouter;
