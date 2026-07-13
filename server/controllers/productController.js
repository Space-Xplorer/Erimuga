import Product from "../models/productModel.js";
import MainCategory from "../models/mainCategoryModel.js";
import ApparelType from "../models/apparelTypeModel.js";
import Subcategory from "../models/subCategoryModel.js";
import fs from "fs";
import path from "path";
import { uploadToCloudinary, uploadMultipleImages } from "../config/cloudinary.js";

const getProducts = async (req, res) => {
  try {
    const { search, mainCategory, apparelType, subcategory, sortBy } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (mainCategory) query.mainCategory = mainCategory;
    if (apparelType) query.apparelType = apparelType;
    if (subcategory) query.subcategory = subcategory;

    let sort = { date: -1 }; // default: newest first
    if (sortBy === 'priceLowHigh') sort = { price: 1 };
    else if (sortBy === 'priceHighLow') sort = { price: -1 };

    const products = await Product.find(query).sort(sort);
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
