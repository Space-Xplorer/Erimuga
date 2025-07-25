import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('userAuthToken');
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const login = (userData, token) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('userAuthToken', token);
    localStorage.setItem('user', JSON.stringify(userData));
  };

    const logout = async () => {
    try {
      // 1. Make a POST request to your backend's logout endpoint
      // This tells the server to invalidate the session cookie.
      await axios.post('http://localhost:5000/user/auth/logout', {}, {
        withCredentials: true,
      });
    } catch (error) {
      // Log an error if the server-side logout fails, but proceed with
      // client-side cleanup anyway.
      console.error("Server-side logout failed:", error);
    } finally {
      // 2. Clear all client-side authentication data
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('userAuthToken');
      localStorage.removeItem('user');
    }
  };

  const value = {
    user,
    isAuthenticated,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
