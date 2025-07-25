import React, { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';

const Product = () => {
  const { products } = useContext(ShopContext);

  console.log("Products in context", products);

  if (!Array.isArray(products)) {
    return <p>Loading or error in fetching products...</p>;
  }

  return (
    <div>
      {products.map((product, index) => (
        <div key={index} className="border p-4 m-2">
          <h2>{product.name}</h2>
          <p>₹{product.price}</p>
        </div>
      ))}
    </div>
  );
};

export default Product;
