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

  const [isAdding, setIsAdding] = useState(false);
  const [addedMessage, setAddedMessage] = useState(false);

  const [mainImage, setMainImage] = useState(""); // NEW — For switching between images

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/products/${id}`);
        setProduct(res.data);

        // Set first image as main display if available
        if (res.data.image && res.data.image.length > 0) {
          setMainImage(res.data.image[0]);
        }
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

    setIsAdding(true);
    setAddedMessage(true);

    addToCart(product, quantity, selectedSize, selectedColor);

    setTimeout(() => {
      setIsAdding(false);
      setAddedMessage(false);
    }, 2000);
  };

  if (!product) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="grid md:grid-cols-2 gap-10">
        {/* Product Images Section */}
        <div className="flex flex-col items-center">
          <div className="bg-gray-100 rounded-xl p-4 flex items-center justify-center w-full">
            {mainImage ? (
              <img
                src={mainImage}
                alt={product.name}
                className="w-full max-h-[500px] object-contain rounded-lg"
              />
            ) : (
              <div className="text-center text-gray-400 text-sm">No image available</div>
            )}
          </div>

          {/* Thumbnails */}
          {product.image?.length > 1 && (
            <div className="flex gap-3 mt-4 flex-wrap justify-center">
              {product.image.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  className={`w-20 h-20 object-cover rounded-lg border cursor-pointer transition
                    ${mainImage === img ? "border-[#B22222] border-2" : "border-gray-300"}`}
                  onClick={() => setMainImage(img)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold text-gray-800">{product.name}</h1>

          {/* Product Description */}
          <div className="mt-2">
            <h2 className="text-lg font-semibold text-gray-700">Description:</h2>
            <p className="text-gray-600 mt-1 whitespace-pre-line">{product.description}</p>
          </div>

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

          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            disabled={isAdding}
            className={`
              mt-6 flex items-center justify-center gap-2 px-6 py-2 rounded-xl text-white font-medium transition-all duration-200 
              ${isAdding ? 'bg-green-600 cursor-not-allowed' : 'bg-[#B22222] hover:bg-red-700 scale-105'}
            `}
          >
            🛒 {addedMessage ? "Added!" : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductinDetail;
