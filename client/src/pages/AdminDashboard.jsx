// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import OrderAnalytics from '../../components/Admin/OrderAnalytics';

// const AdminDashboard = () => {
//   const [orders, setOrders] = useState([]);

//   useEffect(() => {
//     fetchOrders();
//   }, []);

//   const fetchOrders = async () => {
//     try {
//       const res = await axios.get('http://localhost:5000/admin/orders');
//       setOrders(res.data);
//     } catch (err) {
//       console.error('Error fetching orders:', err);
//     }
//   };

//   const handleStatusChange = async (orderId, newStatus) => {
//     try {
//       await axios.put(`http://localhost:5000/admin/orders/${orderId}`, {
//         status: newStatus,
//       });
//       fetchOrders();
//     } catch (err) {
//       console.error('Error updating order status:', err);
//     }
//   };

//   const formatDate = (timestamp) => {
//     const date = new Date(timestamp);
//     return date.toLocaleString();
//   };

//   return (
//     <div className="admin-dashboard p-4">
//       <h2 className="text-xl font-bold mb-4 mt-8">📦 Orders</h2>
//       {orders.map((order) => (
//         <div key={order._id} className="border p-4 my-4 rounded bg-white shadow-md">
//           <div className="mb-2">
//             <strong>Order ID:</strong> {order._id}<br />
//             <strong>User ID:</strong> {order.userID}<br />
//             <strong>Order Date:</strong> {formatDate(order.date)}<br />
//             <strong>Status:</strong>{' '}
//             <select
//               value={order.status}
//               onChange={(e) => handleStatusChange(order._id, e.target.value)}
//               className="border p-1 rounded ml-2"
//             >
//               <option>Order Placed</option>
//               <option>Shipped</option>
//               <option>Delivered</option>
//               <option>Cancelled</option>
//             </select><br />
//             <strong>Payment Method:</strong> {order.paymentMethod}<br />
//             <strong>Payment Received:</strong> {order.payment ? '✅ Yes' : '❌ No'}<br />
//             <strong>Total Amount:</strong> ₹{order.amount}<br />
//           </div>

//           <div className="mb-2">
//             <strong>Address:</strong><br />
//             {order.address.name}<br />
//             {order.address.email}<br />
//             {order.address.phone}<br />
//             {order.address.address}
//           </div>

//           <div>
//             <strong>Items:</strong>
//             <ul className="list-disc list-inside">
//               {order.items.map((item, idx) => (
//                 <li key={idx} className="ml-4">
//                   <strong>Product ID:</strong> {item.productId}<br />
//                   <strong>Quantity:</strong> {item.quantity}<br />
//                   <strong>Size:</strong> {item.size}<br />
//                   <strong>Color:</strong> {item.color}<br />
//                   <strong>Price at Purchase:</strong> ₹{item.priceAtPurchase}
//                 </li>
//               ))}
//             </ul>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default AdminDashboard;




// /pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

import AdminSummary from '../components/Admin/AdminSummary';
import OrdersTable from '../components/Admin/OrdersTable';    
import OrderModal from '../components/Admin/OrderModal';

const AdminDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchOrders = async () => {
    try {
      const res = await axios.get('http://localhost:5000/admin/orders');
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
      await axios.put(`http://localhost:5000/admin/orders/${orderId}`, {
        status: newStatus,
      });
      fetchOrders();
    } catch (err) {
      console.error('Error updating order status:', err);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">📊 Admin Dashboard</h2>
      <AdminSummary orders={orders} />
      <OrdersTable
        orders={orders}
        onStatusChange={handleStatusChange}
        onView={(order) => {
          setSelectedOrder(order);
          setShowModal(true);
        }}
      />
      <OrderModal
        order={selectedOrder}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
};

export default AdminDashboard;
