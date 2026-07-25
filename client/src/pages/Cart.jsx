import React, { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import { Link, useNavigate } from 'react-router-dom';
import { getProductThumbnail } from '../utils/productImage';

const Cart = () => {
  const {
    cartItems = [],
    products = [],
    removeFromCart,
    updateQuantity,
    getTotalAmount,
  } = useContext(ShopContext);

  const navigate = useNavigate();
  const totalAmount = getTotalAmount();
  const inr = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

  const isEmpty = !Array.isArray(cartItems) || cartItems.length === 0;

  return (
    <div className="min-h-[60vh] bg-paper">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="eyebrow">Your selection</p>
        <h1 className="mt-2 font-display text-4xl text-ink sm:text-5xl">Cart</h1>

        {isEmpty ? (
          <div className="py-24 text-center">
            <p className="font-display text-2xl text-ink">Your cart is empty.</p>
            <Link
              to="/collection"
              className="mt-6 inline-flex items-center gap-2 border-b border-ink/25 pb-1 text-sm text-ink transition-colors hover:border-brand hover:text-brand"
            >
              Browse the collections
              <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        ) : (
          <div className="mt-10 flex flex-col gap-10 lg:flex-row">
            {/* Line items */}
            <div className="flex-1 divide-y divide-paper-deep border-t border-paper-deep">
              {cartItems.map((item) => {
                const product = products.find((p) => p._id === item.productId);
                if (!product) return null;
                const unit = item.priceAtPurchase || product.price;

                return (
                  <div key={item._id || item.productId} className="flex gap-5 py-6">
                    <Link to={`/product/${product._id}`} className="shrink-0">
                      <img
                        src={getProductThumbnail(product)}
                        alt={product.name}
                        className="aspect-3/4 w-24 object-cover bg-paper-dim sm:w-28"
                      />
                    </Link>

                    <div className="flex min-w-0 flex-1 flex-col">
                      <Link
                        to={`/product/${product._id}`}
                        className="font-display text-xl text-ink transition-colors hover:text-brand"
                      >
                        {product.name}
                      </Link>
                      <p className="mt-1 text-sm text-ink-muted">
                        {[item.size && `Size ${item.size}`, item.color].filter(Boolean).join(' · ') || '—'}
                      </p>
                      <p className="mt-0.5 text-sm text-ink-muted">{inr(unit)} each</p>

                      <div className="mt-auto flex items-center gap-4 pt-4">
                        <div className="inline-flex items-center border border-paper-deep">
                          <button
                            onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                            className="px-3 py-1.5 text-ink-soft hover:text-brand"
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <span className="w-8 text-center text-sm text-ink">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="px-3 py-1.5 text-ink-soft hover:text-brand"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.productCode)}
                          className="text-sm text-ink-muted underline-offset-4 hover:text-brand hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="font-display text-lg text-ink">{inr(unit * item.quantity)}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <aside className="lg:w-80 lg:shrink-0">
              <div className="border border-paper-deep bg-paper-dim p-6 lg:sticky lg:top-28">
                <h2 className="eyebrow">Summary</h2>
                <div className="mt-4 flex items-baseline justify-between">
                  <span className="text-sm text-ink-soft">Subtotal</span>
                  <span className="font-display text-2xl text-ink">{inr(totalAmount)}</span>
                </div>
                <p className="mt-2 text-xs text-ink-muted">
                  Shipping and any taxes are calculated at checkout.
                </p>
                <button
                  onClick={() => navigate('/checkout')}
                  className="mt-6 w-full bg-brand py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:opacity-90"
                >
                  Proceed to Checkout
                </button>
                <Link
                  to="/collection"
                  className="mt-4 block text-center text-sm text-ink-soft underline-offset-4 hover:text-brand hover:underline"
                >
                  Continue browsing
                </Link>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
