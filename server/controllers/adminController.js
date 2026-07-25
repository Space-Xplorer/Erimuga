import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';
import User from '../models/userModel.js';
import ContactMessage from '../models/contactMessageModel.js';
import MainCategory from '../models/mainCategoryModel.js';
import cloudinary, { uploadToCloudinary } from '../config/cloudinary.js';
import fs from 'fs';
import { generateBaseProductCode } from '../utils/generatebasecode.js';

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('userID', 'name email')
      .populate('items.productID', 'name colors')
      .sort({ date: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

export const getOrderStats = async (req, res) => {
  try {
    const orders = await Order.find();

    const totalOrders = orders.length;
    const totalRevenue = orders
      .filter(o => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + (o.amount || 0), 0);

    const revenueOverTime = {};
    const paymentMethods = {};
    const topProducts = {};

    orders.forEach(o => {
      const date = new Date(o.date).toISOString().split('T')[0];
      if (o.status !== 'Cancelled') {
        revenueOverTime[date] = (revenueOverTime[date] || 0) + (o.amount || 0);
      }

      paymentMethods[o.paymentMethod] = (paymentMethods[o.paymentMethod] || 0) + 1;

      (o.items || []).forEach(item => {
        const name = item.productName || item.productID?.toString() || 'Unknown';
        topProducts[name] = (topProducts[name] || 0) + (item.quantity || 1);
      });
    });

    const formattedRevenueOverTime = Object.entries(revenueOverTime)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, revenue]) => ({ date, revenue }));

    const formattedPaymentMethods = Object.entries(paymentMethods)
      .map(([method, count]) => ({ method, count }));

    const topProduct = Object.entries(topProducts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    const shipped = orders.filter(o => o.status === 'Shipped').length;
    const delivered = orders.filter(o => o.status === 'Delivered').length;
    const cancelled = orders.filter(o => o.status === 'Cancelled').length;

    res.json({
      totalOrders,
      totalRevenue,
      shipped,
      delivered,
      cancelled,
      revenueOverTime: formattedRevenueOverTime,
      paymentMethods: formattedPaymentMethods,
      topProduct,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order stats', details: error.message });
  }
};


// The admin form sends tags as a JSON array; tolerate a comma-separated string
// so the endpoint stays usable from curl and older clients.
const parseTags = (tagsInput) => {
  if (!tagsInput) return [];
  if (Array.isArray(tagsInput)) return tagsInput.map(t => String(t).trim()).filter(Boolean);
  try {
    const parsed = JSON.parse(tagsInput);
    if (Array.isArray(parsed)) return parsed.map(t => String(t).trim()).filter(Boolean);
  } catch { /* not JSON — treat as CSV below */ }
  return String(tagsInput).split(',').map(t => t.trim()).filter(Boolean);
};

const parseVariants = (sizes, colors, variantsJson) => {
  if (variantsJson) {
    try { return JSON.parse(variantsJson); } catch { /* fall through */ }
  }
  const sizeArr = sizes ? sizes.split(',').map(s => s.trim()).filter(Boolean) : [''];
  const colorArr = colors ? colors.split(',').map(c => c.trim()).filter(Boolean) : [''];
  const variants = [];
  for (const size of sizeArr) {
    for (const color of colorArr) {
      variants.push({ size, color, stock: 0 });
    }
  }
  return variants;
};

// Uploads files (in order) and groups them into `colors` by the parallel
// `imageColorIndex` array sent from the admin form (index into `colorsMeta`).
const buildColorsFromUpload = async (req, mainCategory, colorsMeta) => {
  const imageColorIndex = req.body.imageColorIndex ? JSON.parse(req.body.imageColorIndex) : [];

  let uploaded = [];
  if (req.files && req.files.length > 0) {
    uploaded = await Promise.all(req.files.map(async (file) => {
      const result = await uploadToCloudinary(file.path, { folder: `erimuga/products/${mainCategory}` });
      fs.unlinkSync(file.path);
      return { url: result.url, public_id: result.public_id };
    }));
  }

  return colorsMeta.map((c, idx) => {
    const existing = c.existingImages || [];
    const newOnes = uploaded.filter((_, i) => imageColorIndex[i] === idx);
    return { name: c.name, swatchHex: c.swatchHex || '', images: [...existing, ...newOnes] };
  });
};

export const addProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      availableSizes,
      availableColors,
      isBestSeller,
      tags: tagsJson,
      variants: variantsJson,
      colorsMeta: colorsMetaJson,
    } = req.body;

    // Guaranteed present and consistent by validateProduct.
    const { main, sub } = req.resolvedCategory;

    const productCode = await generateBaseProductCode(main.name, sub.name);

    const colorsMeta = colorsMetaJson ? JSON.parse(colorsMetaJson) : [];
    const colors = await buildColorsFromUpload(req, main.slug, colorsMeta);

    const sizes = availableSizes?.split(',').map(s => s.trim()).filter(Boolean) || [];
    const colorNames = availableColors?.split(',').map(c => c.trim()).filter(Boolean) || [];
    const variants = parseVariants(availableSizes, availableColors, variantsJson);

    const newProduct = new Product({
      productCode,
      name,
      mainCategory: main.slug,
      subcategory: sub.slug,
      mainCategoryId: main._id,
      subcategoryId: sub._id,
      tags: parseTags(tagsJson),
      description,
      price,
      colors,
      availableSizes: sizes,
      availableColors: colorNames,
      variants,
      isBestSeller: isBestSeller || 'no',
    });

    await newProduct.save();
    res.status(201).json({ message: 'Product added successfully', product: newProduct });
  } catch (err) {
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

export const editProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      availableSizes,
      availableColors,
      isBestSeller,
      tags: tagsJson,
      variants: variantsJson,
      colorsMeta: colorsMetaJson,
    } = req.body;

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    // validateProduct resolved and cross-checked the category pair for us.
    const { main, sub } = req.resolvedCategory;

    if (colorsMetaJson) {
      const colorsMeta = JSON.parse(colorsMetaJson);
      const newColors = await buildColorsFromUpload(req, main.slug, colorsMeta);

      // Clean up any Cloudinary images the admin removed in this edit
      const keptPublicIds = new Set(
        newColors.flatMap((c) => c.images.map((img) => img.public_id).filter(Boolean))
      );
      const oldPublicIds = product.colors.flatMap((c) => c.images.map((img) => img.public_id).filter(Boolean));
      const removedPublicIds = oldPublicIds.filter((pid) => !keptPublicIds.has(pid));
      await Promise.all(removedPublicIds.map((pid) =>
        cloudinary.uploader.destroy(pid).catch((err) => console.warn('Cloudinary cleanup failed for', pid, err.message))
      ));

      product.colors = newColors;
    }

    product.name = name || product.name;
    product.mainCategory = main.slug;
    product.subcategory = sub.slug;
    product.mainCategoryId = main._id;
    product.subcategoryId = sub._id;
    product.description = description || product.description;
    product.price = price || product.price;
    product.isBestSeller = isBestSeller || product.isBestSeller;
    if (tagsJson !== undefined) product.tags = parseTags(tagsJson);

    if (availableSizes !== undefined) {
      product.availableSizes = availableSizes.split(',').map(s => s.trim()).filter(Boolean);
    }
    if (availableColors !== undefined) {
      product.availableColors = availableColors.split(',').map(c => c.trim()).filter(Boolean);
    }

    product.variants = parseVariants(
      availableSizes ?? product.availableSizes.join(','),
      availableColors ?? product.availableColors.join(','),
      variantsJson
    );

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
      colors: product.colors?.length || 0,
    });

    // ✅ Delete every colour's images from Cloudinary
    const publicIds = (product.colors || []).flatMap((c) => c.images.map((img) => img.public_id).filter(Boolean));
    await Promise.all(publicIds.map(async (pid) => {
      try {
        await cloudinary.uploader.destroy(pid);
        console.log("🗑️ Deleted Cloudinary image:", pid);
      } catch (err) {
        console.warn("⚠️ Cloudinary deletion failed for", pid, ":", err.message);
      }
    }));

    // ✅ Delete product document
    await Product.findByIdAndDelete(id);
    console.log("✅ Product deleted successfully:", id);

    // Drop it from any homepage rail that hand-picked it, otherwise the band
    // would render a hole where the deleted product used to be.
    await MainCategory.updateMany(
      { featuredProducts: id },
      { $pull: { featuredProducts: id } }
    );

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

