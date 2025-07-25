import express from "express";
import {
  addProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import upload from "../middlewares/multer.js";

const productRouter = express.Router();

// Multiple image upload with field name "images"
productRouter.post("/create", upload.array("images", 5), addProduct);
productRouter.get("/", getProducts);
productRouter.get("/:id", getProductById);
productRouter.put("/:id", upload.array("images", 5), updateProduct);
productRouter.delete("/:id", deleteProduct);

export default productRouter;
