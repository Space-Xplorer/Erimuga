import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const ShopContext = createContext();

const ShopContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [products, setProducts] = useState([]);

  // ✅ Fetch products first
  const fetchProducts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/products');
      setProducts(res.data);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  // ✅ Fetch cart after products are loaded
  const getCartDataFromBackend = async (userId) => {
    try {
      const res = await axios.get(`http://localhost:5000/cart/get?userId=${userId}`);
      const cartObject = res.data.cart;

      const cartArray = Object.entries(cartObject).map(([productId, quantity]) => {
        const product = products.find(p => String(p._id) === String(productId));
        if (!product) {
          console.warn(`Product with ID ${productId} not found in product list.`);
          return null;
        }
        return {
          ...product,
          quantity,
          productId: product._id,
          productName: product.name,
        };
      }).filter(Boolean); // remove nulls

      console.log("Fetched cart items:", cartArray);
      setCartItems(cartArray);
    } catch (error) {
      console.error("Failed to fetch cart from backend:", error);
    }
  };

  // ✅ Fetch user and initialize all data (products -> cart)
  useEffect(() => {
    const initializeData = async () => {
      try {
        const userRes = await axios.get('http://localhost:5000/user/auth/me', { withCredentials: true });
        setUser(userRes.data);
        console.log("✅ Login Response Data:", userRes.data);

        await fetchProducts(); // wait for products
        await getCartDataFromBackend(userRes.data._id); // then fetch cart
      } catch (err) {
        console.warn("User not logged in");
        setUser(null);
      }
    };

    initializeData();
  }, []);

  // 🛒 Cart operations
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

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.productId !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    setCartItems(prev =>
      prev.map(item =>
        item.productId === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const getTotalAmount = () => {
    return cartItems.reduce((acc, item) => {
      const product = products.find(p => p._id === item.productId);
      return acc + (product?.price || 0) * item.quantity;
    }, 0);
  };

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
    setCartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    getTotalAmount,
    placeOrder,
    getCartDataFromBackend
  };

  return (
    <ShopContext.Provider value={value}>
      {children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;
