import React, { useState, useEffect } from "react";
import axios from "axios";
import ProductCard1 from "../../components/Admin/ProductCard1";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all products from backend
  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/admin/products`);
      setProducts(res.data);
    } catch (err) {
      setError("Failed to fetch products");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Remove product from state after delete
  const handleProductDeleted = (deletedId) => {
    setProducts((prev) => prev.filter((p) => p._id !== deletedId));
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-3xl font-bold mb-6">📦 Manage Products</h1>

      {loading && (
        <div className="text-center py-20 text-gray-500 animate-pulse">
          Loading products...
        </div>
      )}

      {error && (
        <div className="text-center py-20 text-red-600">Error: {error}</div>
      )}

      {!loading && !error && products.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          No products found.
        </div>
      )}

      {/* Products Grid */}
      {!loading && !error && products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard1
              key={product._id}
              product={product}
              onProductDeleted={handleProductDeleted}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
