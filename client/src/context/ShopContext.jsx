import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../components/Auth/AuthContext';

export const ShopContext = createContext(null);

const ShopContextProvider = ({ children }) => {
  const { isAuthenticated, user: authUser } = useAuth();
  const [cartItems, setCartItems] = useState([]); // ✅ FIXED
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(true);
  const [sort, setSort] = useState('default');
  const [filter, setFilter] = useState({ category: '', priceRange: [0, 10000] });

  const Value = {
    products,
    cartItems,
    search,
    setSearch,
    showSearch,
    setShowSearch,
    sort,
    setSort,
    filter,
    setFilter
  }

  // Fetch products (Public Data)
  useEffect(() => {
    axios.get('http://localhost:5000/products')
      .then((res) => setProducts(res.data))
      .catch((err) => console.error('Error fetching products:', err));
  }, []);

  // Fetch user cart (Protected Data)
  useEffect(() => {
    if (isAuthenticated && authUser?._id) {
      console.log("User is authenticated, fetching cart...");
      getCartDataFromBackend(authUser._id);
    } else {
      console.log("User is not authenticated, clearing cart.");
      setCartItems({});
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

  const updateQuantity = async (productId, quantity) => {
    if (!isAuthenticated || !authUser) {
      throw new Error("User must be logged in to update cart");
    }

    try {
      const response = await axios.post(
        'http://localhost:5000/cart/update',
        {
          userId: authUser._id,
          productId: productId,
          quantity: quantity
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

const getTotalAmount = () => {
  if (!Array.isArray(cartItems)) return 0; // Safety
  return cartItems.reduce((total, item) => {
    const productPrice = item.priceAtPurchase || 0;
    return total + productPrice * item.quantity;
  }, 0);
};


  const getTotalItems = () => {
    return Object.values(cartItems).reduce((total, quantity) => total + quantity, 0);
  };

  const placeOrder = async (address, paymentMethod = "COD") => {
    if (!authUser) {
      throw new Error("Cannot place order, user not logged in.");
    }

    try {
      const orderPayload = {
        userId: authUser._id,
        items: Object.entries(cartItems).map(([productId, quantity]) => ({
          productId,
          quantity
        })),
        amount: getTotalAmount(),
        address,
        paymentMethod,
        payment: paymentMethod !== "COD",
        date: Date.now()
      };

      const res = await axios.post('http://localhost:5000/orders/create', orderPayload, { withCredentials: true });
      setCartItems({});
      return res.data;
    } catch (error) {
      console.error("Failed to place order:", error);
      throw error;
    }
  };

  const value = {
    products,
    cartItems,
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
