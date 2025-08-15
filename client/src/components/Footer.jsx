import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaTwitter, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-[#B22222] text-white py-8 mt-auto">
      <div className="container mx-auto px-4 grid grid-cols-1 sm:grid-cols-3 gap-8">
        
        {/* Brand & About */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <img src="/Logos/Logo.jpg" alt="Erimuga Logo" className="h-8 w-auto rounded" />
            {/* <h2 className="text-xl font-bold">Erimuga</h2> */}
          </div>
          <p className="text-sm leading-relaxed">
            Your one-stop shop for quality products at the best prices. We value
            customer satisfaction above all else.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Quick Links</h2>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-yellow-300 transition-colors">Home</Link></li>
            <li><Link to="/collection" className="hover:text-yellow-300 transition-colors">Collection</Link></li>
            <li><Link to="/about" className="hover:text-yellow-300 transition-colors">About</Link></li>
            <li><Link to="/contact" className="hover:text-yellow-300 transition-colors">Contact</Link></li>
            <li><Link to="/cart" className="hover:text-yellow-300 transition-colors">Cart</Link></li>
          </ul>
        </div>

        {/* Contact & Socials */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Contact Us</h2>
          <p className="text-sm">Email: support@erimuga.com</p>
          <p className="text-sm">Phone: +91 98765 43210</p>
          
          {/* Social Media Icons */}
          <div className="flex gap-4 mt-4">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-300 transition-colors">
              <FaFacebookF />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-300 transition-colors">
              <FaInstagram />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-300 transition-colors">
              <FaTwitter />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-300 transition-colors">
              <FaLinkedin />
            </a>
          </div>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="border-t border-red-300 mt-6 pt-4 text-center text-sm">
        &copy; {new Date().getFullYear()} Erimuga. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
