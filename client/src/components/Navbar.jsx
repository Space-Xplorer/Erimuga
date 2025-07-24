import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaShoppingCart, FaBars, FaTimes, FaSearch, FaUserCircle } from 'react-icons/fa';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleProfile = () => setIsProfileOpen(!isProfileOpen);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="bg-[#B22222] text-white px-6 py-4">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <div className="text-2xl font-bold">
          <Link to="/" onClick={() => setIsMenuOpen(false)}>MyStore</Link>
        </div>

        {/* Hamburger */}
        <div className="md:hidden text-2xl cursor-pointer" onClick={toggleMenu}>
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </div>

        {/* Nav Links */}
        <ul className={`md:flex md:items-center md:space-x-6 text-sm font-medium 
          ${isMenuOpen ? 'block mt-4' : 'hidden'} md:mt-0`}>
          <li><Link to="/" className="block py-2 md:p-0 hover:text-yellow-300">Home</Link></li>
          <li><Link to="/collection" className="block py-2 md:p-0 hover:text-yellow-300">Collection</Link></li>
          <li><Link to="/about" className="block py-2 md:p-0 hover:text-yellow-300">About</Link></li>
          <li><Link to="/contact" className="block py-2 md:p-0 hover:text-yellow-300">Contact</Link></li>

          {/* Search */}
          <li>
            <Link to="/search" className="flex items-center gap-1 py-2 md:p-0 hover:text-yellow-300">
              <FaSearch className="text-lg" />
              Search
            </Link>
          </li>

          {/* Cart */}
          <li>
            <Link to="/cart" className="flex items-center gap-1 py-2 md:p-0 hover:text-yellow-300">
              <FaShoppingCart className="text-lg" />
              Cart
            </Link>
          </li>

          {/* Profile with Dropdown */}
          <li ref={profileRef} className="relative">
            <button
              onClick={toggleProfile}
              className="flex items-center gap-1 py-2 md:p-0 hover:text-yellow-300 focus:outline-none"
            >
              <FaUserCircle className="text-lg" />
              Profile
            </button>

            {/* Dropdown menu */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white text-black rounded shadow-md z-50">
                <Link
                  to="/dashboard"
                  className="block px-4 py-2 hover:bg-gray-100"
                  onClick={() => setIsProfileOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/orders"
                  className="block px-4 py-2 hover:bg-gray-100"
                  onClick={() => setIsProfileOpen(false)}
                >
                  Orders
                </Link>
                <button
                  className="w-full text-left px-4 py-2 hover:bg-gray-100"
                  onClick={() => {
                    setIsProfileOpen(false);
                    // Add logout logic here
                    alert("Logged out!");
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
