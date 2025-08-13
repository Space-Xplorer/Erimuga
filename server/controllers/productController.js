import Product from "../models/productModel.js";
import MainCategory from "../models/mainCategoryModel.js";
import ApparelType from "../models/apparelTypeModel.js";
import Subcategory from "../models/subCategoryModel.js";
import fs from "fs";
import path from "path";
import { uploadToCloudinary, uploadMultipleImages } from "../config/cloudinary.js";

// Get all products
const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ date: -1 });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

// Get product by ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch product" });
  }
};

export {
  getProducts,
  getProductById
};
