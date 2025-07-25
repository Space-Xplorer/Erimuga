import React, { useState, useEffect } from 'react';
import PartialCard from './PartialCard';
import useScreenSize from '../hooks/useScreenSize';

const LatestCollection = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const productsPerRow = useScreenSize();

  useEffect(() => {
    const fetchLatestProducts = async () => {
      try {
        const response = await fetch('http://localhost:5000/products');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        // Sort products by creation date (newest first) and get only the number that fit in one row
        const sortedProducts = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const latestProducts = sortedProducts.slice(0, productsPerRow);
        setProducts(latestProducts);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestProducts();
  }, [productsPerRow]);

  if (loading) return <div className="text-center py-8">Loading latest collection...</div>;
  if (error) return <div className="text-center py-8 text-red-600">Error: {error}</div>;

  return (
    <section className='bg-gray-50 py-12'>
      <div className='container mx-auto px-6'>
        <h2 className='text-3xl font-bold mb-8 text-center'>Latest Collection</h2>
        <div className='max-w-screen-xl mx-auto'>
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
            {products.map((product) => (
              <div key={product._id} className="flex flex-col">
                <PartialCard product={product} />
                <div className="p-3 text-center">
                  <h3 className="font-semibold text-gray-800 text-lg group-hover:text-[#B22222] transition">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 mt-1">₹{product.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
    </section>
  )
}

export default LatestCollection
