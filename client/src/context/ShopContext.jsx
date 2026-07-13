import React, { createContext, useState, useEffect, useRef } from 'react';
import axios from '../config/axios';
import { useAuth } from '../components/Auth/AuthContext';
import toast from 'react-hot-toast';

export const ShopContext = createContext(null);

// Pre-login ("guest") cart, kept in localStorage in the same shape as the
// server-side cartData so every consuming component can treat it identically.
const GUEST_CART_KEY = 'erimuga_guest_cart';

const readGuestCart = () => {
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeGuestCart = (cart) => {
  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
  } catch {
    // localStorage unavailable (private browsing, quota) — cart just won't persist across reloads
  }
};

const ShopContextProvider = ({ children }) => {
  const { isAuthenticated, user: authUser, loading: isLoading } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(true);
  const wasAuthenticatedRef = useRef(false);

  // BroadcastChannel for multi-tab cart sync
  const channelRef = useRef(null);
  useEffect(() => {
    const channel = new BroadcastChannel('erimuga_cart');
    channelRef.current = channel;
    channel.onmessage = (event) => {
      if (event.data?.type === 'CART_UPDATE') {
        setCartItems(event.data.cart);
      }
    };
    return () => channel.close();
  }, []);

  const broadcastCart = (cart) => {
    channelRef.current?.postMessage({ type: 'CART_UPDATE', cart });
  };

  // Fetch products once
  useEffect(() => {
    axios.get('/products')
      .then(res => setProducts(res.data))
      .catch(() => toast.error('Failed to load products'));
  }, []);

  // Fetch/merge cart whenever auth state changes
  useEffect(() => {
    if (isLoading) return;

    if (isAuthenticated && authUser?._id) {
      const wasGuest = !wasAuthenticatedRef.current;
      if (wasGuest) {
        mergeGuestCartIntoAccount();
      } else {
        fetchCart();
      }
    } else {
      setCartItems(readGuestCart());
    }

    wasAuthenticatedRef.current = isAuthenticated;
  }, [isAuthenticated, authUser, isLoading]);

  const fetchCart = async () => {
    try {
      const res = await axios.get('/cart/get');
      const cart = Array.isArray(res.data.cart) ? res.data.cart : [];
      setCartItems(cart);
    } catch {
      setCartItems([]);
    }
  };

  // Runs once right after a guest becomes authenticated (local login, register+login, or Google OAuth redirect)
  const mergeGuestCartIntoAccount = async () => {
    const guestCart = readGuestCart();
    if (guestCart.length > 0) {
      try {
        await axios.post('/cart/merge', { items: guestCart });
      } catch {
        // best-effort — fall through to whatever the server already has
      }
      writeGuestCart([]);
    }
    await fetchCart();
  };

  const addToCart = async (product, quantity = 1, selectedSize, selectedColor) => {
    if (isAuthenticated && authUser?._id) {
      try {
        const res = await axios.post('/cart/add', {
          productId: product._id,
          quantity,
          selectedSize,
          selectedColor
        });

        if (Array.isArray(res.data.cart)) {
          setCartItems(res.data.cart);
          broadcastCart(res.data.cart);
          toast.success('Added to cart!');
        } else {
          toast.error('Failed to add to cart');
        }
      } catch {
        toast.error('Failed to add to cart');
      }
      return;
    }

    // Guest — persist locally, same shape as the server cart
    const productCode = `${product.productCode}-${selectedColor}-${selectedSize}`;
    setCartItems(prev => {
      const list = Array.isArray(prev) ? prev : [];
      const existingIdx = list.findIndex(item => item.productCode === productCode);
      const next = existingIdx >= 0
        ? list.map((item, i) => i === existingIdx ? { ...item, quantity: item.quantity + Number(quantity || 1) } : item)
        : [...list, {
            productId: product._id,
            productName: product.name,
            quantity: Number(quantity) || 1,
            size: selectedSize,
            color: selectedColor,
            priceAtPurchase: product.price,
            productCode,
          }];
      writeGuestCart(next);
      broadcastCart(next);
      return next;
    });
    toast.success('Added to cart!');
  };

  const removeFromCart = async (productCode) => {
    if (isAuthenticated) {
      try {
        const res = await axios.delete('/cart/remove', {
          data: { productCode },
        });

        if (Array.isArray(res.data.cart)) {
          setCartItems(res.data.cart);
          broadcastCart(res.data.cart);
          toast.success('Item removed from cart');
        } else {
          await fetchCart();
        }
      } catch {
        toast.error('Failed to remove item');
      }
      return;
    }

    setCartItems(prev => {
      const next = (Array.isArray(prev) ? prev : []).filter(item => item.productCode !== productCode);
      writeGuestCart(next);
      broadcastCart(next);
      return next;
    });
    toast.success('Item removed from cart');
  };

  const updateQuantity = async (productId, quantity) => {
    if (isAuthenticated) {
      try {
        const res = await axios.put(`/cart/update/${productId}`, {
          productId,
          quantity
        });

        if (res.data.cartData) {
          setCartItems(res.data.cartData);
          broadcastCart(res.data.cartData);
        } else {
          await fetchCart();
        }
      } catch {
        toast.error('Failed to update cart');
      }
      return;
    }

    setCartItems(prev => {
      const list = Array.isArray(prev) ? prev : [];
      const next = Number(quantity) <= 0
        ? list.filter(item => item.productId !== productId)
        : list.map(item => item.productId === productId ? { ...item, quantity: Number(quantity) } : item);
      writeGuestCart(next);
      broadcastCart(next);
      return next;
    });
  };

  const clearCart = async () => {
    if (isAuthenticated) {
      try {
        await axios.delete('/cart/clear');
      } catch {
        // clear locally regardless
      }
    } else {
      writeGuestCart([]);
    }
    setCartItems([]);
    broadcastCart([]);
  };

  const getTotalAmount = () => {
    if (!Array.isArray(cartItems)) return 0;
    return cartItems.reduce((total, item) => total + (item.priceAtPurchase || 0) * item.quantity, 0);
  };

  const getTotalItems = () => {
    if (!Array.isArray(cartItems)) return 0;
    return cartItems.reduce((total, item) => total + item.quantity, 0);
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
      fetchCart,
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