export const getAllCustomers = async (req, res) => {
  try {
    const users = await User.find({ userType: 'user' }, 'name email phonenumber createdAt').sort({ createdAt: -1 });

    const orders = await Order.aggregate([
      {
        $group: {
          _id: '$userID',
          orderCount: { $sum: 1 },
          totalSpent: { $sum: { $cond: [{ $ne: ['$status', 'Cancelled'] }, '$amount', 0] } },
        }
      }
    ]);

    const orderMap = {};
    orders.forEach(o => { orderMap[o._id] = o; });

    const customers = users.map(u => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      phone: u.phonenumber || '—',
      orderCount: orderMap[u._id.toString()]?.orderCount || 0,
      totalSpent: orderMap[u._id.toString()]?.totalSpent || 0,
      joinedAt: u.createdAt,
    }));

    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch customers', details: err.message });
  }
};

export const getCustomerDetail = async (req, res) => {
  try {
    const user = await User.findById(req.params.id, 'name email phonenumber createdAt');
    if (!user) return res.status(404).json({ error: 'Customer not found' });

    const orders = await Order.find({ userID: req.params.id }).sort({ date: -1 });

    res.json({ user, orders });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch customer detail', details: err.message });
  }
};

export const getContactMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages', details: err.message });
  }
};

export const markContactMessageRead = async (req, res) => {
  try {
    const message = await ContactMessage.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    if (!message) return res.status(404).json({ error: 'Message not found' });
    res.json({ message: 'Marked as read', contactMessage: message });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update message', details: err.message });
  }
};