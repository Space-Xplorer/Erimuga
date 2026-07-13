// src/components/Admin/ProductCard1.jsx
import React, { useState } from "react";
import axios from "../../config/axios";
import { useNavigate } from "react-router-dom";
import { getProductThumbnail } from "../../utils/productImage";
import { useConfirmDialog } from "../ConfirmDialog";

const ProductCard1 = ({ product, onProductDeleted, onProductEdited }) => {
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);
  const { confirm, dialog } = useConfirmDialog();

  if (!product) return null;

  const totalStock = (product.variants || []).reduce((sum, v) => sum + (v.stock || 0), 0);
  const stockLabel =
    totalStock === 0 ? 'Out of stock' : totalStock <= 5 ? `Low stock: ${totalStock}` : `In stock: ${totalStock}`;
  const stockClass =
    totalStock === 0 ? 'bg-red-100 text-red-700' : totalStock <= 5 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700';

  const handleEdit = () => {
    // Redirect to edit form page, or open modal
    navigate(`/admin/edit-product/${product._id}`);
    if (onProductEdited) onProductEdited(product);
  };

  const handleDelete = async () => {
    const ok = await confirm(`Delete "${product.name}"? This cannot be undone.`, { confirmLabel: 'Delete' });
    if (!ok) return;

    setDeleting(true);
    try {
      await axios.delete(`/admin/delete-product/${product._id}`);
      if (onProductDeleted) onProductDeleted(product._id);
    } catch (err) {
      console.error('Error deleting product:', err);
      setDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:scale-105">
      <div className="relative">
        <img
          src={getProductThumbnail(product)}
          alt={product.name || "Product"}
          className="w-full h-60 object-cover"
        />
        <span className={`absolute top-2 right-2 text-xs font-semibold px-2 py-1 rounded-full ${stockClass}`}>
          {stockLabel}
        </span>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h2 className="text-lg font-semibold">{product.name}</h2>
          {product.isBestSeller === 'yes' && (
            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium shrink-0">★ Best Seller</span>
          )}
        </div>
        <p className="text-gray-600 mb-1">₹{product.price}</p>
        <p className="text-xs text-gray-400 mb-4">{product.soldCount || 0} sold</p>

        <div className="flex gap-2">
          <button
            onClick={handleEdit}
            disabled={deleting}
            className="flex-1 py-2 px-4 rounded bg-blue-600 text-white hover:bg-blue-700 transition-all duration-300 disabled:opacity-50"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 py-2 px-4 rounded bg-red-600 text-white hover:bg-red-700 transition-all duration-300 disabled:opacity-50"
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
      {dialog}
    </div>
  );
};

export default ProductCard1;
