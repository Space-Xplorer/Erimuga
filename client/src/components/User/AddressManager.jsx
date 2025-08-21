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
    <div className="p-6 max-w-2xl mx-auto bg-white border rounded-2xl shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center text-[#b22222]">
        Manage Addresses
      </h2>

      {/* Existing Addresses */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-3">Saved Addresses</h3>
        {user?.addresses?.length > 0 ? (
          user.addresses.map((address, index) => (
            <div
              key={index}
              className="p-4 border rounded-xl mb-3 flex justify-between items-start bg-gray-50"
            >
              {editIndex === index ? (
                <div className="flex flex-col gap-2 w-full">
                  <input
                    type="text"
                    name="street"
                    value={editAddress.street}
                    onChange={handleEditInputChange}
                    placeholder="Street"
                    className="border p-2 rounded"
                  />
                  <input
                    type="text"
                    name="city"
                    value={editAddress.city}
                    onChange={handleEditInputChange}
                    placeholder="City"
                    className="border p-2 rounded"
                  />
                  <input
                    type="text"
                    name="state"
                    value={editAddress.state}
                    onChange={handleEditInputChange}
                    placeholder="State"
                    className="border p-2 rounded"
                  />
                  <input
                    type="text"
                    name="zip"
                    value={editAddress.zip}
                    onChange={handleEditInputChange}
                    placeholder="ZIP"
                    className="border p-2 rounded"
                  />
                  <button
                    onClick={handleUpdateAddress}
                    className="bg-[#b22222] hover:bg-red-700 text-white px-3 py-2 rounded-lg mt-2 transition"
                  >
                    Save Changes
                  </button>
                </div>
              ) : (
                <>
                  <span className="text-gray-700">
                    {address?.street}, {address?.city}, {address?.state} -{" "}
                    {address?.zip}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditAddress(index)}
                      className="bg-[#b22222] hover:bg-red-700 text-white px-3 py-1 rounded-lg transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteAddress(index)}
                      className="bg-gray-600 hover:bg-gray-800 text-white px-3 py-1 rounded-lg transition"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-500 italic">No addresses added yet.</p>
        )}
      </div>

      {/* Add New Address */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Add New Address</h3>
        <div className="flex flex-col gap-3">
          <input
            type="text"
            name="street"
            value={newAddress.street}
            onChange={(e) =>
              setNewAddress({ ...newAddress, street: e.target.value })
            }
            placeholder="Street"
            className="border p-2 rounded"
          />
          <input
            type="text"
            name="city"
            value={newAddress.city}
            onChange={(e) =>
              setNewAddress({ ...newAddress, city: e.target.value })
            }
            placeholder="City"
            className="border p-2 rounded"
          />
          <input
            type="text"
            name="state"
            value={newAddress.state}
            onChange={(e) =>
              setNewAddress({ ...newAddress, state: e.target.value })
            }
            placeholder="State"
            className="border p-2 rounded"
          />
          <input
            type="text"
            name="zip"
            value={newAddress.zip}
            onChange={(e) =>
              setNewAddress({ ...newAddress, zip: e.target.value })
            }
            placeholder="ZIP"
            className="border p-2 rounded"
          />
          <button
            onClick={handleAddAddress}
            className="bg-[#b22222] hover:bg-red-700 text-white px-4 py-2 rounded-lg mt-2 transition"
          >
            ➕ Add Address
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddressManager;
