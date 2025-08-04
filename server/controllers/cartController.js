import User from '../models/userModel.js';
import Product from '../models/productModel.js';
import mongoose from 'mongoose';

const addtocart = async (req, res) => {
  try {
    const { userId, productId, selectedSize, selectedColor, quantity } = req.body;
    console.log("Request body:", req.body);

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });

    const fullProductCode = `${product.productCode}-${selectedColor}-${selectedSize}` || product.productCode;

    // Ensure cartData exists
    if (!Array.isArray(user.cartData)) user.cartData = [];

    // Check if item already exists
    const existingItem = user.cartData.find(item =>
      item.productId.toString() === productId &&
      item.size === selectedSize &&
      item.color === selectedColor
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      console.log("✅ Product fetched:", product);
      console.log("✅ Product name:", product.name);

      user.cartData.push({
        productId,
        productName: product.name, // Ensure product name is included
        quantity,
        size: selectedSize,
        color: selectedColor,
        priceAtPurchase: product.price,
        productCode: fullProductCode 
      });
    }

    user.markModified('cartData');
    await user.save();

    res.status(200).json({ message: "Product added to cart", cart: user.cartData });

  } catch (error) {
    console.error("Error in addtocart:", error);
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
    const { userId, productCode } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const initialLength = user.cartData.length;

    // Remove by productCode
  user.cartData = user.cartData.filter((item) => {
  const codeMatch = `${item.productCode}` === productCode;
  const fullMatch = `${item.productCode || item.productId}-${item.color}-${item.size}` === productCode;

  // Remove item if either of these match
  return !(codeMatch || fullMatch);
  });

    if (user.cartData.length === initialLength) {
      return res.status(404).json({ error: "Product not in cart" });
    }

    await user.save();
    res.status(200).json({ message: "Product removed from cart", cart: user.cartData });
  } catch (error) {
    console.error("Error in removefromcart:", error);
    res.status(500).json({ error: "Failed to remove from cart", details: error.message });
  }
};

// DELETE /cart/clear
const clearCart = async (req, res) => {
  const { userId } = req.body;
  try {
    await User.findByIdAndUpdate(userId, { cartData: [] });
    res.json({ success: true, message: 'Cart cleared successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear cart' });
  }
};

export { addtocart, updateincart, getfromCart, removefromcart, clearCart };
