import React, { useContext } from 'react'
import { ShopContext } from '../context/ShopContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useContext(ShopContext);

  const handleAddToCart = () => {
    addToCart(product);
  };

  const isNewProduct = (date) => {
    if (!date) return false;
    const productDate = new Date(date);
    const currentDate = new Date();
    // Check if the product was created within the last 7 days
    const daysDifference = Math.floor((currentDate - productDate) / (1000 * 60 * 60 * 24));
    return daysDifference <= 7;
  };

  if (!product) return null;

  return (
    <div className='bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:scale-105'>
      <div className='relative group'>
        {isNewProduct(product.date) && (
          <div className="absolute top-2 right-2 bg-[#FFD700]/80 text-black text-xs px-2 py-1 rounded shadow">
            New
          </div>
        )}
      <img 
        src={product.image && product.image[0] ? product.image[0] : '/placeholder.jpg'} 
        alt={product.name || 'Product image'} 
        className='w-full h-60 object-cover transition-transform duration-300 group-hover:scale-110' 
      />

        <div className='absolute inset-0 group-hover:bg-opacity-20 transition-all duration-300'></div>
      </div>
      <div className='p-4'>
        <h2 className='text-lg font-semibold mb-2'>{product.name}</h2>
        <p className='text-gray-600 mb-4'>₹{product.price}</p>
        <button 
          onClick={handleAddToCart} 
          className='w-full bg-[#B22222] text-white py-2 px-4 rounded hover:bg-red-600 transition-colors duration-300 flex items-center justify-center gap-2'
        >
          Add to Cart
        </button>
      </div>
    </div>
  )
}

export default ProductCard
