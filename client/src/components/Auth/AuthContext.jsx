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
    const userWithAdmin = {
      ...userData,
      isAdmin: userData.userType === 'admin', // syncs with ProtectedRoute logic
    };
    setUser(userWithAdmin);
    setIsAuthenticated(true);
    localStorage.setItem('userAuthToken', token);
    localStorage.setItem('user', JSON.stringify(userWithAdmin));
  };


    const logout = async () => {
    try {
      await axios.post('http://localhost:5000/user/auth/logout', {}, {
        withCredentials: true,
      });
    } catch (error) {
      console.error("Server-side logout failed:", error);
    } finally {
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
