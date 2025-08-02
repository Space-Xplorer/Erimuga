// import React, { useContext, useState } from 'react'
// import { Link } from 'react-router-dom';
// import { ShopContext } from '../context/ShopContext';
// import { useAuth } from '../components/Auth/AuthContext';

// const ProductCard = ({ product }) => {
//   const { addToCart, cartItems } = useContext(ShopContext);
//   const { isAuthenticated } = useAuth();
//   const [isAdding, setIsAdding] = useState(false);

//   const getItemQuantity = (productId) => {
//     return cartItems[productId] || 0;
//   };

//   const handleAddToCart = async (e) => {
//     e.preventDefault(); // Prevent navigation when clicking the button
//     e.stopPropagation(); // Stop event from bubbling up
    
//     if (!isAuthenticated) {
//       // You might want to redirect to login or show a message
//       alert("Please login to add items to cart");
//       return;
//     }

//     setIsAdding(true);
//     try {
//       await addToCart(product);
//       setTimeout(() => setIsAdding(false), 500);
//     } catch (error) {
//       console.error("Failed to add to cart:", error);
//       setIsAdding(false);
//     }
//   };

//   const isNewProduct = (date) => {
//     if (!date) return false;
//     const productDate = new Date(date);
//     const currentDate = new Date();
//     // Check if the product was created within the last 7 days
//     const daysDifference = Math.floor((currentDate - productDate) / (1000 * 60 * 60 * 24));
//     return daysDifference <= 7;
//   };

//   if (!product) return null;

//   return (
//     <div className='bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:scale-105'>
//       <div className='relative group'>
//         {isNewProduct(product.date) && (
//           <div className="absolute top-2 right-2 bg-[#FFD700]/80 text-black text-xs px-2 py-1 rounded shadow">
//             New
//           </div>
//         )}
//       <img 
//         src={product.image && product.image[0] ? product.image[0] : '/placeholder.jpg'} 
//         alt={product.name || 'Product image'} 
//         className='w-full h-60 object-cover transition-transform duration-300 group-hover:scale-110' 
//       />

//         <div className='absolute inset-0 group-hover:bg-opacity-20 transition-all duration-300'></div>
//       </div>
//       <div className='p-4'>
//         <Link to={`/product/${product._id}`}>
//           <h2 className='text-lg font-semibold mb-2'>{product.name}</h2>
//           <p className='text-gray-600 mb-4'>₹{product.price}</p>
//         </Link>
//         <div className="flex items-center gap-2">
//           <button 
//             onClick={handleAddToCart}
//             disabled={isAdding} 
//             className={`flex-1 py-2 px-4 rounded transition-all duration-300 flex items-center justify-center gap-2
//               ${isAdding 
//                 ? 'bg-green-500 text-white cursor-not-allowed' 
//                 : 'bg-[#B22222] text-white hover:bg-red-600'}`}
//           >
//             {isAdding ? 'Added!' : 'Add to Cart'}
//           </button>
//           {getItemQuantity(product._id) > 0 && (
//             <div className="bg-[#B22222] text-white px-3 py-2 rounded-full min-w-[32px] text-center">
//               {getItemQuantity(product._id)}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   )
// }

// export default ProductCard


import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { useAuth } from '../components/Auth/AuthContext';

const ProductCard = ({ product }) => {
  const { cartItems } = useContext(ShopContext);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const getItemQuantity = (productId) => {
    return cartItems[productId] || 0;
  };

  const handleViewProduct = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/product/${product._id}`);
  };

  const isNewProduct = (date) => {
    if (!date) return false;
    const productDate = new Date(date);
    const currentDate = new Date();
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
        <Link to={`/product/${product._id}`}>
          <h2 className='text-lg font-semibold mb-2'>{product.name}</h2>
          <p className='text-gray-600 mb-4'>₹{product.price}</p>
        </Link>
        <div className="flex items-center gap-2">
          <button 
              onClick={handleViewProduct}
              className='flex-1 py-2 px-4 rounded bg-[#B22222] text-white hover:bg-red-700 transition-all duration-300'
            >
              View the Product
            </button>

          {getItemQuantity(product._id) > 0 && (
            <div className="bg-[#B22222] text-white px-3 py-2 rounded-full min-w-[32px] text-center">
              {getItemQuantity(product._id)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
