// src/components/collection/ProductGrid.jsx

import React from 'react';
import ProductCard from '../ProductCard';

const ProductGrid = ({ products, view }) => {
  if (products.length === 0) {
    return (
      <div className="text-center py-20 bg-gray-50 rounded-lg">
        <h3 className="text-2xl font-semibold text-gray-800">😕 No Products Found</h3>
        <p className="text-gray-500 mt-2">Try adjusting your filters to find what you're looking for.</p>
      </div>
    );
  }

  return (
    <div className={`${view === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' : 'flex flex-col gap-4'}`}>
      {products.map((product) => (
        <ProductCard key={product._id} product={product} view={view} />
      ))}
    </div>
  );
};

export default ProductGrid;