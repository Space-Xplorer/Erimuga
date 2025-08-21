import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import OrderCard from "../components/User/OrderCard";
import AddressManager from "../components/User/AddressManager";
import { ShopContext } from "../context/ShopContext";
import { User, Mail, Phone, MapPin, Package } from "lucide-react"; // ✅ icons

const UserDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [userDetails, setUserDetails] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
  });
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingUser, setLoadingUser] = useState(true);

  const { authUser } = useContext(ShopContext);
  const userId = authUser?._id;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/orders/user/${userId}`,
          { withCredentials: true }
        );
        setOrders(res.data);
      } catch (error) {
        console.error("Error fetching user orders:", error);
      } finally {
        setLoadingOrders(false);
      }
    };

    const fetchUserDetails = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/user/auth/${userId}`,
          { withCredentials: true }
        );
        const userData = res.data;
        setUserDetails(userData);
        setProfileData({
          name: userData.name,
          email: userData.email,
          phoneNumber: userData.phonenumber || "",
        });
      } catch (error) {
        console.error("Error fetching user details:", error);
      } finally {
        setLoadingUser(false);
      }
    };

    if (userId) {
      fetchOrders();
      fetchUserDetails();
    }
  }, [userId]);

  const handleProfileUpdate = async () => {
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/user/update-profile`,
        profileData,
        { withCredentials: true }
      );
      setUserDetails(res.data);
      setEditMode(false);
    } catch (err) {
      console.error("Profile update failed:", err);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-[#b22222] mb-8">My Account</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Section */}
        <div className="bg-white rounded-xl shadow hover:shadow-md transition p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
            <User className="w-5 h-5 text-[#b22222]" /> Profile
          </h2>

          {editMode ? (
            <div className="space-y-4">
              <div>
                <label className="block mb-1 text-sm text-gray-600">Name</label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) =>
                    setProfileData({ ...profileData, name: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm text-gray-600">Email</label>
                <input
                  type="email"
                  value={profileData.email}
                  readOnly
                  className="w-full p-2 border rounded bg-gray-100"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm text-gray-600">Phone</label>
                <input
                  type="tel"
                  value={profileData.phoneNumber}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      phoneNumber: e.target.value,
                    })
                  }
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleProfileUpdate}
                  className="flex-1 bg-[#b22222] text-white py-2 rounded-lg hover:bg-[#a11c1c] transition"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditMode(false)}
                  className="flex-1 bg-gray-200 py-2 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3 text-gray-700">
              <p>
                <span className="text-gray-500 text-sm">Name:</span>{" "}
                <span className="font-medium">{userDetails?.name || "N/A"}</span>
              </p>
              <p>
                <span className="text-gray-500 text-sm">Email:</span>{" "}
                <span className="font-medium">{userDetails?.email || "N/A"}</span>
              </p>
              <p>
                <span className="text-gray-500 text-sm">Phone:</span>{" "}
                <span className="font-medium">
                  {userDetails?.phonenumber || "N/A"}
                </span>
              </p>
              <button
                onClick={() => setEditMode(true)}
                className="mt-4 bg-[#b22222] text-white px-4 py-2 rounded-lg hover:bg-[#a11c1c] transition"
              >
                Edit Profile
              </button>
            </div>
          )}
        </div>

        {/* Address Management */}
        <div className="bg-white rounded-xl shadow hover:shadow-md transition p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
            <MapPin className="w-5 h-5 text-[#b22222]" /> Address Book
          </h2>
          <AddressManager />
        </div>

        {/* Orders Section */}
        <div className="bg-white rounded-xl shadow hover:shadow-md transition p-6 lg:col-span-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
            <Package className="w-5 h-5 text-[#b22222]" /> Order History
          </h2>
          {loadingOrders ? (
            <p className="text-gray-500">Loading orders...</p>
          ) : orders.length === 0 ? (
            <p className="text-gray-500 italic">
              You haven't placed any orders yet.
            </p>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <OrderCard key={order._id} order={order} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
