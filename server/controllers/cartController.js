import User from '../models/userModel.js';
import Product from '../models/productModel.js';
import mongoose from 'mongoose';

const addtocart = async (req, res) => {
  try {
    const { userId, productId, selectedSize, selectedColor, quantity } = req.body;

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
      user.cartData.push({
        productId,
        productName: product.name,
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

// ✅ Fixed: Update quantity of product in cart
const updateincart = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    if (!userId || !productId || quantity === undefined) {
      return res.status(400).json({ error: "userId, productId, and quantity are required" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Find the item in cart by productId
    const cartItem = user.cartData.find(item => item.productId.toString() === productId);
    
    if (!cartItem) {
      return res.status(404).json({ error: "Product not found in cart" });
    }

    // Update quantity
    cartItem.quantity = quantity;
    
    // Remove item if quantity is 0 or negative
    if (quantity <= 0) {
      user.cartData = user.cartData.filter(item => item.productId.toString() !== productId);
    }

    user.markModified('cartData');
    await user.save();

    res.status(200).json({ 
      message: "Cart updated", 
      cartData: user.cartData 
    });
  } catch (error) {
    console.error("Error in updateincart:", error);
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

    if (!userId || !productCode) {
      return res.status(400).json({ error: "userId and productCode are required" });
    }

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
      return res.status(404).json({ error: "Product not found in cart" });
    }

    user.markModified('cartData');
    await user.save();
    
    res.status(200).json({ message: "Product removed from cart", cart: user.cartData });
  } catch (error) {
    console.error("Error in removefromcart:", error);
    res.status(500).json({ error: "Failed to remove from cart", details: error.message });
  }
};

// DELETE /cart/clear
const clearCart = async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.cartData = [];
    await user.save();
    
    res.json({ success: true, message: 'Cart cleared successfully' });
  } catch (err) {
    console.error("Error in clearCart:", err);
    res.status(500).json({ error: 'Failed to clear cart', details: err.message });
  }
};

export { addtocart, updateincart, getfromCart, removefromcart, clearCart };
