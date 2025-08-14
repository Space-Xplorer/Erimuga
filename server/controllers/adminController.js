import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';
import { uploadToCloudinary } from '../config/cloudinary.js';
import fs from 'fs/promises';
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

    // Generate structured base product code
    const productCode = await generateBaseProductCode(mainCategory, subcategory, apparelType);

    // Upload images to Cloudinary
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(async (file) => {
        const result = await uploadToCloudinary(file.path, {
          folder: `erimuga/products/${mainCategory}`,
        });
        await fs.unlink(file.path); // delete temp file
        return result.url; // FIX: use returned object property
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
      imagesToDelete // Array of Cloudinary public_ids or URLs
    } = req.body;

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    // --- 1. Handle image deletions
    if (imagesToDelete && Array.isArray(imagesToDelete) && imagesToDelete.length > 0) {
      for (const img of imagesToDelete) {
        // If frontend sends URL, extract public_id
        let publicId = img;
        if (img.startsWith('http')) {
          const parts = img.split('/');
          publicId = parts.slice(-2).join('/').split('.')[0]; // folder/file without extension
        }

        try {
          await cloudinary.uploader.destroy(publicId);
          console.log(`Deleted from Cloudinary: ${publicId}`);
        } catch (err) {
          console.error(`Failed to delete from Cloudinary: ${publicId}`, err);
        }

        // Remove from product.image array
        product.image = product.image.filter(i => i !== img);
      }
    }

    // --- 2. Handle new image uploads
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(async (file) => {
        const result = await uploadToCloudinary(file.path, {
          folder: `erimuga/products/${mainCategory || product.mainCategory}`,
        });
        await fs.unlink(file.path); // delete temp file
        return result.url;
      });

      const newImageUrls = await Promise.all(uploadPromises);
      product.image = product.image.concat(newImageUrls); // Append new ones
    }

    // --- 3. Update fields
    if (name !== undefined) product.name = name;
    if (mainCategory !== undefined) product.mainCategory = mainCategory;
    if (apparelType !== undefined) product.apparelType = apparelType;
    if (subcategory !== undefined) product.subcategory = subcategory;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = price;
    if (isBestSeller !== undefined) product.isBestSeller = isBestSeller;

    if (availableSizes !== undefined) {
      product.availableSizes = availableSizes.split(',').map((s) => s.trim());
    }
    if (availableColors !== undefined) {
      product.availableColors = availableColors.split(',').map((c) => c.trim());
    }

    await product.save();
    res.status(200).json({ message: 'Product updated', product });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to edit product', details: err.message });
  }
};

// DELETE PRODUCT ✅
export const deleteProduct = async (req, res) => {
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