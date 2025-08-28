import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  // ✅ Check authentication status on mount and page refresh
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${BASE_URL}/user/auth/validate-session`, {
        withCredentials: true
      });

      if (response.data.success && response.data.isAuthenticated) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        console.log('✅ User authenticated:', response.data.user._id);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        console.log('❌ No valid session found');
      }
    } catch (error) {
      console.error('❌ Auth check failed:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Enhanced login function
  const login = async (userData) => {
    try {
      const response = await axios.post(`${BASE_URL}/user/auth/login`, userData, {
        withCredentials: true
      });

      if (response.data.success) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        console.log('✅ Login successful:', response.data.user._id);
        return { success: true, user: response.data.user };
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    }
  };

  // ✅ Enhanced logout function
  const logout = async () => {
    try {
      await axios.post(`${BASE_URL}/user/auth/logout`, {}, {
        withCredentials: true
      });
    } catch (error) {
      console.error("❌ Server-side logout failed:", error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      console.log('✅ Logout successful');
    }
  };

  // ✅ Update user function
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  // ✅ Refresh authentication status
  const refreshAuth = () => {
    checkAuthStatus();
  };

  const value = { 
    user, 
    isAuthenticated, 
    isLoading,
    login, 
    logout, 
    updateUser,
    refreshAuth,
    checkAuthStatus
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
