
// import React, { useState, useEffect } from 'react';
// import ProductCard from '../components/ProductCard';
// import { SlidersHorizontal, Grid, List } from 'lucide-react';

// const Collection = () => {
//   const [products, setProducts] = useState([]);
//   const [filteredProducts, setFilteredProducts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const [metadata, setMetadata] = useState({
//     categories: [],
//     apparelTypes: [],
//     subcategories: [],
//   });

//   const [filters, setFilters] = useState({
//     mainCategory: '',
//     apparelType: '',
//     subcategory: '',
//     size: '',
//     color: '',
//   });

//   const [sortOption, setSortOption] = useState('Newest');
//   const [gridView, setGridView] = useState(true);
//   const [showMobileFilters, setShowMobileFilters] = useState(false);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const [productsRes, metadataRes] = await Promise.all([
//           fetch('http://localhost:5000/products'),
//           fetch('http://localhost:5000/metadata')
//         ]);

//         if (!productsRes.ok || !metadataRes.ok) {
//           throw new Error('Failed to fetch data');
//         }

//         const productsData = await productsRes.json();
//         const metadataData = await metadataRes.json();

//         setProducts(productsData);
//         setFilteredProducts(productsData);
//         setMetadata(metadataData);
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   useEffect(() => {
//     let filtered = [...products];

//     if (filters.mainCategory)
//       filtered = filtered.filter(p => p.mainCategory === filters.mainCategory);

//     if (filters.apparelType)
//       filtered = filtered.filter(p => p.apparelType === filters.apparelType);

//     if (filters.subcategory)
//       filtered = filtered.filter(p => p.subcategory === filters.subcategory);

//     if (filters.size)
//       filtered = filtered.filter(p => p.availableSizes.includes(filters.size));

//     if (filters.color)
//       filtered = filtered.filter(p => p.availableColors.includes(filters.color));

//     if (sortOption === 'Price Low to High') {
//       filtered.sort((a, b) => a.price - b.price);
//     } else if (sortOption === 'Price High to Low') {
//       filtered.sort((a, b) => b.price - a.price);
//     } else {
//       filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
//     }

//     setFilteredProducts(filtered);
//   }, [products, filters, sortOption]);

//   const handleFilterChange = (e) => {
//     const { name, value } = e.target;
//     setFilters(prev => ({ ...prev, [name]: value }));
//   };

//   const handleSizeClick = (size) => {
//     setFilters(prev => ({
//       ...prev,
//       size: prev.size === size ? '' : size
//     }));
//   };

//   const handleColorClick = (color) => {
//     setFilters(prev => ({
//       ...prev,
//       color: prev.color === color ? '' : color
//     }));
//   };

//   const resetFilters = () => {
//     setFilters({
//       mainCategory: '',
//       apparelType: '',
//       subcategory: '',
//       size: '',
//       color: ''
//     });
//   };

//   const uniqueColors = Array.from(new Set(products.flatMap(p => p.availableColors)));
//   const allSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

//   if (loading) return <div className="text-center py-20 text-gray-500 animate-pulse">Loading products...</div>;
//   if (error) return <div className="text-center py-20 text-red-600">Error: {error}</div>;

//   const Sidebar = (
//     <div className="bg-white p-4 rounded shadow sticky top-6 max-h-[80vh] overflow-y-auto">
//       <div className="flex justify-between items-center mb-4">
//         <h2 className="text-xl font-semibold">Filters</h2>
//         <button onClick={resetFilters} className="text-sm text-blue-600 hover:underline">Reset</button>
//       </div>

//       <div className="mb-4">
//         <label className="block mb-1 font-medium">Main Category</label>
//         <select
//           name="mainCategory"
//           value={filters.mainCategory}
//           onChange={handleFilterChange}
//           className="w-full border p-2 rounded"
//         >
//           <option value="">All</option>
//           {metadata.categories.map(cat => (
//             <option key={cat} value={cat}>{cat}</option>
//           ))}
//         </select>
//       </div>

//       <div className="mb-4">
//         <label className="block mb-1 font-medium">Apparel Type</label>
//         <select
//           name="apparelType"
//           value={filters.apparelType}
//           onChange={handleFilterChange}
//           className="w-full border p-2 rounded"
//         >
//           <option value="">All</option>
//           {metadata.apparelTypes.map(type => (
//             <option key={type} value={type}>{type}</option>
//           ))}
//         </select>
//       </div>

//       <div className="mb-4">
//         <label className="block mb-1 font-medium">Subcategory</label>
//         <select
//           name="subcategory"
//           value={filters.subcategory}
//           onChange={handleFilterChange}
//           className="w-full border p-2 rounded"
//         >
//           <option value="">All</option>
//           {metadata.subcategories.map(sub => (
//             <option key={sub} value={sub}>{sub}</option>
//           ))}
//         </select>
//       </div>

//       <div className="mb-4">
//         <label className="block mb-1 font-medium">Size</label>
//         <div className="flex flex-wrap gap-2">
//           {allSizes.map(size => (
//             <button
//               key={size}
//               className={`px-3 py-1 border rounded-full text-sm transition ${
//                 filters.size === size ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'
//               }`}
//               onClick={() => handleSizeClick(size)}
//             >
//               {size}
//             </button>
//           ))}
//         </div>
//       </div>

//       <div className="mb-4">
//         <label className="block mb-1 font-medium">Color</label>
//         <div className="flex flex-wrap gap-3">
//           {uniqueColors.map(color => (
//             <div
//               key={color}
//               className={`w-6 h-6 rounded-full border cursor-pointer transition duration-150 ease-in-out ${
//                 filters.color === color ? 'ring-2 ring-offset-2 ring-black' : ''
//               }`}
//               style={{ backgroundColor: color }}
//               onClick={() => handleColorClick(color)}
//               title={color}
//             ></div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );

//   return (
//     <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
//       <h1 className="text-3xl sm:text-4xl font-bold text-center mb-10">Explore Our Collection</h1>

//       {/* Top Bar */}
//       <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
//         <div className="flex gap-2 items-center">
//           <button onClick={() => setShowMobileFilters(!showMobileFilters)} className="lg:hidden flex items-center gap-1 px-3 py-1 border rounded text-sm">
//             <SlidersHorizontal size={16} /> Filters
//           </button>
//           <select
//             value={sortOption}
//             onChange={(e) => setSortOption(e.target.value)}
//             className="border p-2 rounded text-sm"
//           >
//             <option>Newest</option>
//             <option>Price Low to High</option>
//             <option>Price High to Low</option>
//           </select>
//         </div>

//         <div className="flex gap-2">
//           <button
//             onClick={() => setGridView(true)}
//             className={`p-2 rounded shadow-sm border transition ${
//               gridView ? 'bg-black text-white' : 'bg-white hover:bg-gray-100'
//             }`}
//           >
//             <Grid size={16} />
//           </button>
//           <button
//             onClick={() => setGridView(false)}
//             className={`p-2 rounded shadow-sm border transition ${
//               !gridView ? 'bg-black text-white' : 'bg-white hover:bg-gray-100'
//             }`}
//           >
//             <List size={16} />
//           </button>
//         </div>
//       </div>

//       <div className="flex flex-col lg:flex-row gap-6">
//         {showMobileFilters && <div className="lg:hidden">{Sidebar}</div>}
//         <div className="hidden lg:block w-full lg:w-1/4">{Sidebar}</div>

//         <div className="w-full lg:w-3/4">
//           {filteredProducts.length === 0 ? (
//             <p className="text-center text-gray-500 mt-10 text-lg">😕 No products match your filters.</p>
//           ) : (
//             <div className={`${gridView ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' : 'flex flex-col gap-4'}`}>
//               {filteredProducts.map((product) => (
//                 <ProductCard key={product._id} product={product} view={gridView ? 'grid' : 'list'} />
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Collection;



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
          fetch('http://localhost:5000/products'),
          fetch('http://localhost:5000/metadata')
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