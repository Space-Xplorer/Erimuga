import React, { useEffect, useState } from 'react';
import axios from '../config/axios';
import OrderCard from '../components/User/OrderCard';
import AddressManager from '../components/User/AddressManager';
import { useAuth } from '../components/Auth/AuthContext';
import { User, Package } from 'lucide-react';
import toast from 'react-hot-toast';

const UserDashboard = () => {
  const { user, updateUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [profileData, setProfileData] = useState({ name: '', phonenumber: '' });

  useEffect(() => {
    if (user) {
      setProfileData({ name: user.name || '', phonenumber: user.phonenumber || '' });
    }
  }, [user]);

  const fetchOrders = async () => {
    if (!user?._id) return;
    try {
      const res = await axios.get(`/orders/user/${user._id}`);
      setOrders(res.data.orders || []);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const handleProfileUpdate = async () => {
    setIsUpdating(true);
    try {
      const res = await axios.put('/user/auth/update-profile', profileData);
      if (res.data.user) {
        updateUser(res.data.user);
        toast.success('Profile updated successfully');
        setEditMode(false);
      }
    } catch {
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-[#b22222] mb-8">My Account</h1>

        <div className="space-y-8">
          {/* Profile */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="flex items-center gap-2 text-xl font-semibold mb-6 text-gray-800">
              <User className="w-5 h-5 text-[#b22222]" /> Profile
            </h2>

            {editMode ? (
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={e => setProfileData({ ...profileData, name: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#b22222] focus:border-[#b22222]"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Email</label>
                  <input type="email" value={user?.email || ''} readOnly className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500" />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    value={profileData.phonenumber}
                    onChange={e => setProfileData({ ...profileData, phonenumber: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#b22222] focus:border-[#b22222]"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleProfileUpdate}
                    disabled={isUpdating}
                    className="px-5 py-2 bg-[#b22222] text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    {isUpdating ? 'Saving…' : 'Save Changes'}
                  </button>
                  <button onClick={() => setEditMode(false)} className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 max-w-md">
                {[['Name', user?.name], ['Email', user?.email], ['Phone', user?.phonenumber || 'Not set']].map(([label, val]) => (
                  <div key={label} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-500 text-sm font-medium w-14">{label}:</span>
                    <span className="text-gray-800 font-medium">{val}</span>
                  </div>
                ))}
                <button onClick={() => setEditMode(true)} className="mt-2 px-5 py-2 bg-[#b22222] text-white rounded-lg hover:bg-red-700 transition-colors">
                  Edit Profile
                </button>
              </div>
            )}
          </div>

          {/* Addresses */}
          <AddressManager userId={user?._id} />

          {/* Orders */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="flex items-center gap-2 text-xl font-semibold mb-6 text-gray-800">
              <Package className="w-5 h-5 text-[#b22222]" /> Recent Orders
            </h2>

            {loadingOrders ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#b22222] mx-auto" />
                <p className="mt-2 text-gray-500 text-sm">Loading orders…</p>
              </div>
            ) : orders.length > 0 ? (
              <div className="space-y-4">
                {orders.slice(0, 5).map(order => (
                  <OrderCard key={order._id} order={order} onCancelled={fetchOrders} />
                ))}
                {orders.length > 5 && (
                  <div className="text-center pt-2">
                    <a href="/orders" className="text-[#b22222] text-sm font-medium hover:underline">
                      View all {orders.length} orders →
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No orders yet</p>
                <a href="/collection" className="mt-3 inline-block text-[#b22222] text-sm font-medium hover:underline">
                  Start shopping →
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
