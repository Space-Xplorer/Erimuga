import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';
import { uploadToCloudinary } from '../config/cloudinary.js';
import fs from 'fs';
import { generateBaseProductCode } from '../utils/generatebasecode.js';

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ date: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    order.status = status;
    await order.save();
    res.status(200).json({ message: 'Order status updated', order });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order status' });
  }
};


export const addProduct = async (req, res) => {
  try {
    console.log('addProduct called - req.body:', req.body);
    console.log('addProduct called - req.files:', req.files);
    
    const {
      name,
      mainCategory,
      apparelType,
      subcategory,
      description,
      price,
      availableSizes,
      availableColors,
      isBestSeller
    } = req.body;

    // Generate structured base product code (e.g. TS-MEN-0001)
    const productCode = await generateBaseProductCode(mainCategory, subcategory, apparelType);

    // Upload images to Cloudinary
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(async (file) => {
        const result = await uploadToCloudinary(file.path, {
          folder: `erimuga/products/${mainCategory}`,
        });
        fs.unlinkSync(file.path); // remove local file after upload
        return result.url; // Changed from result.secure_url to result.url
      });

      imageUrls = await Promise.all(uploadPromises);
    }

    // Create new product
    const newProduct = new Product({
      productCode,
      name,
      mainCategory,
      apparelType,
      subcategory,
      description,
      price,
      image: imageUrls,
      availableSizes: availableSizes?.split(',').map((s) => s.trim()),
      availableColors: availableColors?.split(',').map((c) => c.trim()),
      isBestSeller: isBestSeller || 'no'
    });

    await newProduct.save();

    res.status(201).json({ message: 'Product added successfully', product: newProduct });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add product', details: err.message });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products', details: err.message });
  }
};

// EDIT PRODUCT ✅
export const editProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      mainCategory,
      apparelType,
      subcategory,
      description,
      price,
      availableSizes,
      availableColors,
      isBestSeller,
    } = req.body;

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    // Optional new images
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(async (file) => {
        const result = await uploadToCloudinary(file.path, {
          folder: `erimuga/products/${mainCategory}`,
        });
        fs.unlinkSync(file.path);
        return result.url; // Changed from result.secure_url to result.url
      });

      product.image = await Promise.all(uploadPromises);
    }

    product.name = name || product.name;
    product.mainCategory = mainCategory || product.mainCategory;
    product.apparelType = apparelType || product.apparelType;
    product.subcategory = subcategory || product.subcategory;
    product.description = description || product.description;
    product.price = price || product.price;
    product.availableSizes = availableSizes?.split(',').map((s) => s.trim()) || product.availableSizes;
    product.availableColors = availableColors?.split(',').map((c) => c.trim()) || product.availableColors;
    product.isBestSeller = isBestSeller || product.isBestSeller;

    await product.save();
    res.status(200).json({ message: 'Product updated', product });
  } catch (err) {
    res.status(500).json({ error: 'Failed to edit product', details: err.message });
  }
};


export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("🧠 Delete request received for product ID:", id);

    const product = await Product.findById(id);
    if (!product) {
      console.warn("⚠️ Product not found for ID:", id);
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    console.log("📦 Found product:", {
      id: product._id,
      name: product.name,
      image: product.image,
    });

    // ✅ Handle all image formats safely
    if (Array.isArray(product.image)) {
      // multiple images
      for (const img of product.image) {
        if (img?.public_id) {
          try {
            await cloudinary.uploader.destroy(img.public_id);
            console.log("🗑️ Deleted Cloudinary image:", img.public_id);
          } catch (err) {
            console.warn("⚠️ Cloudinary deletion failed for", img.public_id, ":", err.message);
          }
        }
      }
    } else if (product.image?.public_id) {
      // single image object
      try {
        await cloudinary.uploader.destroy(product.image.public_id);
        console.log("🗑️ Deleted Cloudinary image:", product.image.public_id);
      } catch (err) {
        console.warn("⚠️ Cloudinary deletion failed:", err.message);
      }
    } else {
      console.log("ℹ️ No Cloudinary image found (URL or missing public_id). Skipping deletion.");
    }

    // ✅ Delete product document
    await Product.findByIdAndDelete(id);
    console.log("✅ Product deleted successfully:", id);

    // ✅ Clean success response
    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error deleting product:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while deleting product",
      error: error.message,
    });
  }
};