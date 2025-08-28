import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // Add loading state

  // ✅ Check session on app startup
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BASE_URL}/user/auth/me`, {
          credentials: 'include' // Important: include cookies
        });
        
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
          setIsAuthenticated(true);
          localStorage.setItem('user', JSON.stringify(userData));
          console.log('✅ Session restored:', userData);
        } else {
          // Session expired or invalid, clear local storage
          localStorage.removeItem('user');
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error('Session check failed:', err);
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
    
    // Check for Google OAuth redirect
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('auth') === 'success') {
      // Refresh to get user data after Google OAuth
      setTimeout(checkSession, 100);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // ✅ Ensure _id is stored
  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userData));
    // Remove token-related code since we use sessions
  };

  const logout = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_BASE_URL}/user/auth/logout`,
        {},
        { withCredentials: true }
      );
    } catch (error) {
      console.error("Server-side logout failed:", error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('userAuthToken');
      localStorage.removeItem('user');
    }
  };

  // ✅ FIX: Define updateUser INSIDE provider
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  // 3. Add session check on app startup
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BASE_URL}/user/auth/me`, {
          credentials: 'include'
        });
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
          setIsAuthenticated(true);
          localStorage.setItem('user', JSON.stringify(userData));
        }
      } catch (err) {
        // Session expired, clear local storage
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
      }
    };

    checkSession();
  }, []);

  const value = { user, isAuthenticated, login, logout, updateUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
