// src/pages/CollectionPage.jsx

import React, { useState, useEffect } from 'react';
import SidebarFilters from '../components/Collection/SidebarFilters';
import TopControls from '../components/Collection/TopControls';
import ProductGrid from '../components/Collection/ProductGrid';

const CollectionPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [metadata, setMetadata] = useState({
    categories: [],
    apparelTypes: [],
    subcategories: [],
  });

  const [filters, setFilters] = useState({
    mainCategory: '',
    apparelType: '',
    subcategory: '',
    size: '',
    color: '',
  });

  const [sortOption, setSortOption] = useState('Newest');
  const [gridView, setGridView] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, metadataRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_BASE_URL}/products`),
          fetch(`${import.meta.env.VITE_BASE_URL}/metadata`)
        ]);
        if (!productsRes.ok || !metadataRes.ok) {
          throw new Error('Failed to fetch data');
        }
        const productsData = await productsRes.json();
        const metadataData = await metadataRes.json();
        setProducts(productsData);
        setFilteredProducts(productsData);
        setMetadata(metadataData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    let tempProducts = [...products];

    // Filtering logic
    if (filters.mainCategory) tempProducts = tempProducts.filter(p => p.mainCategory === filters.mainCategory);
    if (filters.apparelType) tempProducts = tempProducts.filter(p => p.apparelType === filters.apparelType);
    if (filters.subcategory) tempProducts = tempProducts.filter(p => p.subcategory === filters.subcategory);
    if (filters.size) tempProducts = tempProducts.filter(p => p.availableSizes.includes(filters.size));
    if (filters.color) tempProducts = tempProducts.filter(p => p.availableColors.includes(filters.color));

    // Sorting logic
    if (sortOption === 'Price Low to High') {
      tempProducts.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'Price High to Low') {
      tempProducts.sort((a, b) => b.price - a.price);
    } else {
      tempProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    setFilteredProducts(tempProducts);
  }, [products, filters, sortOption]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSizeClick = (size) => {
    setFilters(prev => ({ ...prev, size: prev.size === size ? '' : size }));
  };

  const handleColorClick = (color) => {
    setFilters(prev => ({ ...prev, color: prev.color === color ? '' : color }));
  };

  const resetFilters = () => {
    setFilters({ mainCategory: '', apparelType: '', subcategory: '', size: '', color: '' });
  };

  const uniqueColors = Array.from(new Set(products.flatMap(p => p.availableColors)));
  const allSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  if (loading) return <div className="text-center py-20 text-gray-500 animate-pulse">Loading products...</div>;
  if (error) return <div className="text-center py-20 text-red-600">Error: {error}</div>;

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-3xl sm:text-4xl font-bold text-center mb-10">Explore Our Collection</h1>

      <TopControls
        productCount={filteredProducts.length}
        sortOption={sortOption}
        onSortChange={setSortOption}
        onToggleMobileFilters={() => setShowMobileFilters(!showMobileFilters)}
        gridView={gridView}
        onViewChange={setGridView}
      />

      <div className="flex flex-col lg:flex-row gap-8 mt-6">
        {/* Mobile Filters */}
        {showMobileFilters && (
          <div className="lg:hidden">
            <SidebarFilters
              filters={filters}
              metadata={metadata}
              uniqueColors={uniqueColors}
              allSizes={allSizes}
              onFilterChange={handleFilterChange}
              onSizeClick={handleSizeClick}
              onColorClick={handleColorClick}
              onReset={resetFilters}
            />
          </div>
        )}

        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-full lg:w-1/4">
          <SidebarFilters
            filters={filters}
            metadata={metadata}
            uniqueColors={uniqueColors}
            allSizes={allSizes}
            onFilterChange={handleFilterChange}
            onSizeClick={handleSizeClick}
            onColorClick={handleColorClick}
            onReset={resetFilters}
          />
        </aside>

        {/* Product Grid */}
        <main className="w-full lg:w-3/4">
          <ProductGrid products={filteredProducts} view={gridView ? 'grid' : 'list'} />
        </main>
      </div>
    </div>
  );
};

export default CollectionPage;