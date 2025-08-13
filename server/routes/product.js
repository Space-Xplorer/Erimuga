import express from "express";
import {
  getProducts,
  getProductById
} from "../controllers/productController.js";
import upload from "../middlewares/multer.js";

const productRouter = express.Router();

// Multiple image upload with field name "images"
productRouter.get("/", getProducts);
productRouter.get("/:id", getProductById);

export default productRouter;
