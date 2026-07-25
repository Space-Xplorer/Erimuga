import React, { useState, useRef, useEffect, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaShoppingCart, FaBars, FaTimes, FaUserCircle } from 'react-icons/fa';
import { useAuth } from './Auth/AuthContext';
import { ShopContext } from '../context/ShopContext';
import axios from '../config/axios';
import SearchBar from './SearchBar';

const ADMIN_LINKS = [
  { to: '/admin', label: 'Admin Dashboard' },
  { to: '/admin/add-product', label: 'Add Products' },
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/categories', label: 'Categories' },
  { to: '/admin/homepage', label: 'Homepage' },
  { to: '/admin/customers', label: 'Customers' },
  { to: '/admin/coupons', label: 'Coupons' },
  { to: '/admin/messages', label: 'Messages' },
];

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [scrolled, setScrolled] = useState(false);
  const timerRef = useRef();
  const profileRef = useRef();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const { isAuthenticated, user, logout: authLogout } = useAuth();
  const { getTotalItems } = useContext(ShopContext);

  // The homepage opens on a full-bleed hero, so the bar floats over it until
  // the user scrolls. Every other route gets a solid bar from the start.
  const overHero = pathname === '/' && !scrolled && !isMenuOpen;

  useEffect(() => {
    axios.get('/categories')
      .then((res) => setCategories(Array.isArray(res.data) ? res.data : []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleProfileEnter = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsProfileOpen(true);
  };

  const handleProfileLeave = () => {
    timerRef.current = setTimeout(() => setIsProfileOpen(false), 150);
  };

  const cartCount = getTotalItems();

  const linkClass = overHero
    ? 'text-paper/90 hover:text-paper'
    : 'text-ink-soft hover:text-brand';

  return (
    <nav
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        overHero ? 'bg-transparent' : 'bg-paper/95 backdrop-blur border-b border-paper-deep'
      }`}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Wordmark */}
        <Link to="/" onClick={() => setIsMenuOpen(false)} className="shrink-0">
          <span
            className={`font-display text-3xl tracking-wide transition-colors ${
              overHero ? 'text-paper' : 'text-ink'
            }`}
          >
            Erimuga
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-7 text-sm md:flex">
          {categories.map((cat) => (
            <Link key={cat._id} to={`/collection/${cat.slug}`} className={`transition-colors ${linkClass}`}>
              {cat.name}
            </Link>
          ))}
          <Link to="/about" className={`transition-colors ${linkClass}`}>About</Link>
          <Link to="/contact" className={`transition-colors ${linkClass}`}>Contact</Link>

          <SearchBar />

          <Link to="/cart" className={`relative transition-colors ${linkClass}`} aria-label="Cart">
            <FaShoppingCart className="text-lg" />
            {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 min-w-4.5 rounded-full bg-brand px-1 text-center text-xs text-white">
                {cartCount}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <div
              className="relative flex items-center"
              ref={profileRef}
              onMouseEnter={handleProfileEnter}
              onMouseLeave={handleProfileLeave}
            >
              <div className={`flex cursor-pointer items-center gap-1.5 transition-colors ${linkClass}`}>
                <FaUserCircle className="text-lg" />
                <span>{user?.name || 'Profile'}</span>
              </div>
              {isProfileOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-52 rounded-md bg-white py-2 text-ink shadow-lg">
                  {user?.userType === 'admin' ? (
                    ADMIN_LINKS.map((l) => (
                      <Link key={l.to} to={l.to} className="block px-4 py-2 text-sm hover:bg-paper-dim">
                        {l.label}
                      </Link>
                    ))
                  ) : (
                    <>
                      <Link to="/dashboard" className="block px-4 py-2 text-sm hover:bg-paper-dim">Dashboard</Link>
                      <Link to="/orders" className="block px-4 py-2 text-sm hover:bg-paper-dim">Orders</Link>
                    </>
                  )}
                  <button
                    className="w-full px-4 py-2 text-left text-sm text-brand hover:bg-paper-dim"
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
              className={`border-b pb-0.5 transition-colors ${
                overHero
                  ? 'border-paper/40 text-paper hover:border-paper'
                  : 'border-ink/25 text-ink hover:border-brand hover:text-brand'
              }`}
            >
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className={`cursor-pointer text-xl md:hidden ${overHero ? 'text-paper' : 'text-ink'}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="space-y-4 border-t border-paper-deep bg-paper px-4 pb-6 pt-4 text-sm md:hidden">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              to={`/collection/${cat.slug}`}
              onClick={() => setIsMenuOpen(false)}
              className="block font-display text-xl text-ink hover:text-brand"
            >
              {cat.name}
            </Link>
          ))}

          <div className="border-t border-paper-deep pt-4 space-y-3">
            <Link to="/about" onClick={() => setIsMenuOpen(false)} className="block text-ink-soft hover:text-brand">About</Link>
            <Link to="/contact" onClick={() => setIsMenuOpen(false)} className="block text-ink-soft hover:text-brand">Contact</Link>
            <Link to="/cart" onClick={() => setIsMenuOpen(false)} className="block text-ink-soft hover:text-brand">
              Cart{cartCount > 0 ? ` (${cartCount})` : ''}
            </Link>
          </div>

          <div className="pt-1">
            <SearchBar mobile />
          </div>

          <div className="border-t border-paper-deep pt-4 space-y-3">
            {isAuthenticated ? (
              <>
                {user?.userType === 'admin' ? (
                  ADMIN_LINKS.map((l) => (
                    <Link
                      key={l.to}
                      to={l.to}
                      onClick={() => setIsMenuOpen(false)}
                      className="block text-ink-soft hover:text-brand"
                    >
                      {l.label}
                    </Link>
                  ))
                ) : (
                  <>
                    <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="block text-ink-soft hover:text-brand">Dashboard</Link>
                    <Link to="/orders" onClick={() => setIsMenuOpen(false)} className="block text-ink-soft hover:text-brand">Orders</Link>
                  </>
                )}
                <button
                  className="block w-full text-left text-brand"
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
              <Link
                to="/login"
                onClick={() => setIsMenuOpen(false)}
                className="block text-ink hover:text-brand"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
