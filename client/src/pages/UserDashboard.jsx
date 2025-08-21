import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import OrderCard from "../components/User/OrderCard";
import AddressManager from "../components/User/AddressManager";
import { ShopContext } from "../context/ShopContext";
import { User, Mail, Phone, MapPin, Package } from "lucide-react";

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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-[#b22222] mb-8">My Account</h1>

        <div className="grid grid-cols-1 gap-8 mb-8">
          {/* Profile Section */}
          <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6">
            <h2 className="flex items-center gap-2 text-xl font-semibold mb-6 text-gray-800">
              <User className="w-5 h-5 text-[#b22222]" /> Profile
            </h2>

          {editMode ? (
            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) =>
                    setProfileData({ ...profileData, name: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#b22222] focus:border-[#b22222] transition-colors"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={profileData.email}
                  readOnly
                  className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="tel"
                  value={profileData.phoneNumber}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      phoneNumber: e.target.value,
                    })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#b22222] focus:border-[#b22222] transition-colors"
                  placeholder="Enter your phone number"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleProfileUpdate}
                  className="flex-1 bg-[#b22222] text-white py-3 px-4 rounded-lg hover:bg-[#a11c1c] transition-colors font-medium"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setEditMode(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="text-gray-600 text-sm font-medium min-w-[60px]">Name:</div>
                <div className="font-medium text-gray-800">{userDetails?.name || "N/A"}</div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="text-gray-600 text-sm font-medium min-w-[60px]">Email:</div>
                <div className="font-medium text-gray-800">{userDetails?.email || "N/A"}</div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="text-gray-600 text-sm font-medium min-w-[60px]">Phone:</div>
                <div className="font-medium text-gray-800">
                  {userDetails?.phonenumber || "N/A"}
                </div>
              </div>
              <button
                onClick={() => setEditMode(true)}
                className="w-full mt-6 bg-[#b22222] text-white px-4 py-3 rounded-lg hover:bg-[#a11c1c] transition-colors font-medium"
              >
                Edit Profile
              </button>
            </div>
          )}
        </div>

        {/* Address Management */}
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6">
          <h2 className="flex items-center gap-2 text-xl font-semibold mb-6 text-gray-800">
            <MapPin className="w-5 h-5 text-[#b22222]" /> Address Book
          </h2>
          <AddressManager />
        </div>
        </div>

        {/* Orders Section - Full Width */}
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6">
          <h2 className="flex items-center gap-2 text-xl font-semibold mb-6 text-gray-800">
            <Package className="w-5 h-5 text-[#b22222]" /> Order History
          </h2>
          {loadingOrders ? (
            <div className="flex justify-center py-8">
              <p className="text-gray-500">Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">You haven't placed any orders yet.</p>
            </div>
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
