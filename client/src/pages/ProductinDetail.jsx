// import React, { useEffect, useState, useContext } from "react";
// import { useParams } from "react-router-dom";
// import axios from "axios";
// import { useAuth } from "../components/Auth/AuthContext";
// import { ShopContext } from "../context/ShopContext";

// const ProductinDetail = () => {
//   const { id } = useParams();
//   const { isAuthenticated, user } = useAuth();
//   const { addToCart } = useContext(ShopContext);

//   const [product, setProduct] = useState(null);
//   const [selectedSize, setSelectedSize] = useState("");
//   const [selectedColor, setSelectedColor] = useState("");
//   const [quantity, setQuantity] = useState(1);

//   useEffect(() => {
//     const fetchProduct = async () => {
//       try {
//         const res = await axios.get(`http://localhost:5000/products/${id}`);
//         setProduct(res.data);
//       } catch (error) {
//         console.error("Failed to fetch product:", error);
//       }
//     };
//     fetchProduct();
//   }, [id]);

// const handleAddToCart = () => {
//   if (!selectedSize || !selectedColor) {
//     alert("Please select both size and color");
//     return;
//   }

//   addToCart(product, quantity,selectedSize, selectedColor);
// };


//   if (!product) return <div className="p-8 text-center text-gray-500">Loading...</div>;

//   return (
//     <div className="max-w-6xl mx-auto px-6 py-10">
//       <div className="grid md:grid-cols-2 gap-10">
//         {/* Product Image */}
//         <div className="bg-gray-100 rounded-xl p-4 flex items-center justify-center">
//           {product.images?.length > 0 ? (
//             <img
//               src={product.images[0]}
//               alt={product.name}
//               className="w-full max-h-[500px] object-contain rounded-lg"
//             />
//           ) : (
//             <div className="text-center text-gray-400 text-sm">No image available</div>
//           )}
//         </div>

//         {/* Product Details */}
//         <div className="flex flex-col gap-4">
//           <h1 className="text-3xl font-bold text-gray-800">{product.name}</h1>
//           <p className="text-gray-600">{product.description}</p>
//           <p className="text-2xl font-semibold text-indigo-600">₹{product.price}</p>

//           {/* Size Selector */}
//           {product.availableSizes?.length > 0 && (
//             <div>
//               <label className="block mb-1 font-medium text-gray-700">Select Size</label>
//               <select
//                 value={selectedSize}
//                 onChange={(e) => setSelectedSize(e.target.value)}
//                 className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
//               >
//                 <option value="">-- Choose Size --</option>
//                 {product.availableSizes.map((size) => (
//                   <option key={size} value={size}>
//                     {size}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           )}

//           {/* Color Selector */}
//           {product.availableColors?.length > 0 && (
//             <div>
//               <label className="block mb-1 font-medium text-gray-700">Select Color</label>
//               <select
//                 value={selectedColor}
//                 onChange={(e) => setSelectedColor(e.target.value)}
//                 className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
//               >
//                 <option value="">-- Choose Color --</option>
//                 {product.availableColors.map((color) => (
//                   <option key={color} value={color}>
//                     {color}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           )}

//           {/* Add to Cart Button */}
//           <button
//             onClick={handleAddToCart}
//             className="mt-4 bg-indigo-600 text-white font-medium py-2 px-6 rounded-xl hover:bg-indigo-700 transition duration-200"
//           >
//             Add to Cart
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProductinDetail;



import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../components/Auth/AuthContext";
import { ShopContext } from "../context/ShopContext";

const ProductinDetail = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const { addToCart } = useContext(ShopContext);

  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/products/${id}`);
        setProduct(res.data);
      } catch (error) {
        console.error("Failed to fetch product:", error);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      alert("Please select both size and color");
      return;
    }

    addToCart(product, quantity, selectedSize, selectedColor);
  };

  if (!product) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="grid md:grid-cols-2 gap-10">
        {/* Product Image */}
        <div className="bg-gray-100 rounded-xl p-4 flex items-center justify-center">
          {product.images?.length > 0 ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full max-h-[500px] object-contain rounded-lg"
            />
          ) : (
            <div className="text-center text-gray-400 text-sm">No image available</div>
          )}
        </div>

        {/* Product Details */}
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold text-gray-800">{product.name}</h1>
          <p className="text-gray-600">{product.description}</p>
          <p className="text-2xl font-semibold text-[#B22222]">₹{product.price}</p>

          {/* Color Selector */}
          {product.availableColors?.length > 0 && (
            <div className="mt-2">
              <label className="block mb-1 font-medium text-gray-700">COLOR</label>
              <div className="flex items-center gap-4 mt-2">
                {product.availableColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-10 h-10 rounded-full shadow border-2
                      ${selectedColor === color ? 'border-[#B22222]' : 'border-transparent'}
                      transition duration-200`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Size Selector */}
          {product.availableSizes?.length > 0 && (
            <div className="mt-4">
              <label className="block mb-1 font-medium text-gray-700">SELECT SIZE</label>
              <div className="flex flex-wrap gap-3 mt-2">
                {product.availableSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 border rounded-full
                      ${selectedSize === size
                        ? 'bg-[#B22222] text-white border-[#B22222]'
                        : 'bg-white text-gray-800 border-gray-300'}
                      hover:border-[#B22222] transition`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            className="mt-6 bg-[#B22222] text-white font-medium py-2 px-6 rounded-xl hover:bg-red-700 transition duration-200"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductinDetail;
