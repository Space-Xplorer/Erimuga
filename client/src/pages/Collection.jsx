import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from '../config/axios';
import SidebarFilters from '../components/Collection/SidebarFilters';
import TopControls from '../components/Collection/TopControls';
import ProductGrid from '../components/Collection/ProductGrid';

const PAGE_SIZE = 12;

const CollectionPage = () => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  const [metadata, setMetadata] = useState({ categories: [], apparelTypes: [], subcategories: [] });
  const [filters, setFilters] = useState({ mainCategory: '', apparelType: '', subcategory: '', size: '', color: '' });
  const [sortOption, setSortOption] = useState('Newest');
  const [gridView, setGridView] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Category/sort/search filtering happens server-side (scales with catalog size);
  // size/color remain a client-side refinement over that already-narrowed result set.
  useEffect(() => {
    setPage(1);
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = {};
        if (searchQuery) params.search = searchQuery;
        if (filters.mainCategory) params.mainCategory = filters.mainCategory;
        if (filters.apparelType) params.apparelType = filters.apparelType;
        if (filters.subcategory) params.subcategory = filters.subcategory;
        if (sortOption === 'Price Low to High') params.sortBy = 'priceLowHigh';
        else if (sortOption === 'Price High to Low') params.sortBy = 'priceHighLow';

        const [productsRes, metadataRes] = await Promise.all([
          axios.get('/products', { params }),
          axios.get('/metadata'),
        ]);
        setProducts(productsRes.data);
        setMetadata(metadataRes.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [searchQuery, filters.mainCategory, filters.apparelType, filters.subcategory, sortOption]);

  // Reset page when the client-side (size/color) filters change
  useEffect(() => { setPage(1); }, [filters.size, filters.color]);

  const filteredProducts = useMemo(() => {
    let temp = [...products];
    if (filters.size) temp = temp.filter(p => p.availableSizes?.includes(filters.size));
    if (filters.color) temp = temp.filter(p => p.availableColors?.includes(filters.color));
    return temp;
  }, [products, filters.size, filters.color]);

  const totalPages = Math.ceil(filteredProducts.length / PAGE_SIZE);
  const paginatedProducts = filteredProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  const handleSizeClick = (size) => setFilters(prev => ({ ...prev, size: prev.size === size ? '' : size }));
  const handleColorClick = (color) => setFilters(prev => ({ ...prev, color: prev.color === color ? '' : color }));
  const resetFilters = () => setFilters({ mainCategory: '', apparelType: '', subcategory: '', size: '', color: '' });

  const uniqueColors = Array.from(new Set(products.flatMap(p => p.availableColors || [])));
  const allSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  if (loading) return <div className="text-center py-20 text-gray-500 animate-pulse">Loading products…</div>;
  if (error) return <div className="text-center py-20 text-red-600">Error: {error}</div>;

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-3xl sm:text-4xl font-bold text-center mb-2">
        {searchQuery ? `Search results for "${searchQuery}"` : 'Explore Our Collection'}
      </h1>
      {searchQuery && (
        <p className="text-center text-gray-500 text-sm mb-6">
          {filteredProducts.length} result{filteredProducts.length !== 1 ? 's' : ''} found
          {' · '}
          <a href="/collection" className="text-[#b22222] underline hover:text-red-700">Clear search</a>
        </p>
      )}

      <TopControls
        productCount={filteredProducts.length}
        sortOption={sortOption}
        onSortChange={setSortOption}
        onToggleMobileFilters={() => setShowMobileFilters(!showMobileFilters)}
        gridView={gridView}
        onViewChange={setGridView}
      />

      <div className="flex flex-col lg:flex-row gap-8 mt-6">
        {showMobileFilters && (
          <div className="lg:hidden">
            <SidebarFilters
              filters={filters} metadata={metadata} uniqueColors={uniqueColors} allSizes={allSizes}
              onFilterChange={handleFilterChange} onSizeClick={handleSizeClick} onColorClick={handleColorClick} onReset={resetFilters}
            />
          </div>
        )}

        <aside className="hidden lg:block w-full lg:w-1/4">
          <SidebarFilters
            filters={filters} metadata={metadata} uniqueColors={uniqueColors} allSizes={allSizes}
            onFilterChange={handleFilterChange} onSizeClick={handleSizeClick} onColorClick={handleColorClick} onReset={resetFilters}
          />
        </aside>

        <main className="w-full lg:w-3/4">
          <ProductGrid products={paginatedProducts} view={gridView ? 'grid' : 'list'} />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
                .reduce((acc, n, idx, arr) => {
                  if (idx > 0 && n - arr[idx - 1] > 1) acc.push('…');
                  acc.push(n);
                  return acc;
                }, [])
                .map((item, idx) =>
                  item === '…' ? (
                    <span key={`ellipsis-${idx}`} className="px-2 text-gray-400">…</span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => setPage(item)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${page === item ? 'bg-[#b22222] text-white' : 'border border-gray-300 text-gray-600 hover:bg-gray-100'}`}
                    >
                      {item}
                    </button>
                  )
                )}

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default CollectionPage;
