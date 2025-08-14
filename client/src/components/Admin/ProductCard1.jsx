// src/components/Admin/ProductCard1.jsx
import React from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ProductCard1 = ({ product, onProductDeleted, onProductEdited }) => {
  const navigate = useNavigate();

  if (!product) return null;

  const handleEdit = () => {
    // Redirect to edit form page, or open modal
    navigate(`/admin/edit-product/${product._id}`);
    if (onProductEdited) onProductEdited(product);
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      await axios.delete(
        `http://localhost:5000/admin/delete-product/${product._id}`
      );
      if (onProductDeleted) onProductDeleted(product._id);
    } catch (err) {
      console.error("Error deleting product:", err);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:scale-105">
      <div className="relative">
        <img
          src={
            product.image && product.image[0]
              ? product.image[0]
              : "/placeholder.jpg"
          }
          alt={product.name || "Product"}
          className="w-full h-60 object-cover"
        />
      </div>

      <div className="p-4">
        <h2 className="text-lg font-semibold mb-2">{product.name}</h2>
        <p className="text-gray-600 mb-4">₹{product.price}</p>

        <div className="flex gap-2">
          <button
            onClick={handleEdit}
            className="flex-1 py-2 px-4 rounded bg-blue-600 text-white hover:bg-blue-700 transition-all duration-300"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="flex-1 py-2 px-4 rounded bg-red-600 text-white hover:bg-red-700 transition-all duration-300"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard1;
