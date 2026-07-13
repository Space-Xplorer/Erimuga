import User from '../models/userModel.js';
import Product from '../models/productModel.js';

const addtocart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, selectedSize, selectedColor, quantity } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const fullProductCode = `${product.productCode}-${selectedColor}-${selectedSize}` || product.productCode;

    if (!Array.isArray(user.cartData)) user.cartData = [];

    const existingItem = user.cartData.find(item =>
      item.productId.toString() === productId &&
      item.size === selectedSize &&
      item.color === selectedColor
    );

    if (existingItem) {
      existingItem.quantity += Number(quantity) || 1;
    } else {
      user.cartData.push({
        productId,
        productName: product.name,
        quantity: Number(quantity) || 1,
        size: selectedSize,
        color: selectedColor,
        priceAtPurchase: product.price,
        productCode: fullProductCode
      });
    }

    user.markModified('cartData');
    await user.save();

    res.status(200).json({ message: 'Product added to cart', cart: user.cartData });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add to cart', details: error.message });
  }
};


const updateincart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, quantity } = req.body;

    if (!productId || quantity === undefined) {
      return res.status(400).json({ error: 'productId and quantity are required' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const cartItem = user.cartData.find(item => item.productId.toString() === productId);
    if (!cartItem) return res.status(404).json({ error: 'Product not found in cart' });

    if (Number(quantity) <= 0) {
      user.cartData = user.cartData.filter(item => item.productId.toString() !== productId);
    } else {
      cartItem.quantity = Number(quantity);
    }

    user.markModified('cartData');
    await user.save();

    res.status(200).json({ message: 'Cart updated', cartData: user.cartData });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update cart', details: error.message });
  }
};


const getfromCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.status(200).json({ cart: user.cartData || [] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get cart', details: error.message });
  }
};


const removefromcart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productCode } = req.body;

    if (!productCode) return res.status(400).json({ error: 'productCode is required' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const initialLength = user.cartData.length;

    user.cartData = user.cartData.filter((item) => {
      const codeMatch = `${item.productCode}` === productCode;
      const fullMatch = `${item.productCode || item.productId}-${item.color}-${item.size}` === productCode;
      return !(codeMatch || fullMatch);
    });

    if (user.cartData.length === initialLength) {
      return res.status(404).json({ error: 'Product not found in cart' });
    }

    user.markModified('cartData');
    await user.save();

    res.status(200).json({ message: 'Product removed from cart', cart: user.cartData });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove from cart', details: error.message });
  }
};


// Merges a guest (pre-login) cart into the authenticated user's server-side cart.
// Product data (name/price) is re-derived from the DB rather than trusted from the client.
const mergeCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { items } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (!Array.isArray(user.cartData)) user.cartData = [];

    if (Array.isArray(items) && items.length > 0) {
      for (const guestItem of items) {
        const product = await Product.findById(guestItem.productId);
        if (!product) continue; // skip items for products that no longer exist

        const size = guestItem.size || '';
        const color = guestItem.color || '';
        const qty = Number(guestItem.quantity) || 1;

        const existing = user.cartData.find(item =>
          item.productId.toString() === product._id.toString() &&
          item.size === size &&
          item.color === color
        );

        if (existing) {
          existing.quantity += qty;
        } else {
          user.cartData.push({
            productId: product._id,
            productName: product.name,
            quantity: qty,
            size,
            color,
            priceAtPurchase: product.price,
            productCode: `${product.productCode}-${color}-${size}`,
          });
        }
      }

      user.markModified('cartData');
      await user.save();
    }

    res.status(200).json({ message: 'Cart merged', cart: user.cartData });
  } catch (error) {
    res.status(500).json({ error: 'Failed to merge cart', details: error.message });
  }
};


const clearCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.cartData = [];
    await user.save();

    res.json({ success: true, message: 'Cart cleared successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear cart', details: err.message });
  }
};

export { addtocart, updateincart, getfromCart, removefromcart, clearCart, mergeCart };
