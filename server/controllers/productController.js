import Product from "../models/productModel.js";
import fs from "fs";
import path from "path";
import { uploadToCloudinary, uploadMultipleImages } from "../config/cloudinary.js";

// Add new product
const addProduct = async (req, res) => {
  try {
    const { name, mainCategory, apparelType, subcategory, description, price } = req.body;
    
    // Upload images to Cloudinary
    let cloudinaryUrls = [];
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(async (file) => {
        const result = await uploadToCloudinary(file.path, {
          folder: `erimuga/products/${mainCategory}`,
        });
        // Delete the local file after upload
        fs.unlinkSync(file.path);
        return result.secure_url;
      });
      
      cloudinaryUrls = await Promise.all(uploadPromises);
    }

    const newProduct = new Product({
      name,
      mainCategory,
      apparelType,
      subcategory,
      description,
      price,
      image: cloudinaryUrls
    });

    await newProduct.save();
    res.status(201).json({ message: "Product added successfully", product: newProduct });
  } catch (error) {
    res.status(500).json({ error: "Failed to add product", details: error.message });
  }
};

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

// Update product
const updateProduct = async (req, res) => {
  try {
    const { name, mainCategory, apparelType, subcategory, description, price, isBestSeller } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ error: "Product not found" });

    const newImages = req.files?.map((file) => file.filename) || product.image;

    product.name = name || product.name;
    product.mainCategory = mainCategory || product.mainCategory;
    product.apparelType = apparelType || product.apparelType;
    product.subcategory = subcategory || product.subcategory;
    product.description = description || product.description;
    product.price = price || product.price;
    product.image = newImages;
    product.isBestSeller = isBestSeller || product.isBestSeller; // ✅ Added

    await product.save();
    res.status(200).json({ message: "Product updated", product });
  } catch (error) {
    res.status(500).json({ error: "Failed to update product", details: error.message });
  }
};

// Delete product
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) return res.status(404).json({ error: "Product not found" });

    // Optionally delete images from uploads
    product.image.forEach((filename) => {
      const filePath = path.join("uploads", filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    });

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete product" });
  }
};

export {
  addProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
