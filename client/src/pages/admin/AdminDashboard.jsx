import React, { useState, useEffect } from 'react';
import axios from '../../config/axios';
import { Link } from 'react-router-dom';
import { Package, Users, Tag, BarChart2, ClipboardList, Mail, GalleryHorizontal } from 'lucide-react';

import AdminSummary from '../../components/Admin/AdminSummary';
import OrdersTable from '../../components/Admin/OrdersTable';
import OrderModal from '../../components/Admin/OrderModal';
import MetadataModal from '../../components/Admin/MetadataModal';
import OrderAnalytics from '../../components/Admin/OrderAnalytics';

const TABS = ['Orders', 'Analytics'];

const AdminDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [metaModalOpen, setMetaModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Orders');

  const fetchOrders = async () => {
    try {
      const res = await axios.get('/admin/orders');
      setOrders(res.data);
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  return (
    <div className="p-6 md:p-10 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Admin Dashboard</h2>

      {/* Quick nav cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { to: '/admin/add-product', icon: <Package className="w-5 h-5" />, label: 'Add Product', color: 'bg-green-600 hover:bg-green-700' },
          { to: '/admin/products', icon: <ClipboardList className="w-5 h-5" />, label: 'Products', color: 'bg-blue-600 hover:bg-blue-700' },
          { to: '/admin/customers', icon: <Users className="w-5 h-5" />, label: 'Customers', color: 'bg-purple-600 hover:bg-purple-700' },
          { to: '/admin/coupons', icon: <Tag className="w-5 h-5" />, label: 'Coupons', color: 'bg-orange-500 hover:bg-orange-600' },
          { to: '/admin/messages', icon: <Mail className="w-5 h-5" />, label: 'Messages', color: 'bg-teal-600 hover:bg-teal-700' },
          { to: '/admin/banners', icon: <GalleryHorizontal className="w-5 h-5" />, label: 'Carousel', color: 'bg-pink-600 hover:bg-pink-700' },
        ].map(item => (
          <Link
            key={item.to}
            to={item.to}
            className={`flex items-center gap-2 ${item.color} text-white px-4 py-2.5 rounded-xl shadow transition text-sm font-medium`}
          >
            {item.icon} {item.label}
          </Link>
        ))}
      </div>

      {/* Summary cards */}
      <AdminSummary orders={orders} />

      {/* Tab bar */}
      <div className="flex gap-1 mt-6 bg-white rounded-xl shadow p-1 w-fit">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab ? 'bg-[#b22222] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            {tab === 'Analytics' && <BarChart2 className="w-4 h-4" />}
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'Orders' && (
        <div className="bg-white rounded-2xl shadow p-4 mt-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-700">Orders</h3>
            <button
              onClick={() => setMetaModalOpen(true)}
              className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition"
            >
              + Metadata
            </button>
          </div>
          <OrdersTable
            orders={orders}
            onView={(order) => { setSelectedOrder(order); setShowModal(true); }}
          />
        </div>
      )}

      {activeTab === 'Analytics' && (
        <div className="mt-4">
          <OrderAnalytics />
        </div>
      )}

      <OrderModal order={selectedOrder} isOpen={showModal} onClose={() => setShowModal(false)} />
      <MetadataModal isOpen={metaModalOpen} onClose={() => setMetaModalOpen(false)} />
    </div>
  );
};

export default AdminDashboard;
