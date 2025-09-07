import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

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
        const res = await fetch(`${import.meta.env.VITE_BASE_URL}/user/auth/me`, {
          credentials: 'include'
        });
        
        console.log('📡 Session check response:', res.status, res.ok);
        
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
          setIsAuthenticated(true);
          localStorage.setItem('user', JSON.stringify(userData));
          console.log('✅ Session restored:', userData);
        } else {
          console.log('❌ Session check failed, status:', res.status);
          localStorage.removeItem('user');
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error('❌ Session check failed:', err);
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
    const userWithAdmin = {
      ...userData,
      _id: userData._id,
      isAdmin: userData.userType === 'admin',
    };

    setUser(userWithAdmin);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userWithAdmin));
    console.log('✅ User logged in:', userWithAdmin);
  };

  // // ✅ Enhanced login function
  // const login = async (userData) => {
  //   try {
  //     const response = await axios.post(`${BASE_URL}/user/auth/login`, userData, {
  //       withCredentials: true
  //     });

  //     if (response.data.success) {
  //       setUser(response.data.user);
  //       setIsAuthenticated(true);
  //       console.log('✅ Login successful:', response.data.user._id);
  //       return { success: true, user: response.data.user };
  //     } else {
  //       throw new Error(response.data.message || 'Login failed');
  //     }
  //   } catch (error) {
  //     console.error('❌ Login error:', error);
  //     throw error;
  //   }
  // };

  // ✅ Enhanced logout function
  const logout = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_BASE_URL}/user/auth/logout`,
        {},
        { withCredentials: true }
      );
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
