import React, { useState, useEffect } from 'react';
import PartialCard from './PartialCard';
import useScreenSize from '../hooks/useScreenSize';

const BestSellers = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const productsPerRow = useScreenSize();

  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BASE_URL}/products`);
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        setProducts(data.filter(product => product.isBestSeller === 'yes')); // Filter for best sellers
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBestSellers();
  }, [productsPerRow]);

  if (loading) return <div className="text-center py-8">Loading best sellers...</div>;
  if (error) return <div className="text-center py-8 text-red-600">Error: {error}</div>;

  return (
    <section className='bg-gray-50 py-12'>
      <div className='container mx-auto px-6'>
        <h2 className='text-3xl font-bold mb-8 text-center'>Best Sellers</h2>
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

export default BestSellers