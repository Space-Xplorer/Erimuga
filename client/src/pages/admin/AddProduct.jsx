import { useEffect, useState } from "react";
import axios from "../../config/axios";
import {useNavigate} from "react-router-dom";

export default function AddProductForm() {
  const navigate = useNavigate();
  const [meta, setMeta] = useState({
    categories: [],
    apparelTypes: [],
    subcategories: []
  });
  const [imagePreviews, setImagePreviews] = useState([]);


  const [formData, setFormData] = useState({
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

  const [showNew, setShowNew] = useState({
    category: false,
    apparelType: false,
    subcategory: false
  });

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

  useEffect(() => {
    fetchMetadata();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "checkbox") {
      setFormData({ ...formData, [name]: checked });
    } else if (type === "file") {
      const selectedFiles = Array.from(files);
      setFormData({ ...formData, images: selectedFiles });

      const previews = selectedFiles.map((file) => URL.createObjectURL(file));
      setImagePreviews(previews);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const removeImage = (index) => {
    const updatedImages = formData.images.filter((_, i) => i !== index);
    const updatedPreviews = imagePreviews.filter((_, i) => i !== index);

    setFormData({ ...formData, images: updatedImages });
    setImagePreviews(updatedPreviews);
  };


  const toggleNewField = (field) => {
    setShowNew({ ...showNew, [field]: !showNew[field] });
    setFormData({ ...formData, [field]: "" });
  };

  const handleAddNewMeta = async (field, url) => {
    if (!formData[field]) {
      alert(`Please enter a ${field}`);
      return;
    }

    try {
      await axios.post(`http://localhost:5000/metadata/${url}`, {
        name: formData[field]
      });
      alert(`${field} added!`);
      setShowNew({ ...showNew, [field]: false });
      fetchMetadata();
    } catch (err) {
      console.error(err);
      alert(`Failed to add ${field}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const promises = [];

      if (
        formData.category &&
        !meta.categories.includes(formData.category)
      ) {
        promises.push(
          axios.post("http://localhost:5000/metadata/category", {
            name: formData.category
          })
        );
      }

      if (
        formData.apparelType &&
        !meta.apparelTypes.includes(formData.apparelType)
      ) {
        promises.push(
          axios.post("http://localhost:5000/metadata/apparelType", {
            name: formData.apparelType
          })
        );
      }

      if (
        formData.subcategory &&
        !meta.subcategories.includes(formData.subcategory)
      ) {
        promises.push(
          axios.post("http://localhost:5000/metadata/subcategory", {
            name: formData.subcategory
          })
        );
      }

      await Promise.all(promises);
      await fetchMetadata();

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

      await axios.post("http://localhost:5000/admin/add-product", data, {
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
    navigate("/");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl mx-auto p-6 bg-white rounded-2xl shadow-md space-y-4"
    >
      <h2 className="text-2xl font-bold text-gray-800">Add Product</h2>

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
              onClick={() => handleAddNewMeta("category", "category")}
              className="text-sm text-green-600 underline"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => toggleNewField("category")}
              className="text-sm text-gray-600 underline"
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
              onClick={() => toggleNewField("category")}
              className="text-sm text-gray-600 underline"
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
              onClick={() =>
                handleAddNewMeta("apparelType", "apparelType")
              }
              className="text-sm text-green-600 underline"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => toggleNewField("apparelType")}
              className="text-sm text-gray-600 underline"
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
              onClick={() => toggleNewField("apparelType")}
              className="text-sm text-gray-600 underline"
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
              onClick={() =>
                handleAddNewMeta("subcategory", "subcategory")
              }
              className="text-sm text-green-600 underline"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => toggleNewField("subcategory")}
              className="text-sm text-gray-600 underline"
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
              onClick={() => toggleNewField("subcategory")}
              className="text-sm text-gray-600 underline"
            >
              + Add New
            </button>
          </div>
        )}
      </div>

      {/* PRICE */}
      <input
        type="number"
        name="price"
        placeholder="Price"
        value={formData.price}
        onChange={handleChange}
        className="w-full border border-gray-300 rounded-xl p-3"
      />

      {/* SIZES */}
      <input
        type="text"
        name="availableSizes"
        placeholder="Sizes (e.g., S,M,L)"
        value={formData.availableSizes}
        onChange={handleChange}
        className="w-full border border-gray-300 rounded-xl p-3"
      />

      {/* COLORS */}
      <input
        type="text"
        name="availableColors"
        placeholder="Colors (e.g., Black,Blue)"
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

      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          name="isBestSeller"
          checked={formData.isBestSeller}
          onChange={handleChange}
        />
        <span className="text-sm text-gray-700">Mark as Best Seller</span>
      </label>

      <div>
        <label className="block text-sm font-medium mb-1">Product Images</label>
        <div className="flex flex-col gap-3">
          {/* Browse Button */}
          <input
            id="imageUpload"
            type="file"
            name="images"
            multiple
            accept="image/*"
            onChange={handleChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => document.getElementById("imageUpload").click()}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 text-sm font-medium"
          >
            📁 Browse Images
          </button>

          {/* Image Previews */}
          {imagePreviews.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {imagePreviews.map((src, index) => (
                <div key={index} className="relative group">
                  <img
                    src={src}
                    alt={`Preview ${index + 1}`}
                    className="w-24 h-24 object-cover rounded-lg border"
                  />
                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-80 hover:opacity-100"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>




      <button
        type="submit"
        className="w-full bg-black text-white rounded-xl px-4 py-2 hover:bg-gray-800"
      >
        Add Product
      </button>
    </form>
  );
}
