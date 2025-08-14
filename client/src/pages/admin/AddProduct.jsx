import { useEffect, useState, useCallback } from "react";
import axios from "../../config/axios";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";

// --- UI COMPONENTS (Helper components for a cleaner look) ---

const FormSection = ({ title, children }) => (
  <div className="space-y-4 rounded-lg border border-gray-200 p-4 shadow-sm">
    <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
    {children}
  </div>
);

const Input = (props) => (
  <input
    {...props}
    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
  />
);

// --- MAIN COMPONENT ---

export default function AddProductForm() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // This state is for the category, apparel type, etc., dropdowns
  const [meta, setMeta] = useState({
    categories: [],
    apparelTypes: [],
    subcategories: [],
  });

  const [formData, setFormData] = useState({
    name: "",
    mainCategory: "",
    apparelType: "",
    subcategory: "",
    price: "",
    availableSizes: "",
    availableColors: "",
    description: "",
    isBestSeller: false,
    images: [], // This will now store objects like { file, preview }
  });

  // Fetch metadata for dropdowns when the component loads
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const res = await axios.get("/metadata");
        if (res.data) {
          setMeta({
            categories: res.data.categories || [],
            apparelTypes: res.data.apparelTypes || [],
            subcategories: res.data.subcategories || [],
          });
        }
      } catch (error) {
        console.error("Error fetching metadata:", error);
      }
    };
    fetchMetadata();
  }, []);

  // Clean up the image preview URLs when the component is unmounted to prevent memory leaks
  useEffect(() => {
    return () => formData.images.forEach(img => URL.revokeObjectURL(img.preview));
  }, [formData.images]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  
  // --- IMAGE UPLOAD & PREVIEW LOGIC ---

  const onDrop = useCallback((acceptedFiles) => {
    // Create a preview URL for each accepted file
    const newImages = acceptedFiles.map(file => Object.assign(file, {
      preview: URL.createObjectURL(file)
    }));
    // Append the new images to the existing ones
    setFormData(prev => ({ ...prev, images: [...prev.images, ...newImages] }));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.png', '.gif', '.webp'] }
  });

  const removeImage = (indexToRemove) => {
    // First, free up the memory by revoking the object URL
    URL.revokeObjectURL(formData.images[indexToRemove].preview);
    // Then, update the state to remove the image from the array
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove)
    }));
  };

  // This is the JSX for displaying the image thumbnails
  const imagePreviews = (
    <div className="mt-4 grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
      {formData.images.map((img, index) => (
        <div key={index} className="relative aspect-square rounded-md shadow-md">
          <img src={img.preview} alt={`preview ${index}`} className="h-full w-full rounded-md object-cover" />
          <button
            type="button"
            onClick={() => removeImage(index)}
            className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white transition-transform hover:scale-110"
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  );

  // --- FORM SUBMISSION LOGIC ---

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const data = new FormData();
      // Append all text data
      data.append("name", formData.name);
      data.append("mainCategory", formData.mainCategory); // Note: Your backend expects 'mainCategory', not 'category'
      data.append("apparelType", formData.apparelType);
      data.append("subcategory", formData.subcategory);
      data.append("price", formData.price);
      data.append("availableSizes", formData.availableSizes);
      data.append("availableColors", formData.availableColors);
      data.append("description", formData.description);
      data.append("isBestSeller", formData.isBestSeller ? "yes" : "no");
      
      // Correctly append each image file
      formData.images.forEach(imageObject => {
        data.append("images", imageObject); // Append the file object itself
      });

      await axios.post("/admin/add-product", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Product added successfully!");
      navigate("/admin/products"); // Or wherever you want to redirect after success
    } catch (err) {
      console.error("Error adding product:", err);
      alert("Error adding product. Please check the console for details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 p-4 sm:p-8">
      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-4xl space-y-8 rounded-lg bg-white p-6 shadow-lg"
      >
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
            <h2 className="text-3xl font-bold text-gray-900">Add New Product</h2>
            <button
                type="button"
                onClick={() => navigate(-1)} // Go back button
                className="text-sm font-medium text-gray-600 hover:text-indigo-600"
            >
                Cancel
            </button>
        </div>
       
        <FormSection title="Product Details">
            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Product Name</label>
                <Input name="name" value={formData.name} onChange={handleChange} placeholder="e.g., Classic Cotton Tee" required />
            </div>
            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Price ($)</label>
                <Input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="e.g., 29.99" required />
            </div>
             <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  name="description"
                  placeholder="Detailed product description..."
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
            </div>
        </FormSection>

        <FormSection title="Categorization">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Main Category</label>
                    <select name="mainCategory" value={formData.mainCategory} onChange={handleChange} required className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                        <option value="">Select Category</option>
                        {meta.categories.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
                    </select>
                </div>
                 <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Apparel Type</label>
                     <select name="apparelType" value={formData.apparelType} onChange={handleChange} required className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                        <option value="">Select Type</option>
                        {meta.apparelTypes.map((type) => (<option key={type} value={type}>{type}</option>))}
                    </select>
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Subcategory</label>
                    <select name="subcategory" value={formData.subcategory} onChange={handleChange} required className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                        <option value="">Select Subcategory</option>
                        {meta.subcategories.map((sub) => (<option key={sub} value={sub}>{sub}</option>))}
                    </select>
                </div>
            </div>
        </FormSection>

        <FormSection title="Images">
            <div {...getRootProps()} className={`cursor-pointer rounded-lg border-2 border-dashed p-10 text-center ${isDragActive ? 'border-indigo-600 bg-indigo-50' : 'border-gray-300'}`}>
                <input {...getInputProps()} />
                <p className="text-gray-500">Drag & drop files here, or click to select files</p>
            </div>
            {formData.images.length > 0 && imagePreviews}
        </FormSection>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-400"
          >
            {isSubmitting ? 'Submitting...' : 'Add Product'}
          </button>
        </div>
      </form>
    </div>
  );
}