import React from 'react';
import { Link } from 'react-router-dom';
import { getProductThumbnail } from '../../utils/productImage';

// A single product in a category rail. Deliberately quiet — no badges, no
// discount flags, no "quick buy". The photograph does the selling.
const RailCard = ({ product }) => (
  <Link
    to={`/product/${product._id}`}
    className="group block w-40 sm:w-48 md:w-52"
  >
    <div className="overflow-hidden bg-paper-dim">
      <img
        src={getProductThumbnail(product)}
        alt={product.name}
        loading="lazy"
        className="aspect-3/4 w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
      />
    </div>
    <h3 className="mt-3 font-display text-lg leading-snug text-ink group-hover:text-brand transition-colors">
      {product.name}
    </h3>
    <p className="mt-0.5 text-sm text-ink-muted">
      ₹{Number(product.price).toLocaleString('en-IN')}
    </p>
  </Link>
);

export default RailCard;
