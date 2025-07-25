import User from '../models/userModel.js';
import mongoose from 'mongoose';

// Add product to cart
const addtocart = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.cartData[productId]) {
      user.cartData[productId] += quantity;
    } else {
      user.cartData[productId] = quantity;
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

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json({ cart: user.cartData });
  } catch (error) {
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
