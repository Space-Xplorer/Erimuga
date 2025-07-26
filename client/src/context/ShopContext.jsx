import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useAuth } from '../components/Auth/AuthContext';

export const ShopContext = createContext(null);

const ShopContextProvider = ({ children }) => {
  // Get authentication state from AuthContext
  const { isAuthenticated, user: authUser } = useAuth();

const [cartItems, setCartItems] = useState([]); // ✅ FIXED
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
    const res = await axios.get(`http://localhost:5000/cart/get?userId=${userId}`, {
      withCredentials: true
    });
    const cartArray = res.data.cart;
    if (Array.isArray(cartArray)) {
      setCartItems(cartArray);
      console.log("✅ Cart state updated with:", cartArray);
    } else {
      console.error("Data received for cart is not an array:", cartArray);
      setCartItems([]);
    }
  } catch (error) {
    console.error("❌ Failed to fetch cart from backend:", error);
    setCartItems([]);
  }
};

  const addToCart = async (product, quantity = 1, size, color) => {
  // 1. Check for authentication using the user object from context
  if (!isAuthenticated || !authUser?._id) {
    console.error("User is not authenticated. Cannot add to cart.");
    // Optionally, show a message to the user to log in.
    return;
  }

  // 2. Prepare the data payload for the API
  const cartItemData = {
    // Use the user ID from the context
    userId: authUser._id,
    productId: product._id,
    quantity: quantity,
    size: size,
    color: color,
    priceAtPurchase: product.price
  };

  // 3. Make the API call (this part is already correct)
  try {
    const response = await fetch('http://localhost:5000/cart/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cartItemData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to add item to cart.");
    }

    const data = await response.json();
    setCartItems(data.cart); 

    console.log("Success:", data.message);

  } catch (error) {
    console.error("Error adding to cart:", error);
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
  if (!Array.isArray(cartItems)) return 0; // Safety
  return cartItems.reduce((total, item) => {
    const productPrice = item.priceAtPurchase || 0;
    return total + productPrice * item.quantity;
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
