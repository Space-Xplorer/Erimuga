import { addtocart, updateincart, getfromCart, removefromcart, clearCart, mergeCart } from '../controllers/cartController.js';
import { isLoggedIn } from '../middlewares/auth.js';
import express from 'express';

const cartRouter = express.Router();

cartRouter.post('/add', isLoggedIn, addtocart);
cartRouter.put('/update/:id', isLoggedIn, updateincart);
cartRouter.get('/get', isLoggedIn, getfromCart);
cartRouter.delete('/remove', isLoggedIn, removefromcart);
cartRouter.delete('/clear', isLoggedIn, clearCart);
cartRouter.post('/merge', isLoggedIn, mergeCart); // merges a pre-login guest cart on login

export default cartRouter;
