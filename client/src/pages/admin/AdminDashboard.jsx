// pages/AdminDashboard.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import OrderCard from '../../components/Admin/OrderCard'; 

const AdminDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 12;

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
      fetchOrders();
    } catch (err) {
      console.error('Error updating order status:', err);
    }
  };

  // Pagination logic
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);

  const totalPages = Math.ceil(orders.length / ordersPerPage);

  return (
    <div className="admin-dashboard p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">📦 Orders</h2>
        <div className="space-x-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-2 py-1 border rounded disabled:opacity-50"
          >
            ← Prev
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-2 py-1 border rounded disabled:opacity-50"
          >
            Next →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {currentOrders.map((order) => (
          <OrderCard
            key={order._id}
            order={order}
            onStatusChange={handleStatusChange}
          />
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
