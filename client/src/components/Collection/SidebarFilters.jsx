// src/components/collection/SidebarFilters.jsx

import React from 'react';

const FilterSection = ({ title, children }) => (
  <div className="py-4 border-b border-gray-200 last:border-b-0">
    <label className="block mb-3 font-semibold text-gray-800">{title}</label>
    {children}
  </div>
);

const SidebarFilters = ({
  filters,
  categories = [],
  tags = [],
  uniqueColors,
  allSizes,
  onFilterChange,
  onSizeClick,
  onColorClick,
  onReset,
}) => {
  // Subcategories belong to a single category, so the list is derived from the
  // selected one rather than being a flat global vocabulary.
  const selected = categories.find((c) => c.slug === filters.mainCategory);
  const subcategories = selected?.subcategories || [];

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm sticky top-6 max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center pb-4 border-b border-gray-200">
        <h2 className="text-xl font-bold">Filters</h2>
        <button onClick={onReset} className="text-sm font-medium text-brand hover:opacity-80 transition">
          Reset All
        </button>
      </div>

      <FilterSection title="Category">
        <select name="mainCategory" value={filters.mainCategory} onChange={onFilterChange} className="w-full border p-2 rounded-md bg-gray-50 focus:ring-2 focus:ring-brand focus:outline-none">
          <option value="">All</option>
          {categories.map(cat => <option key={cat.slug} value={cat.slug}>{cat.name}</option>)}
        </select>
      </FilterSection>

      <FilterSection title="Subcategory">
        <select
          name="subcategory"
          value={filters.subcategory}
          onChange={onFilterChange}
          disabled={!filters.mainCategory || subcategories.length === 0}
          className="w-full border p-2 rounded-md bg-gray-50 focus:ring-2 focus:ring-brand focus:outline-none disabled:text-gray-400"
        >
          <option value="">
            {!filters.mainCategory ? 'Choose a category first' : 'All'}
          </option>
          {subcategories.map(sub => <option key={sub.slug} value={sub.slug}>{sub.name}</option>)}
        </select>
      </FilterSection>

      {tags.length > 0 && (
        <FilterSection title="Tags">
          <select name="tag" value={filters.tag} onChange={onFilterChange} className="w-full border p-2 rounded-md bg-gray-50 focus:ring-2 focus:ring-brand focus:outline-none">
            <option value="">All</option>
            {tags.map(tag => <option key={tag} value={tag}>{tag}</option>)}
          </select>
        </FilterSection>
      )}

      <FilterSection title="Size">
        <div className="flex flex-wrap gap-2">
          {allSizes.map(size => (
            <button key={size} className={`px-4 py-1.5 border rounded-full text-sm font-medium transition ${filters.size === size ? 'bg-black text-white' : 'bg-white hover:bg-gray-100'}`} onClick={() => onSizeClick(size)}>
              {size}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Color">
        <div className="flex flex-wrap gap-3">
          {uniqueColors.map(color => (
            <div key={color} className={`w-7 h-7 rounded-full border cursor-pointer transition duration-150 ease-in-out ${filters.color === color ? 'ring-2 ring-offset-2 ring-black' : ''}`} style={{ backgroundColor: color }} onClick={() => onColorClick(color)} title={color} />
          ))}
        </div>
      </FilterSection>
    </div>
  );
};

export default SidebarFilters;
