import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaBars, FaTimes, FaSearch, FaUserCircle } from 'react-icons/fa';
import { useAuth } from './Auth/AuthContext';
import { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const timerRef = useRef();
  const profileRef = useRef();
  const navigate = useNavigate();

  const { isAuthenticated, user, logout: authLogout } = useAuth();
  const { cartItems } = useContext(ShopContext);

  // Cart total calculation for guests
  const getTotalCartItems = () => {
    return Object.values(cartItems).reduce((total, quantity) => total + quantity, 0);
  };

  // Profile dropdown handlers
  const handleProfileEnter = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsProfileOpen(true);
  };

  const handleProfileLeave = () => {
    timerRef.current = setTimeout(() => setIsProfileOpen(false), 150);
  };

  // Cart count (logged in vs guest)
  const cartCount = isAuthenticated
    ? user?.cartData?.reduce((total, item) => total + (item.quantity || 0), 0) || 0
    : getTotalCartItems();

  return (
    <nav className="bg-[#B22222] text-white px-6 py-4">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <div className="text-2xl font-bold">
          <Link to="/" onClick={() => setIsMenuOpen(false)}>
            <img src="/Logos/Logo.jpg" alt="Logo" className="h-8" />
          </Link>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <Link to="/" className="hover:text-yellow-300">Home</Link>
          <Link to="/collection" className="hover:text-yellow-300">Collection</Link>
          <Link to="/about" className="hover:text-yellow-300">About</Link>
          <Link to="/contact" className="hover:text-yellow-300">Contact</Link>
          <Link to="/search" className="flex items-center gap-1 hover:text-yellow-300">
            <FaSearch /> Search
          </Link>

          {/* Cart Icon */}
          <Link to="/cart" className="relative hover:text-yellow-300 transition">
            <FaShoppingCart className="text-lg" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-yellow-300 text-black rounded-full px-1 text-xs min-w-[18px] text-center">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Profile */}
          {isAuthenticated ? (
            <div
              className="relative flex items-center"
              ref={profileRef}
              onMouseEnter={handleProfileEnter}
              onMouseLeave={handleProfileLeave}
            >
              <div className="flex items-center gap-1 cursor-pointer hover:text-yellow-300">
                <FaUserCircle className="text-lg" />
                <span>{user?.name || 'Profile'}</span>
              </div>
              {isProfileOpen && (
                <div className="absolute top-full right-0 mt-2 z-50 w-48 bg-white text-black rounded-md shadow-lg py-2 space-y-1">
                  {user?.isAdmin ? (
                    <>
                      <Link to="/admin" className="block px-4 py-2 hover:bg-gray-100">Admin Dashboard</Link>
                      <Link to="/admin/add-product" className="block px-4 py-2 hover:bg-gray-100">Add Products</Link>
                      <Link to="/admin/products" className="block px-4 py-2 hover:bg-gray-100">Products</Link>
                    </>
                  ) : (
                    <>
                      <Link to="/dashboard" className="block px-4 py-2 hover:bg-gray-100">Dashboard</Link>
                      <Link to="/orders" className="block px-4 py-2 hover:bg-gray-100">Orders</Link>
                    </>
                  )}
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded text-red-600"
                    onClick={() => {
                      setIsProfileOpen(false);
                      authLogout();
                      navigate('/login');
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="bg-yellow-300 text-[#B22222] font-semibold px-4 py-2 rounded hover:bg-yellow-400 transition-colors duration-200"
            >
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile Hamburger */}
        <div className="md:hidden text-2xl cursor-pointer" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden mt-4 space-y-4 text-sm font-medium">
          <Link to="/" onClick={() => setIsMenuOpen(false)} className="block hover:text-yellow-300">Home</Link>
          <Link to="/collection" onClick={() => setIsMenuOpen(false)} className="block hover:text-yellow-300">Collection</Link>
          <Link to="/about" onClick={() => setIsMenuOpen(false)} className="block hover:text-yellow-300">About</Link>
          <Link to="/contact" onClick={() => setIsMenuOpen(false)} className="block hover:text-yellow-300">Contact</Link>
          <Link to="/search" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-1 hover:text-yellow-300">
            <FaSearch /> Search
          </Link>
          <Link to="/cart" onClick={() => setIsMenuOpen(false)} className="relative hover:text-yellow-300 transition">
            <FaShoppingCart className="text-lg" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-yellow-300 text-black rounded-full px-1 text-xs min-w-[18px] text-center">
                {cartCount}
              </span>
            )}
          </Link>
          {isAuthenticated ? (
            <>
              {user?.isAdmin ? (
                <>
                  <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="block hover:text-yellow-300">Admin Dashboard</Link>
                  <Link to="/admin/add-product" onClick={() => setIsMenuOpen(false)} className="block hover:text-yellow-300">Add Products</Link>
                  <Link to="/admin/products" onClick={() => setIsMenuOpen(false)} className="block hover:text-yellow-300">Products</Link>
                </>
              ) : (
                <>
                  <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="block hover:text-yellow-300">Dashboard</Link>
                  <Link to="/orders" onClick={() => setIsMenuOpen(false)} className="block hover:text-yellow-300">Orders</Link>
                </>
              )}
              <button
                className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 rounded"
                onClick={() => {
                  setIsMenuOpen(false);
                  authLogout();
                  navigate('/login');
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" onClick={() => setIsMenuOpen(false)} className="bg-yellow-300 text-[#B22222] font-semibold px-4 py-2 rounded hover:bg-yellow-400 block text-center">
              Sign In
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
