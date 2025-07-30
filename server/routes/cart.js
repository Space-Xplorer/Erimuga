import {addtocart, updateincart, getfromCart, removefromcart, clearCart} from '../controllers/cartController.js';
import express from 'express';

const cartRouter = express.Router();

cartRouter.post("/add", addtocart);
cartRouter.put("/update/:id", updateincart);
cartRouter.get("/get", getfromCart);
cartRouter.delete("/remove", removefromcart);
cartRouter.delete("/clear", clearCart);

export default cartRouter;
