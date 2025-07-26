import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaBars, FaTimes, FaSearch, FaUserCircle } from 'react-icons/fa';
import { useAuth } from './Auth/AuthContext';
import { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout: authLogout } = useAuth();
  const { cartItems } = useContext(ShopContext);
  
  const getTotalCartItems = () => {
    return Object.values(cartItems).reduce((total, quantity) => total + quantity, 0);
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className="bg-[#B22222] text-white px-6 py-4">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <div className="text-2xl font-bold">
          <Link to="/" onClick={() => setIsMenuOpen(false)}><img src="/Logos/Logo.jpg" alt="Logo" className="h-8"/></Link>
        </div>

        {/* Hamburger */}
        <div className="md:hidden text-2xl cursor-pointer" onClick={toggleMenu}>
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </div>

        {/* Nav Links */}
        <div className={`md:flex md:items-center md:space-x-6 text-sm font-medium 
          ${isMenuOpen ? 'block mt-4' : 'hidden'} md:mt-0`}>
          <div>
            <Link to="/" className="block py-2 md:p-0 hover:text-yellow-300">
              Home
              <hr className='w-2/4 border-none h-1.5px bg-yellow-300 '/>
            </Link>
          </div>
          <div className="hidden md:block">
            <Link to="/collection" className="block py-2 md:p-0 hover:text-yellow-300">
              Collection
              <hr className='w-2/4 border-none h-1.5px hover:bg-yellow-300'/>
            </Link>
          </div>
          <div>
            <Link to="/about" className="block py-2 md:p-0 hover:text-yellow-300">
              About
              <hr className='w-2/4 border-none h-1.5px bg-yellow-300 hover'/>
            </Link>
          </div>
          <div>
            <Link to="/contact" className="block py-2 md:p-0 hover:text-yellow-300">
              Contact
              <hr className='w-2/4 border-none h-1.5px bg-yellow-300 hover'/>
            </Link>
          </div>

          {/* Search */}
          <div className="hidden md:block">
            <Link to="/search" className="flex items-center gap-1 py-2 md:p-0 hover:text-yellow-300">
              <FaSearch className="text-lg" />
              Search
            </Link>
          </div>

          {/* Cart */}
          <div className="hidden md:block">
            <Link to="/cart" className="flex items-center gap-1 py-2 md:p-0 hover:text-yellow-300">
              <div className="relative">
                <FaShoppingCart className="text-lg" />
                {getTotalCartItems() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-yellow-300 text-black rounded-full px-1 text-xs min-w-[18px] text-center">
                    {getTotalCartItems()}
                  </span>
                )}
              </div>
            </Link>
          </div>

          {/* Profile or Sign In */}
          {isAuthenticated ? (
            <div className="relative group" ref={profileRef}>
              <div className="flex items-center gap-1 py-2 md:p-0 hover:text-yellow-300 focus:outline-none cursor-pointer">
                <FaUserCircle className="text-lg" />
                <span>{user?.name || 'Profile'}</span>
              </div>
              {/* Dropdown menu */}
              <div className="hidden group-hover:block absolute right-0 pt-4 z-50">
                <div className="cursor-pointer w-40 bg-white text-black rounded shadow-md transition-all duration-150">
                  <Link
                    to="/dashboard"
                    className="block px-4 py-2 hover:bg-gray-100 rounded"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/orders"
                    className="block px-4 py-2 hover:bg-gray-100 rounded"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    Orders
                  </Link>
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
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1 py-2 md:p-0">
              <Link to="/login" className="bg-yellow-300 text-[#B22222] font-semibold px-4 py-2 rounded hover:bg-yellow-400 transition-colors duration-200">Sign In</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
