import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from '../../config/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // ✅ Check session on app startup
  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log('🔍 Checking session...');
        const res = await axios.get('/user/auth/me');
        setUser(res.data);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(res.data));
        console.log('✅ Session restored:', res.data);
      } catch (err) {
        console.log('❌ Session check failed:', err.response?.status || err.message);
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
      setTimeout(checkSession, 100);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // ✅ Login function - session-based
  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userData));
    console.log('✅ User logged in:', userData);
  };

  // ✅ Enhanced logout function
  const logout = async () => {
    try {
      await axios.post('/user/auth/logout', {});
      console.log('✅ Server-side logout successful');
    } catch (error) {
      console.error("❌ Server-side logout failed:", error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('user');
      console.log('✅ Local logout completed');
    }
  };

  // ✅ Update user data
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    console.log('✅ User data updated:', updatedUser);
  };

  const value = { 
    user, 
    isAuthenticated, 
    loading,
    login, 
    logout, 
    updateUser 
  };

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
