import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import OrderCard from "../components/User/OrderCard";
import AddressManager from "../components/User/AddressManager";
import { ShopContext } from "../context/ShopContext";
import { useAuth } from "../components/Auth/AuthContext"; // ✅ Import useAuth
import { User, Mail, Phone, MapPin, Package } from "lucide-react";
import toast from 'react-hot-toast';

const UserDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null); 
  const [userDetails, setUserDetails] = useState(null);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phonenumber: "",
  });
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingUser, setLoadingUser] = useState(true);

  const { authUser } = useContext(ShopContext);
  const { user, updateUser } = useAuth(); 
  const userId = authUser?._id;

  // ✅ Use user data from auth context instead of fetching separately
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phonenumber: user.phonenumber || '',
      });
    }
  }, [user]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!userId) return;
      
      try {
        setError(null);
        console.log('🔍 Fetching orders for user:', userId);
        
        const res = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/orders/user/${userId}`,
          { 
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
        
        console.log('✅ Orders response:', res.data);
        
        // ✅ Handle new response format
        if (res.data.success && Array.isArray(res.data.orders)) {
          setOrders(res.data.orders);
        } else if (Array.isArray(res.data)) {
          // Fallback for old format
          setOrders(res.data);
        } else {
          console.warn('Unexpected orders response format:', res.data);
          setOrders([]);
        }
      } catch (error) {
        console.error("Error fetching user orders:", error);
        console.error("Error response:", error.response?.data);
        console.error("Error status:", error.response?.status);
        
        // ✅ Better error handling for production
        if (error.response?.status === 401) {
          setError('Please login to view your orders');
          toast.error('Authentication required. Please login again.');
        } else if (error.response?.status === 403) {
          setError('Access denied');
          toast.error('You are not authorized to view these orders');
        } else if (error.response?.status >= 500) {
          setError('Server error. Please try again later.');
          toast.error('Server error. Please try again later.');
        } else {
          setError('Failed to fetch orders. Please try again.');
          toast.error('Failed to fetch orders');
        }
        
        setOrders([]);
      } finally {
        setLoadingOrders(false);
      }
    };

    const fetchUserDetails = async () => {
      try {
        setError(null);
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
        
        if (error.response?.status === 401) {
          setError('Please login to view your profile');
          toast.error('Authentication required. Please login again.');
        } else {
          setError('Failed to fetch user details');
          toast.error('Failed to fetch profile information');
        }
      } finally {
        setLoadingUser(false);
      }
    };

    if (userId) {
      fetchOrders();
      fetchUserDetails();
    } else {
      setLoadingOrders(false);
      setLoadingUser(false);
      setError('User not authenticated');
    }
  }, [userId]);

  // ✅ Updated profile update to sync with auth context
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const response = await axios.put('/api/user/update-profile', profileData, {
        withCredentials: true
      });
      if (response.data.success) {
        // Update the auth context with new user data
        updateUser(response.data.user);
        setEditMode(false);
        alert('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const testSession = async () => {
    try {
      console.log('🧪 Testing session...');
      const res = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/user/auth/check-session`,
        { withCredentials: true }
      );
      console.log('✅ Session test result:', res.data);
      toast.success('Session test completed. Check console for details.');
    } catch (error) {
      console.error('❌ Session test failed:', error);
      toast.error('Session test failed. Check console for details.');
    }
  };

  // ✅ Show error state
  if (error && !loadingOrders && !loadingUser) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error</h2>
            <p className="text-red-600">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-[#b22222] mb-8">My Account</h1>

        {/* ✅ Debug Session Button */}
        <div className="mb-4">
          <button
            onClick={testSession}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            🧪 Test Session
          </button>
        </div>

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
                  value={profileData.phonenumber}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      phonenumber: e.target.value,
                    })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#b22222] focus:border-[#b22222] transition-colors"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleProfileUpdate}
                  className="px-4 py-2 bg-[#b22222] text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setEditMode(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="text-gray-600 text-sm font-medium min-w-[60px]">Name:</div>
                <div className="font-medium text-gray-800">{user?.name || "N/A"}</div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="text-gray-600 text-sm font-medium min-w-[60px]">Email:</div>
                <div className="font-medium text-gray-800">{user?.email || "N/A"}</div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="text-gray-600 text-sm font-medium min-w-[60px]">Phone:</div>
                <div className="font-medium text-gray-800">
                  {user?.phonenumber || "N/A"}
                </div>
              </div>
              <button
                onClick={() => setEditMode(true)}
                className="px-4 py-2 bg-[#b22222] text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Edit Profile
              </button>
            </div>
          )}
          </div>

          {/* Addresses Section */}
          <AddressManager userId={userId} />

          {/* Orders Section */}
          <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6">
            <h2 className="flex items-center gap-2 text-xl font-semibold mb-6 text-gray-800">
              <Package className="w-5 h-5 text-[#b22222]" /> My Orders
            </h2>
            
            {loadingOrders ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#b22222] mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading orders...</p>
              </div>
            ) : orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map((order) => (
                  <OrderCard key={order._id} order={order} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No orders yet</p>
                <p className="text-sm text-gray-400 mt-1">Start shopping to see your orders here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
