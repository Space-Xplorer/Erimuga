import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../components/Auth/AuthContext';

const AddressManager = () => {
  const { authUser, updateUser } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [editingAddress, setEditingAddress] = useState(null);
  const [newAddress, setNewAddress] = useState({
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    isDefault: false
  });

  useEffect(() => {
    if (authUser?.addresses) {
      setAddresses(authUser.addresses);
    }
  }, [authUser]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewAddress({
      ...newAddress,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleEditInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditingAddress({
      ...editingAddress,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleAddAddress = async () => {
    try {
      const response = await axios.put(
        'http://localhost:5000/users/update-address',
        { 
          userId: authUser._id,
          address: newAddress,
          action: 'add'
        },
        { withCredentials: true }
      );
      updateUser(response.data.user);
      setNewAddress({
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'India',
        isDefault: false
      });
    } catch (err) {
      console.error('Error adding address:', err);
    }
  };

  const handleUpdateAddress = async () => {
    try {
      const response = await axios.put(
        'http://localhost:5000/users/update-address',
        { 
          userId: authUser._id,
          address: editingAddress,
          action: 'update'
        },
        { withCredentials: true }
      );
      updateUser(response.data.user);
      setEditingAddress(null);
    } catch (err) {
      console.error('Error updating address:', err);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      const response = await axios.put(
        'http://localhost:5000/users/update-address',
        { 
          userId: authUser._id,
          addressId,
          action: 'delete'
        },
        { withCredentials: true }
      );
      updateUser(response.data.user);
    } catch (err) {
      console.error('Error deleting address:', err);
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      const response = await axios.put(
        'http://localhost:5000/users/update-address',
        { 
          userId: authUser._id,
          addressId,
          action: 'set-default'
        },
        { withCredentials: true }
      );
      updateUser(response.data.user);
    } catch (err) {
      console.error('Error setting default address:', err);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Manage Addresses</h3>
      
      {/* Add New Address */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium mb-3">Add New Address</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block mb-1">Street Address</label>
            <input
              type="text"
              name="street"
              value={newAddress.street}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1">City</label>
            <input
              type="text"
              name="city"
              value={newAddress.city}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1">State</label>
            <input
              type="text"
              name="state"
              value={newAddress.state}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1">Postal Code</label>
            <input
              type="text"
              name="postalCode"
              value={newAddress.postalCode}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="col-span-2 flex items-center gap-2">
            <input
              type="checkbox"
              name="isDefault"
              checked={newAddress.isDefault}
              onChange={handleInputChange}
            />
            <label>Set as default address</label>
          </div>
          <button
            onClick={handleAddAddress}
            className="col-span-2 bg-[#b22222] text-white py-2 rounded hover:bg-[#a11c1c] transition"
          >
            Save Address
          </button>
        </div>
      </div>

      {/* Saved Addresses */}
      <div className="space-y-4">
        {addresses.map((address) => (
          <div key={address._id} className="border p-4 rounded-lg">
            {editingAddress?._id === address._id ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block mb-1">Street</label>
                    <input
                      type="text"
                      name="street"
                      value={editingAddress.street}
                      onChange={handleEditInputChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">City</label>
                    <input
                      type="text"
                      name="city"
                      value={editingAddress.city}
                      onChange={handleEditInputChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">State</label>
                    <input
                      type="text"
                      name="state"
                      value={editingAddress.state}
                      onChange={handleEditInputChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Postal Code</label>
                    <input
                      type="text"
                      name="postalCode"
                      value={editingAddress.postalCode}
                      onChange={handleEditInputChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleUpdateAddress}
                    className="bg-[#b22222] text-white px-3 py-1 rounded"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingAddress(null)}
                    className="bg-gray-200 px-3 py-1 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{address.street}</p>
                    <p>{address.city}, {address.state} - {address.postalCode}</p>
                    {address.isDefault && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingAddress({...address})}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteAddress(address._id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {!address.isDefault && (
                  <button
                    onClick={() => handleSetDefault(address._id)}
                    className="mt-2 text-sm text-[#b22222] hover:underline"
                  >
                    Set as default
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AddressManager;