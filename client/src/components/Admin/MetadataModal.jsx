// components/Admin/MetadataModal.jsx
import React, { useState } from 'react';
import axios from 'axios';

const MetadataModal = ({ isOpen, onClose }) => {
  const [type, setType] = useState('category');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!name) return alert('Please enter a name');

    try {
      setLoading(true);
      await axios.post(`${import.meta.env.VITE_BASE_URL}/metadata/${type}`, {
        name: name.trim(),
      });
      alert(`${type} added successfully`);
      setName('');
      setLoading(false);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to add metadata');
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">➕ Add Metadata</h2>

        <label className="block mb-2 text-sm font-medium">Type</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full border border-gray-300 rounded-xl p-2 mb-4"
        >
          <option value="category">Category</option>
          <option value="apparelType">Apparel Type</option>
          <option value="subcategory">Subcategory</option>
        </select>

        <label className="block mb-2 text-sm font-medium">Name</label>
        <input
          type="text"
          placeholder={`Enter ${type} name`}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-gray-300 rounded-xl p-3 mb-4"
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded-xl hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700"
          >
            {loading ? 'Adding...' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MetadataModal;
