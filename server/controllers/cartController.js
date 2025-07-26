import User from '../models/userModel.js';
import Product from '../models/productModel.js';
import mongoose from 'mongoose';

const addtocart = async (req, res) => {
  try {
    const { userId, productId, quantity, size, color, priceAtPurchase } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Ensure cartData is initialized
    if (!Array.isArray(user.cartData)) user.cartData = [];

    // Check if the product with same attributes already exists
    const existingItem = user.cartData.find(
      item =>
        item.productId.toString() === productId &&
        item.size === size &&
        item.color === color
    );

    if (existingItem) {
      // If same product + attributes exist, increase quantity
      existingItem.quantity += quantity;
    } else {
      // Add new item to cart
      user.cartData.push({
        productId,
        quantity,
        size,
        color,
        priceAtPurchase,
      });
    }

    user.markModified('cartData');
    await user.save();

    res.status(200).json({ message: "Product added to cart", cart: user.cartData });

  } catch (error) {
    res.status(500).json({ error: "Failed to add to cart", details: error.message });
  }
};


// Update quantity of product in cart
const updateincart = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.cartData[productId]) {
      user.cartData[productId] = quantity;
      await user.save();
      res.status(200).json({ message: "Cart updated", cart: user.cartData });
    } else {
      res.status(404).json({ error: "Product not in cart" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to update cart", details: error.message });
  }
};

// Get all items in cart
const getfromCart = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const cartArray = user.cartData || [];

    res.status(200).json({ cart: cartArray });
  } catch (error) {
    console.error("Error in getfromCart:", error);
    res.status(500).json({ error: "Failed to get cart", details: error.message });
  }
};



const removefromcart = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.cartData[productId]) {
      delete user.cartData[productId];
      await user.save();
      res.status(200).json({ message: "Product removed from cart", cart: user.cartData });
    } else {
      res.status(404).json({ error: "Product not in cart" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to remove from cart", details: error.message });
  }
};


export { addtocart, updateincart, getfromCart, removefromcart };
