import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../components/Auth/AuthContext';
import toast from 'react-hot-toast';

export const ShopContext = createContext(null);

const ShopContextProvider = ({ children }) => {
  const { isAuthenticated, user: authUser, isLoading } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(true);

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  // Fetch products once
  useEffect(() => {
    axios.get(`${BASE_URL}/products`, { withCredentials: true })
      .then(res => setProducts(res.data))
      .catch(err => {
        console.error('Error fetching products:', err);
        toast.error('Failed to load products');
      });
  }, []);

  // Fetch cart whenever authUser changes (but not during loading)
  useEffect(() => {
    if (!isLoading && isAuthenticated && authUser?._id) {
      fetchCart(authUser._id);
    } else if (!isLoading && !isAuthenticated) {
      setCartItems([]);
    }
  }, [isAuthenticated, authUser, isLoading]);

  const fetchCart = async (userId) => {
    try {
      const res = await axios.get(`${BASE_URL}/cart/get?userId=${userId}`, { withCredentials: true });
      if (Array.isArray(res.data.cart)) {
        setCartItems(res.data.cart);
      } else {
        setCartItems([]);
      }
    } catch (err) {
      console.error('Failed to fetch cart:', err);
      setCartItems([]);
    }
  };

  const addToCart = async (product, quantity = 1, selectedSize, selectedColor) => {
    if (!isAuthenticated || !authUser?._id) {
      toast.error("Please login to add items to cart");
      return;
    }

    try {
      const res = await axios.post(`${BASE_URL}/cart/add`, {
        userId: authUser._id,
        productId: product._id,
        quantity,
        selectedSize,
        selectedColor
      }, { withCredentials: true });

      if (Array.isArray(res.data.cart)) {
        setCartItems(res.data.cart);
        toast.success("Added to cart!");
      } else {
        toast.error("Failed to add to cart");
      }
    } catch (err) {
      console.error('Add to cart error:', err);
      toast.error("Failed to add to cart");
    }
  };

  const removeFromCart = async (productCode) => {
    if (!isAuthenticated || !authUser?._id) {
      toast.error("Please login to modify your cart");
      return;
    }

    try {
      const res = await axios.delete(`${BASE_URL}/cart/remove`, {
        data: { userId: authUser._id, productCode },
        withCredentials: true
      });
      
      if (Array.isArray(res.data.cart)) {
        setCartItems(res.data.cart);
        toast.success("Item removed from cart");
      } else {
        await fetchCart(authUser._id);
        toast.success("Item removed");
      }
    } catch (err) {
      console.error('Remove cart error:', err);
      toast.error("Failed to remove item");
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (!authUser?._id) {
      toast.error("Please login to update cart");
      return;
    }

    try {
      const res = await axios.post(`${BASE_URL}/cart/update`, {
        userId: authUser._id,
        productId,
        quantity
      }, { withCredentials: true });
      
      if (res.data.cartData) {
        setCartItems(res.data.cartData);
        toast.success("Cart updated");
      } else {
        await fetchCart(authUser._id);
        toast.success("Quantity updated");
      }
    } catch (err) {
      console.error('Update quantity error:', err);
      toast.error("Failed to update cart");
    }
  };

  const clearCart = async () => {
    if (!authUser?._id) return;
    
    try {
      await axios.delete(`${BASE_URL}/cart/clear`, { 
        data: { userId: authUser._id }, 
        withCredentials: true 
      });
      setCartItems([]);
      toast.success("Cart cleared");
    } catch (err) {
      console.error('Clear cart error:', err);
      toast.error("Failed to clear cart");
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
    if (!Array.isArray(cartItems)) return 0;
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const placeOrder = async (address, paymentMethod = 'COD') => {
    if (!authUser?._id) {
      toast.error("Please login to place order");
      return;
    }

    try {
      const payload = {
        userId: authUser._id,
        items: cartItems.map(item => ({ 
          productId: item.productId, 
          quantity: item.quantity 
        })),
        amount: getTotalAmount(),
        address,
        paymentMethod,
        payment: paymentMethod !== 'COD',
        date: Date.now()
      };

      const res = await axios.post(`${BASE_URL}/orders/create`, payload, { withCredentials: true });
      setCartItems([]);
      toast.success("Order placed successfully!");
      return res.data;
    } catch (err) {
      console.error('Place order error:', err);
      toast.error("Failed to place order");
      throw err;
    }
  };

  return (
    <ShopContext.Provider value={{
      authUser,
      products,
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotalAmount,
      getTotalItems,
      placeOrder,
      search,
      setSearch,
      showSearch,
      setShowSearch,
      isLoading
    }}>
      {children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;
