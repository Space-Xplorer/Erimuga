// src/components/collection/ProductGrid.jsx

import React from 'react';
import ProductCard from '../ProductCard';

const ProductGrid = ({ products, view }) => {
  if (products.length === 0) {
    return (
      <div className="py-24 text-center">
        <h3 className="font-display text-3xl text-ink">Nothing here yet</h3>
        <p className="mt-3 text-sm text-ink-muted">
          Try widening your filters, or browse another collection.
        </p>
      </div>
    );
  }

  return (
    <div className={`${view === 'grid' ? 'grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-3' : 'flex flex-col gap-6'}`}>
      {products.map((product) => (
        <ProductCard key={product._id} product={product} view={view} />
      ))}
    </div>
  );
};

export default ProductGrid;