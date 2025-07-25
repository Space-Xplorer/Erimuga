import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// Create the context
export const ShopContext = createContext();

// Context Provider
const ShopContextProvider = ({ children }) => {
  // 🔐 User info (fetched from backend or session)
  const [user, setUser] = useState(null);

  // 🛒 Cart state
  const [cartItems, setCartItems] = useState([]);

  // 🛍️ Products (you can also load these in individual pages)
  const [products, setProducts] = useState([]);

  // ✅ Fetch user on mount
  useEffect(() => {
    axios.get('/api/auth/me', { withCredentials: true }) // Adjust to your backend
      .then(res => setUser(res.data))
      .catch(() => setUser(null));
  }, []);

  // ✅ Fetch products on mount
  useEffect(() => {
    // Replace this with your actual API endpoint
    axios.get('http://localhost:5000/products')
      .then((res) => {
        // console.log('Fetched products:', res.data);
        setProducts(res.data);
      })
      .catch((err) => {
        console.error('Error fetching products:', err);
      });
  }, []);
  // 🔼 Add to cart
  const addToCart = (product, quantity = 1) => {
    const existing = cartItems.find(item => item.productId === product._id);
    if (existing) {
      setCartItems(prev =>
        prev.map(item =>
          item.productId === product._id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      );
    } else {
      setCartItems(prev => [...prev, {
        productId: product._id,
        productName: product.name,
        quantity
      }]);
    }
  };

  // 🔽 Remove from cart
  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.productId !== productId));
  };

  // ✏️ Update quantity
  const updateQuantity = (productId, quantity) => {
    setCartItems(prev =>
      prev.map(item =>
        item.productId === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  // 💰 Calculate total
  const getTotalAmount = () => {
    return cartItems.reduce((acc, item) => {
      const product = products.find(p => p._id === item.productId);
      return acc + (product?.price || 0) * item.quantity;
    }, 0);
  };

  // 📦 Place order
  const placeOrder = async (address, paymentMethod = "COD") => {
    const orderPayload = {
      userId: user?._id,
      items: cartItems,
      amount: getTotalAmount(),
      address,
      paymentMethod,
      payment: paymentMethod !== "COD",
      date: Date.now()
    };

    try {
      const res = await axios.post('/api/orders', orderPayload, { withCredentials: true });
      setCartItems([]);
      return res.data;
    } catch (err) {
      throw err.response?.data || err;
    }
  };

  const value = {
    user,
    setUser,
    products,
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    getTotalAmount,
    placeOrder
  };

  return (
    <ShopContext.Provider value={value}>
      {children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;
