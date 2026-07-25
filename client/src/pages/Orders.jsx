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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="eyebrow">Your history</p>
        <h1 className="mt-2 mb-8 font-display text-4xl text-ink sm:text-5xl">My Orders</h1>

        {orders.length === 0 ? (
          <div className="border border-paper-deep bg-paper-dim py-20 text-center">
            <Package className="mx-auto mb-4 h-12 w-12 text-ink-muted" />
            <p className="font-display text-2xl text-ink">No orders yet</p>
            <p className="mt-1 text-sm text-ink-muted">Your order history will appear here</p>
            <a
              href="/collection"
              className="mt-6 inline-flex items-center gap-2 border-b border-ink/25 pb-1 text-sm text-ink transition-colors hover:border-brand hover:text-brand"
            >
              Start browsing <span aria-hidden="true">&rarr;</span>
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
