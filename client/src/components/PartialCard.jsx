import React from 'react'
import { Link } from 'react-router-dom';

const PartialCard = ({ product }) => {
  return (
    <Link to={`/product/${product._id}`} className="block">
      <div className="bg-white rounded shadow-lg overflow-hidden border-2 border-[#FFD700]/40 hover:scale-105 ease-in-out hover:shadow-2xl transition-transform duration-300 group relative">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-48 object-cover group-hover:opacity-90" 
          loading="lazy"
        />
          
      </div>
    </Link>
  )
}

export default PartialCard
