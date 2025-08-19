import React, { useState, useEffect } from 'react';
import axios from 'axios';

import AdminSummary from '../../components/Admin/AdminSummary';
import OrdersTable from '../../components/Admin/OrdersTable';
import OrderModal from '../../components/Admin/OrderModal';
import MetadataModal from '../../components/Admin/MetadataModal';

const AdminDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [metaModalOpen, setMetaModalOpen] = useState(false);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/admin/orders`);
      setOrders(res.data);
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.put(`${import.meta.env.VITE_BASE_URL}/admin/orders/${orderId}`, {
        status: newStatus,
      });
      fetchOrders();
    } catch (err) {
      console.error('Error updating order status:', err);
    }
  };

  return (
    <div className="p-6 md:p-10 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">📊 Admin Dashboard</h2>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={() => setMetaModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-xl shadow hover:bg-blue-700 transition"
        >
          ➕ Add Metadata
        </button>
        <a
          href="/admin/add-product"
          className="flex items-center gap-2 bg-green-600 text-white px-5 py-2 rounded-xl shadow hover:bg-green-700 transition"
        >
          ➕ Add Product
        </a>
      </div>

      {/* Summary Cards */}
      <AdminSummary orders={orders} />

      {/* Orders Table */}
      <div className="bg-white rounded-2xl shadow p-4 mt-6">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">🧾 Orders</h3>
        <OrdersTable
          orders={orders}
          onStatusChange={handleStatusChange}
          onView={(order) => {
            setSelectedOrder(order);
            setShowModal(true);
          }}
          onDelete={async (orderId) => {
            try {
              await axios.delete(`${import.meta.env.VITE_BASE_URL}/admin/orders/${orderId}`);
              fetchOrders();
            } catch (err) {
              console.error('Error deleting order:', err);
            }
          }}
          onMetadataUpdate={async (orderId, metadata) => {
            try {
              await axios.put(`${import.meta.env.VITE_BASE_URL}/admin/orders/${orderId}/metadata`, {
                metadata,
              });
              fetchOrders();
            } catch (err) {
              console.error('Error updating metadata:', err);
            }
          }}
        />
      </div>

      {/* Order Details Modal */}
      <OrderModal
        order={selectedOrder}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />

      {/* Metadata Modal */}
      <MetadataModal
        isOpen={metaModalOpen}
        onClose={() => setMetaModalOpen(false)}
      />
    </div>
  );
};

export default AdminDashboard;
