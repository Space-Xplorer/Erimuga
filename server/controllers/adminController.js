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
        return result.secure_url;
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
        return result.secure_url;
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

// DELETE PRODUCT ✅
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    await product.deleteOne();

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete product', details: err.message });
  }
};