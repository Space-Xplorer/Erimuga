import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaTwitter, FaLinkedin } from 'react-icons/fa';
import axios from '../config/axios';

const SOCIALS = [
  { href: 'https://instagram.com', icon: FaInstagram, label: 'Instagram' },
  { href: 'https://facebook.com', icon: FaFacebookF, label: 'Facebook' },
  { href: 'https://twitter.com', icon: FaTwitter, label: 'Twitter' },
  { href: 'https://linkedin.com', icon: FaLinkedin, label: 'LinkedIn' },
];

const Footer = () => {
  // Collections were hardcoded links before; now they follow the real categories.
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    axios.get('/categories')
      .then((res) => setCategories(Array.isArray(res.data) ? res.data : []))
      .catch(() => setCategories([]));
  }, []);

  return (
    <footer className="mt-auto border-t border-paper-deep bg-paper-dim">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-2">
            <span className="font-display text-3xl text-ink">Erimuga</span>
            <p className="mt-4 max-w-sm text-sm leading-[1.9] text-ink-soft">
              Handwoven Eri and Muga silk from Assam — made slowly, on the loom, by people
              we know by name.
            </p>
            <div className="mt-6 flex gap-5">
              {SOCIALS.map(({ href, icon: Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="text-ink-muted transition-colors hover:text-brand"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Collections */}
          <div>
            <h2 className="eyebrow">Collections</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {categories.map((cat) => (
                <li key={cat._id}>
                  <Link to={`/collection/${cat.slug}`} className="text-ink-soft transition-colors hover:text-brand">
                    {cat.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/collection" className="text-ink-soft transition-colors hover:text-brand">
                  Everything
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h2 className="eyebrow">Get in touch</h2>
            <ul className="mt-4 space-y-2.5 text-sm text-ink-soft">
              <li><a href="mailto:support@erimuga.com" className="transition-colors hover:text-brand">support@erimuga.com</a></li>
              <li><a href="tel:+919876543210" className="transition-colors hover:text-brand">+91 98765 43210</a></li>
              <li><Link to="/about" className="transition-colors hover:text-brand">About</Link></li>
              <li><Link to="/contact" className="transition-colors hover:text-brand">Contact</Link></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-paper-deep">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 py-5 text-xs text-ink-muted sm:flex-row sm:justify-between sm:px-6 lg:px-8">
          <span>&copy; {new Date().getFullYear()} Erimuga. All rights reserved.</span>
          <span className="flex items-center gap-4">
            <Link to="/privacy" className="transition-colors hover:text-brand">Privacy Policy</Link>
            <Link to="/terms" className="transition-colors hover:text-brand">Terms</Link>
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
