import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../components/Auth/AuthContext';

export const ShopContext = createContext(null);

const ShopContextProvider = ({ children }) => {
  const { isAuthenticated, user: authUser } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(true);

  // ✅ Add these missing state hooks
  const [sort, setSort] = useState('default');
  const [filter, setFilter] = useState({ category: '', priceRange: [0, 10000] });

  useEffect(() => {
    axios.get('http://localhost:5000/products')
      .then((res) => setProducts(res.data))
      .catch((err) => console.error('Error fetching products:', err));
  }, []);

  useEffect(() => {
    if (isAuthenticated && authUser?._id) {
      getCartDataFromBackend(authUser._id);
    } else {
      setCartItems([]);
    }
  }, [isAuthenticated, authUser]);

  const getCartDataFromBackend = async (userId) => {
    try {
      const res = await axios.get(`http://localhost:5000/cart/get?userId=${userId}`, {
        withCredentials: true
      });
      const cartArray = res.data.cart;
      if (Array.isArray(cartArray)) {
        setCartItems(cartArray);
      } else {
        console.error("Invalid cart data format:", cartArray);
        setCartItems([]);
      }
    } catch (error) {
      console.error("❌ Failed to fetch cart:", error);
      setCartItems([]);
    }
  };

const addToCart = async (product, quantity = 1, selectedSize, selectedColor) => {
  if (!isAuthenticated || !authUser?._id) {
    console.error("User not authenticated. Cannot add to cart.");
    return;
  }

  const cartItemData = {
    userId: authUser._id,
    productId: product._id,
    quantity,
    selectedSize,
    selectedColor
  };

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
  } catch (error) {
    console.error("Error adding to cart:", error);
  }
};


  const removeFromCart = async (productCode) => {
  if (!isAuthenticated || !authUser?._id) {
    console.error("User not authenticated. Cannot remove from cart.");
    return;
  }

  try {
    const res = await axios.delete('http://localhost:5000/cart/remove', {
      data: {
        userId: authUser._id,
        productCode,
      },
      withCredentials: true,
    });

    if (res.data.cart) {
      setCartItems(res.data.cart);
    } else {
      await getCartDataFromBackend(authUser._id);
    }
  } catch (error) {
    console.error("❌ Failed to remove from cart:", error);
  }
};

  const updateQuantity = async (productId, quantity) => {
    if (!isAuthenticated || !authUser) {
      throw new Error("User must be logged in to update cart");
    }

    try {
      const response = await axios.post(
        'http://localhost:5000/cart/update',
        {
          userId: authUser._id,
          productId,
          quantity
        },
        { withCredentials: true }
      );

      if (response.data.cartData) {
        setCartItems(response.data.cartData);
      } else {
        await getCartDataFromBackend(authUser._id);
      }
    } catch (error) {
      console.error("Failed to update cart quantity:", error);
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      await axios.delete(`http://localhost:5000/cart/clear`, {
        data: { userId: authUser._id },
        withCredentials: true,
      });
      setCartItems([]);
    } catch (error) {
      console.error("❌ Error clearing cart:", error);
    }
  };

  const getTotalAmount = () => {
    if (!Array.isArray(cartItems)) return 0;
    return cartItems.reduce((total, item) => {
      const productPrice = item.priceAtPurchase || 0;
      return total + productPrice * item.quantity;
    }, 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const placeOrder = async (address, paymentMethod = "COD") => {
    if (!authUser) {
      throw new Error("Cannot place order, user not logged in.");
    }

    try {
      const orderPayload = {
        userId: authUser._id,
        items: cartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        })),
        amount: getTotalAmount(),
        address,
        paymentMethod,
        payment: paymentMethod !== "COD",
        date: Date.now()
      };

      const res = await axios.post('http://localhost:5000/orders/create', orderPayload, { withCredentials: true });
      setCartItems([]);
      return res.data;
    } catch (error) {
      console.error("Failed to place order:", error);
      throw error;
    }
  };

  const value = {
    authUser,
    products,
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    getTotalAmount,
    getTotalItems,
    placeOrder,
    search,
    setSearch,
    showSearch,
    setShowSearch,
    clearCart
  };

  return (
    <ShopContext.Provider value={value}>
      {children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;
