import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useAuth } from '../components/Auth/AuthContext';

export const ShopContext = createContext(null);

const ShopContextProvider = ({ children }) => {
  // Get authentication state from AuthContext
  const { isAuthenticated, user: authUser } = useAuth();

  const [cartItems, setCartItems] = useState({});
  const [products, setProducts] = useState([]);

  // --- EFFECT TO FETCH PRODUCTS (Public Data) ---
  useEffect(() => {
    axios.get('http://localhost:5000/products')
      .then((res) => setProducts(res.data))
      .catch((err) => console.error('Error fetching products:', err));
  }, []);

  // --- EFFECT TO FETCH USER CART (Protected Data) ---
  // This effect now depends on the authentication state.
  useEffect(() => {
    // Only fetch cart data if the user is authenticated and we have their info.
    if (isAuthenticated && authUser?._id) {
      console.log("User is authenticated, fetching cart...");
      getCartDataFromBackend(authUser._id);
    } else {
      // If the user logs out, clear the cart items from state.
      console.log("User is not authenticated, clearing cart.");
      setCartItems([]);
    }
  }, [isAuthenticated, authUser]); // Re-run this logic when auth state changes

  const getCartDataFromBackend = async (userId) => {
    try {
      const res = await axios.get(`http://localhost:5000/cart/get?userId=${userId}`, { withCredentials: true });
      const cartData = res.data.cart || {};
      setCartItems(cartData);
      console.log("✅ Cart state updated with:", cartData);
    } catch (error) {
      console.error("Failed to fetch cart from backend:", error);
      setCartItems([]);
    }
  };

  // --- All other cart functions remain the same ---

  const addToCart = async (product, quantity = 1) => {
    if (!isAuthenticated || !authUser) {
      console.error("User must be logged in to add items to cart");
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:5000/cart/add',
        {
          userId: authUser._id,
          productId: product._id,
          quantity: quantity
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        // Update local cart state with the new cart data from backend
        await getCartDataFromBackend(authUser._id);
      }
    } catch (error) {
      console.error("Failed to add item to cart:", error);
    }
  };

  const removeFromCart = (itemId) => {
    setCartItems(prev => prev.filter(item => item.itemId !== itemId));
  };

  const updateQuantity = (itemId, quantity) => {
    setCartItems(prev =>
      prev.map(item =>
        item.itemId === itemId ? { ...item, quantity } : item
      )
    );
  };

  const getTotalAmount = () => {
    return cartItems.reduce((acc, item) => {
      const product = products.find(p => p._id === item.itemId);
      return acc + (product?.price || 0) * item.quantity;
    }, 0);
  };

  const placeOrder = async (address, paymentMethod = "COD") => {
    // Use the user from the AuthContext
    if (!authUser) {
        console.error("Cannot place order, user not logged in.");
        return;
    }
    const orderPayload = {
      userId: authUser._id,
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
    // Note: we no longer provide 'user' from this context, it should be consumed from useAuth()
    products,
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    getTotalAmount,
    placeOrder,
  };

  return (
    <ShopContext.Provider value={value}>
      {children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;
