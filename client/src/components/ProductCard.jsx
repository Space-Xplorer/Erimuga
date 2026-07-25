import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { ShopContext } from '../context/ShopContext';
import { getProductThumbnail } from '../utils/productImage';

const MiniStars = ({ rating, count }) => {
  if (!rating || !count) return null;
  return (
    <div className="mt-1.5 flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`h-3 w-3 ${n <= Math.round(rating) ? 'fill-accent text-accent' : 'text-paper-deep'}`}
        />
      ))}
      <span className="ml-0.5 text-xs text-ink-muted">({count})</span>
    </div>
  );
};

// The whole card is one link now — the old layout had a separate "View the
// Product" button doing what clicking the card already did.
const ProductCard = ({ product, view = 'grid' }) => {
  const { cartItems } = useContext(ShopContext);

  if (!product) return null;

  const inCart = Array.isArray(cartItems)
    ? cartItems
        .filter((item) => (item.productId?._id || item.productId) === product._id)
        .reduce((sum, item) => sum + item.quantity, 0)
    : 0;

  const isNew = (() => {
    if (!product.date) return false;
    const days = Math.floor((Date.now() - new Date(product.date)) / 86400000);
    return days <= 7;
  })();

  const price = `₹${Number(product.price).toLocaleString('en-IN')}`;

  if (view === 'list') {
    return (
      <Link
        to={`/product/${product._id}`}
        className="group flex gap-5 border-b border-paper-deep pb-5"
      >
        <div className="w-28 shrink-0 overflow-hidden bg-paper-dim sm:w-36">
          <img
            src={getProductThumbnail(product)}
            alt={product.name || 'Product image'}
            loading="lazy"
            className="aspect-3/4 w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        </div>
        <div className="min-w-0 flex-1 self-center">
          <h2 className="font-display text-xl text-ink transition-colors group-hover:text-brand">
            {product.name}
          </h2>
          <MiniStars rating={product.avgRating} count={product.reviewCount} />
          <p className="mt-1.5 text-sm text-ink-muted">{price}</p>
          {inCart > 0 && (
            <p className="mt-1 text-xs text-brand">{inCart} in your bag</p>
          )}
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/product/${product._id}`} className="group block">
      <div className="relative overflow-hidden bg-paper-dim">
        <img
          src={getProductThumbnail(product)}
          alt={product.name || 'Product image'}
          loading="lazy"
          className="aspect-3/4 w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        {isNew && (
          <span className="absolute left-3 top-3 bg-paper/90 px-2 py-1 text-[10px] uppercase tracking-editorial text-ink-soft backdrop-blur">
            New
          </span>
        )}
        {inCart > 0 && (
          <span className="absolute right-3 top-3 flex h-6 min-w-6 items-center justify-center rounded-full bg-brand px-1.5 text-xs text-white">
            {inCart}
          </span>
        )}
      </div>

      <h2 className="mt-3 font-display text-xl leading-snug text-ink transition-colors group-hover:text-brand">
        {product.name}
      </h2>
      <MiniStars rating={product.avgRating} count={product.reviewCount} />
      <p className="mt-1 text-sm text-ink-muted">{price}</p>
    </Link>
  );
};

export default ProductCard;
