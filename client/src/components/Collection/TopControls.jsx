// src/components/collection/TopControls.jsx

import React from 'react';
import { SlidersHorizontal, Grid, List } from 'lucide-react';

const TopControls = ({ productCount, sortOption, onSortChange, onToggleMobileFilters, gridView, onViewChange }) => {
  return (
    <div className="flex flex-wrap justify-between items-center gap-4">
      {/* Left side: Filter toggle and count */}
      <div className="flex items-center gap-4">
        <button onClick={onToggleMobileFilters} className="lg:hidden flex items-center gap-2 px-4 py-2 border rounded-md text-sm font-medium bg-white hover:bg-gray-50">
          <SlidersHorizontal size={16} /> Filters
        </button>
        <p className="text-sm text-gray-600 hidden sm:block">
          Showing <span className="font-bold text-gray-900">{productCount}</span> Products
        </p>
      </div>

      {/* Right side: Sort and View options */}
      <div className="flex items-center gap-2">
        <select value={sortOption} onChange={(e) => onSortChange(e.target.value)} className="border p-2 rounded-md text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500">
          <option>Newest</option>
          <option>Price Low to High</option>
          <option>Price High to Low</option>
        </select>

        <div className="flex border rounded-md p-1 bg-gray-50">
          <button onClick={() => onViewChange(true)} className={`p-1.5 rounded transition ${gridView ? 'bg-white shadow-sm' : 'text-gray-500 hover:bg-gray-200'}`}>
            <Grid size={18} />
          </button>
          <button onClick={() => onViewChange(false)} className={`p-1.5 rounded transition ${!gridView ? 'bg-white shadow-sm' : 'text-gray-500 hover:bg-gray-200'}`}>
            <List size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopControls;