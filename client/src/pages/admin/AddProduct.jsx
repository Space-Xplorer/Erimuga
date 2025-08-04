import { useEffect, useState } from "react";
import axios from "../../config/axios";

export default function AddProductForm() {
  const [meta, setMeta] = useState({
    categories: [],
    apparelTypes: [],
    subcategories: []
  });

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    apparelType: "",
    subcategory: "",
    price: "",
    availableSizes: "",
    availableColors: "",
    isBestSeller: false,
    images: []
  });

  const [showNew, setShowNew] = useState({
    category: false,
    apparelType: false,
    subcategory: false
  });

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const res = await axios.get("http://localhost:5000/metadata");
        if (res.data) {
          setMeta({
            categories: res.data.categories || [],
            apparelTypes: res.data.apparelTypes || [],
            subcategories: res.data.subcategories || []
          });
        }
      } catch (error) {
        console.error("Error fetching metadata:", error);
        setMeta({ categories: [], apparelTypes: [], subcategories: [] });
      }
    };
    fetchMetadata();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") {
      setFormData({ ...formData, [name]: checked });
    } else if (type === "file") {
      setFormData({ ...formData, images: files });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const toggleNewField = (field) => {
    setShowNew({ ...showNew, [field]: !showNew[field] });
    setFormData({ ...formData, [field]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();

    data.append("name", formData.name);
    data.append("mainCategory", formData.category);
    data.append("apparelType", formData.apparelType);
    data.append("subcategory", formData.subcategory);
    data.append("price", formData.price);
    data.append("availableSizes", formData.availableSizes);
    data.append("availableColors", formData.availableColors);
    data.append("description", formData.description);
    data.append("isBestSeller", formData.isBestSeller ? "yes" : "no");

    for (let i = 0; i < formData.images.length; i++) {
      data.append("images", formData.images[i]);
    }

    try {
      const res = await axios.post("http://localhost:5000/admin/add-product", data, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      alert("Product added successfully!");
      setFormData({
        name: "",
        category: "",
        apparelType: "",
        subcategory: "",
        price: "",
        availableSizes: "",
        availableColors: "",
        description: "",
        isBestSeller: false,
        images: []
      });
    } catch (err) {
      console.error("Error adding product:", err);
      alert("Error adding product");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl mx-auto p-6 bg-white rounded-2xl shadow-md space-y-4"
    >
      <h2 className="text-2xl font-bold text-gray-800">Add Product</h2>

      {/* Product Name */}
      <input
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Product Name"
        className="w-full border border-gray-300 rounded-xl p-3"
      />

      {/* Category */}
      <div>
        <label className="block text-sm font-medium mb-1">Category</label>
        {showNew.category ? (
          <div className="flex gap-2">
            <input
              type="text"
              name="category"
              placeholder="New category"
              value={formData.category}
              onChange={handleChange}
              className="flex-1 border border-gray-300 rounded-xl p-2"
            />
            <button
              type="button"
              className="text-sm text-gray-600 underline"
              onClick={() => toggleNewField("category")}
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="flex-1 border border-gray-300 rounded-xl p-2"
            >
              <option value="">Select Category</option>
              {meta.categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="text-sm text-gray-600 underline"
              onClick={() => toggleNewField("category")}
            >
              + Add New
            </button>
          </div>
        )}
      </div>

      {/* Apparel Type */}
      <div>
        <label className="block text-sm font-medium mb-1">Apparel Type</label>
        {showNew.apparelType ? (
          <div className="flex gap-2">
            <input
              type="text"
              name="apparelType"
              placeholder="New apparel type"
              value={formData.apparelType}
              onChange={handleChange}
              className="flex-1 border border-gray-300 rounded-xl p-2"
            />
            <button
              type="button"
              className="text-sm text-gray-600 underline"
              onClick={() => toggleNewField("apparelType")}
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <select
              name="apparelType"
              value={formData.apparelType}
              onChange={handleChange}
              className="flex-1 border border-gray-300 rounded-xl p-2"
            >
              <option value="">Select Apparel Type</option>
              {meta.apparelTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="text-sm text-gray-600 underline"
              onClick={() => toggleNewField("apparelType")}
            >
              + Add New
            </button>
          </div>
        )}
      </div>

      {/* Subcategory */}
      <div>
        <label className="block text-sm font-medium mb-1">Subcategory</label>
        {showNew.subcategory ? (
          <div className="flex gap-2">
            <input
              type="text"
              name="subcategory"
              placeholder="New subcategory"
              value={formData.subcategory}
              onChange={handleChange}
              className="flex-1 border border-gray-300 rounded-xl p-2"
            />
            <button
              type="button"
              className="text-sm text-gray-600 underline"
              onClick={() => toggleNewField("subcategory")}
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <select
              name="subcategory"
              value={formData.subcategory}
              onChange={handleChange}
              className="flex-1 border border-gray-300 rounded-xl p-2"
            >
              <option value="">Select Subcategory</option>
              {meta.subcategories.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="text-sm text-gray-600 underline"
              onClick={() => toggleNewField("subcategory")}
            >
              + Add New
            </button>
          </div>
        )}
      </div>

      {/* Price */}
      <input
        type="number"
        name="price"
        placeholder="Price"
        value={formData.price}
        onChange={handleChange}
        className="w-full border border-gray-300 rounded-xl p-3"
      />

      {/* Sizes */}
      <input
        type="text"
        name="availableSizes"
        placeholder="Sizes (comma separated e.g. S,M,L)"
        value={formData.availableSizes}
        onChange={handleChange}
        className="w-full border border-gray-300 rounded-xl p-3"
      />

      {/* Colors */}
      <input
        type="text"
        name="availableColors"
        placeholder="Colors (comma separated e.g. Black,Blue)"
        value={formData.availableColors}
        onChange={handleChange}
        className="w-full border border-gray-300 rounded-xl p-3"
      />

      <textarea
        name="description"
        placeholder="Product Description"
        value={formData.description}
        onChange={handleChange}
        rows={4}
        className="w-full border border-gray-300 rounded-xl p-3"
      />

      {/* Best Seller Toggle */}
      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          name="isBestSeller"
          checked={formData.isBestSeller}
          onChange={handleChange}
        />
        <span className="text-sm text-gray-700">Mark as Best Seller</span>
      </label>

      {/* Image Upload */}
      <input
        type="file"
        name="images"
        multiple
        accept="image/*"
        onChange={handleChange}
        className="w-full"
      />

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full bg-black text-white rounded-xl px-4 py-2 hover:bg-gray-800"
      >
        Add Product
      </button>
    </form>
  );
}
