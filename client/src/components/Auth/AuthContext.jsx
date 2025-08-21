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

  // ✅ Ensure _id is stored
  const login = (userData, token) => {
    const userWithAdmin = {
      ...userData,
      _id: userData._id, // Make sure backend sends this
      isAdmin: userData.userType === 'admin',
    };

    setUser(userWithAdmin);
    setIsAuthenticated(true);

    localStorage.setItem('userAuthToken', token);
    localStorage.setItem('user', JSON.stringify(userWithAdmin));
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
