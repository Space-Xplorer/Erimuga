import React, { useEffect, useState } from 'react';
import axios from '../config/axios';
import { useAuth } from '../components/Auth/AuthContext';
import { Package } from 'lucide-react';
import toast from 'react-hot-toast';
import OrderCard from '../components/User/OrderCard';

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    if (!user?._id) return;
    try {
      const res = await axios.get(`/orders/user/${user._id}`);
      setOrders(res.data.orders || []);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#b22222]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-[#b22222] mb-8">My Orders</h1>

        {orders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No orders yet</p>
            <p className="text-sm text-gray-400 mt-1">Your order history will appear here</p>
            <a
              href="/collection"
              className="mt-6 inline-block bg-[#b22222] text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Start Shopping
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard key={order._id} order={order} onCancelled={fetchOrders} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
