import React, { useState } from "react";
import { useAuth } from "../../components/Auth/AuthContext";

const AddressManager = () => {
  const { user, updateUser } = useAuth();
  const [newAddress, setNewAddress] = useState({
    street: "",
    city: "",
    state: "",
    zip: "",
  });

  const [editIndex, setEditIndex] = useState(null);
  const [editAddress, setEditAddress] = useState({
    street: "",
    city: "",
    state: "",
    zip: "",
  });

  // ✅ Add address
  const handleAddAddress = () => {
    if (!newAddress.street || !newAddress.city) {
      alert("Street and City are required!");
      return;
    }
    const updatedAddresses = [...(user?.addresses || []), newAddress];
    updateUser({ ...user, addresses: updatedAddresses });
    setNewAddress({ street: "", city: "", state: "", zip: "" });
  };

  // ✅ Delete address
  const handleDeleteAddress = (index) => {
    const updatedAddresses = (user?.addresses || []).filter((_, i) => i !== index);
    updateUser({ ...user, addresses: updatedAddresses });
  };

  // ✅ Edit address
  const handleEditAddress = (index) => {
    setEditIndex(index);
    setEditAddress(user.addresses[index]);
  };

  // ✅ Save updated address
  const handleUpdateAddress = () => {
    const updatedAddresses = [...(user?.addresses || [])];
    updatedAddresses[editIndex] = editAddress;
    updateUser({ ...user, addresses: updatedAddresses });
    setEditIndex(null);
    setEditAddress({ street: "", city: "", state: "", zip: "" });
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="w-full bg-white">
      {/* <h2 className="text-2xl font-bold mb-6 text-center text-[#b22222]">
        Manage Addresses
      </h2> */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Saved Addresses - Left Column */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Saved Addresses</h3>
          {user?.addresses?.length > 0 ? (
            <div className="space-y-3">
              {user.addresses.map((address, index) => (
                <div
                  key={index}
                  className="p-4 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  {editIndex === index ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        name="street"
                        value={editAddress.street}
                        onChange={handleEditInputChange}
                        placeholder="Street"
                        className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-[#b22222] focus:border-[#b22222] transition-colors"
                      />
                      <input
                        type="text"
                        name="city"
                        value={editAddress.city}
                        onChange={handleEditInputChange}
                        placeholder="City"
                        className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-[#b22222] focus:border-[#b22222] transition-colors"
                      />
                      <input
                        type="text"
                        name="state"
                        value={editAddress.state}
                        onChange={handleEditInputChange}
                        placeholder="State"
                        className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-[#b22222] focus:border-[#b22222] transition-colors"
                      />
                      <input
                        type="text"
                        name="zip"
                        value={editAddress.zip}
                        onChange={handleEditInputChange}
                        placeholder="ZIP"
                        className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-[#b22222] focus:border-[#b22222] transition-colors"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleUpdateAddress}
                          className="flex-1 bg-[#b22222] hover:bg-[#a11c1c] text-white px-4 py-2 rounded-lg transition-colors font-medium"
                        >
                          Save Changes
                        </button>
                        <button
                          onClick={() => setEditIndex(null)}
                          className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-start">
                      <div className="text-gray-700 leading-relaxed">
                        <div className="font-medium">{address?.street}</div>
                        <div className="text-sm text-gray-600">
                          {address?.city}, {address?.state} - {address?.zip}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleEditAddress(index)}
                          className="bg-[#b22222] hover:bg-[#a11c1c] text-white px-3 py-1 rounded-lg transition-colors text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteAddress(index)}
                          className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded-lg transition-colors text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">📍</div>
              <p className="italic">No addresses added yet.</p>
            </div>
          )}
        </div>

        {/* Add New Address - Right Column */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Add New Address</h3>
          <div className="space-y-4 p-6 bg-gray-50 rounded-lg border border-gray-200">
            <input
              type="text"
              name="street"
              value={newAddress.street}
              onChange={(e) =>
                setNewAddress({ ...newAddress, street: e.target.value })
              }
              placeholder="Street"
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-[#b22222] focus:border-[#b22222] transition-colors"
            />
            <input
              type="text"
              name="city"
              value={newAddress.city}
              onChange={(e) =>
                setNewAddress({ ...newAddress, city: e.target.value })
              }
              placeholder="City"
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-[#b22222] focus:border-[#b22222] transition-colors"
            />
            <input
              type="text"
              name="state"
              value={newAddress.state}
              onChange={(e) =>
                setNewAddress({ ...newAddress, state: e.target.value })
              }
              placeholder="State"
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-[#b22222] focus:border-[#b22222] transition-colors"
            />
            <input
              type="text"
              name="zip"
              value={newAddress.zip}
              onChange={(e) =>
                setNewAddress({ ...newAddress, zip: e.target.value })
              }
              placeholder="ZIP"
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-[#b22222] focus:border-[#b22222] transition-colors"
            />
            <button
              onClick={handleAddAddress}
              className="w-full bg-[#b22222] hover:bg-[#a11c1c] text-white px-4 py-3 rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
            >
              ➕ Add Address
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressManager;
