import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [statusUpdate, setStatusUpdate] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get('http://localhost:5000/admin/orders');
      setOrders(res.data);
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/admin/orders/${orderId}`, {
        status: newStatus,
      });
      fetchOrders(); // Refresh
    } catch (err) {
      console.error('Error updating order status:', err);
    }
  };

  return (
    <div className="admin-dashboard p-4">
      <h2>📦 Orders</h2>
      {orders.map((order) => (
        <div key={order._id} className="border p-3 my-2 rounded bg-white shadow">
          <p><strong>UserID:</strong> {order.userID}</p>
          <p><strong>Status:</strong> {order.status}</p>
          <select
            value={order.status}
            onChange={(e) => handleStatusChange(order._id, e.target.value)}
          >
            <option>Order Placed</option>
            <option>Shipped</option>
            <option>Delivered</option>
            <option>Cancelled</option>
          </select>
        </div>
      ))}
    </div>
  );
};

export default AdminDashboard;
