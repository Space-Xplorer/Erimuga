// import React, { createContext, useState, useEffect } from 'react';
// import axios from 'axios';

// export const ShopContext = createContext();

// const ShopContextProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [cartItems, setCartItems] = useState([]);
//   const [products, setProducts] = useState([]);

//   // ✅ Fetch user on mount
//   useEffect(() => {

//     axios.get('http://localhost:5000/user/auth/me', { withCredentials: true })
//       .then(res => {
//         setUser(res.data);
//         console.log("✅ Login Response Data:", res.data);
//         getCartDataFromBackend(res.data._id); // Fetch cart right after user is set
//       })
//       .catch(() => setUser(null));
//   }, []);

//   // ✅ Fetch products
//   useEffect(() => {
//     axios.get('http://localhost:5000/products')
//       .then((res) => setProducts(res.data))
//       .catch((err) => console.error('Error fetching products:', err));
//   }, []);

// const getCartDataFromBackend = async (userId) => {
//   try {
//     // 1. Make a GET request to the backend endpoint, including credentials
//     const res = await axios.get(`http://localhost:5000/cart/get?userId=${userId}`, { withCredentials: true });
    
//     // 2. Log the entire response data to help with debugging in the future.
//     // This will show you the exact structure of what the backend is sending.
//     console.log("Full response from /cart/get:", res.data);

//     // 3. The backend sends data in `res.data.cart`. We check if it exists.
//     // If it doesn't, we default to an empty array to prevent errors.
//     const populatedCartArray = res.data.cart || [];

//     // 4. Verify that the data is an array before setting the state.
//     if (Array.isArray(populatedCartArray)) {
//       // This now correctly uses the `setCartItems` function from the component's scope
//       setCartItems(populatedCartArray);
//       console.log("✅ Cart state updated with:", populatedCartArray);
//     } else {
//       console.error("Data received for cart is not an array:", populatedCartArray);
//       setCartItems([]); // Reset to empty array on invalid data
//     }

//   } catch (error) {
//     // Log an error if the API call fails
//     console.error("Failed to fetch cart from backend:", error);
//     // Set cart to empty array on error to ensure a consistent state
//     setCartItems([]); 
//   }
// };

//   const addToCart = (product, quantity = 1) => {
//     const existing = cartItems.find(item => item.productId === product._id);
//     if (existing) {
//       setCartItems(prev =>
//         prev.map(item =>
//           item.productId === product._id
//             ? { ...item, quantity: item.quantity + quantity }
//             : item
//         )
//       );
//     } else {
//       setCartItems(prev => [...prev, {
//         productId: product._id,
//         productName: product.name,
//         quantity
//       }]);
//     }
//   };

//   const removeFromCart = (productId) => {
//     setCartItems(prev => prev.filter(item => item.productId !== productId));
//   };

//   const updateQuantity = (productId, quantity) => {
//     setCartItems(prev =>
//       prev.map(item =>
//         item.productId === productId
//           ? { ...item, quantity }
//           : item
//       )
//     );
//   };

//   const getTotalAmount = () => {
//     return cartItems.reduce((acc, item) => {
//       const product = products.find(p => p._id === item.productId);
//       return acc + (product?.price || 0) * item.quantity;
//     }, 0);
//   };

//   const placeOrder = async (address, paymentMethod = "COD") => {
//     const orderPayload = {
//       userId: user?._id,
//       items: cartItems,
//       amount: getTotalAmount(),
//       address,
//       paymentMethod,
//       payment: paymentMethod !== "COD",
//       date: Date.now()
//     };

//     try {
//       const res = await axios.post('/api/orders', orderPayload, { withCredentials: true });
//       setCartItems([]);
//       return res.data;
//     } catch (err) {
//       throw err.response?.data || err;
//     }
//   };

//   const value = {
//     user,
//     setUser,
//     products,
//     cartItems,
//     setCartItems,
//     addToCart,
//     removeFromCart,
//     updateQuantity,
//     getTotalAmount,
//     placeOrder,
//     getCartDataFromBackend
//   };

//   return (
//     <ShopContext.Provider value={value}>
//       {children}
//     </ShopContext.Provider>
//   );
// };

// export default ShopContextProvider;



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

  // --- All other cart functions remain the same ---

  // const addToCart = (product, quantity = 1) => {
  //   const existing = cartItems.find(item => item.itemId === product._id);
  //   if (existing) {
  //     setCartItems(prev =>
  //       prev.map(item =>
  //         item.itemId === product._id
  //           ? { ...item, quantity: item.quantity + quantity }
  //           : item
  //       )
  //     );
  //   } else {
  //     setCartItems(prev => [...prev, {
  //       itemId: product._id,
  //       productName: product.name,
  //       quantity
  //     }]);
  //   }

  //   console.log("CartItems:", cartItems);
  // };

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
