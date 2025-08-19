import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';

// ✅ Centralized constants for statuses to prevent typos and ease maintenance
const ORDER_STATUSES = {
  PLACED: 'Order Placed',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

const PAYMENT_STATUSES = {
  COD: {
    PENDING: 'COD - Pending',
    RECEIVED: 'COD - Received',
  },
  RAZORPAY: {
    PENDING: 'Razorpay - Pending',
    RECEIVED: 'Razorpay - Received',
    REFUNDED: 'Razorpay - Refunded',
  },
  UNKNOWN: 'Unknown',
};

const getCurrentPaymentDisplayStatus = (order) => {
  const { paymentMethod, payment, status, paymentStatus } = order;
  const method = paymentMethod?.toLowerCase();

  // ✅ CORRECTED LOGIC FOR CANCELLED ORDERS
  if (status === ORDER_STATUSES.CANCELLED) {
    if (method === 'razorpay' && payment) {
      // If the order is explicitly marked as Refunded in the DB, show that.
      if (paymentStatus === PAYMENT_STATUSES.RAZORPAY.REFUNDED) {
        return PAYMENT_STATUSES.RAZORPAY.REFUNDED;
      }
      // Otherwise, it means payment was received and a refund is pending.
      // This allows the user to change it TO 'Refunded'.
      return PAYMENT_STATUSES.RAZORPAY.RECEIVED;
    }
    return 'N/A'; // No payment action on a cancelled COD or unpaid Razorpay
  }
  
  // This part for non-cancelled orders remains the same and is correct.
  if (paymentStatus) return paymentStatus;

  // Fallback for older data models
  if (method === 'cod') {
    return payment ? PAYMENT_STATUSES.COD.RECEIVED : PAYMENT_STATUSES.COD.PENDING;
  }
  if (method === 'razorpay') {
    return payment ? PAYMENT_STATUSES.RAZORPAY.RECEIVED : PAYMENT_STATUSES.RAZORPAY.PENDING;
  }
  
  return PAYMENT_STATUSES.UNKNOWN;
};

/**
 * Provides the list of selectable options for the payment dropdown.
 */
const getPaymentOptions = (order) => {
  const method = order.paymentMethod?.toLowerCase();
  if (order.status === ORDER_STATUSES.CANCELLED) {
      if (method === 'razorpay' && order.payment) {
          // If a paid Razorpay order is cancelled, the only action is to refund.
          return [PAYMENT_STATUSES.RAZORPAY.RECEIVED, PAYMENT_STATUSES.RAZORPAY.REFUNDED];
      }
      return []; // No options if cancelled and unpaid/COD
  }

  if (method === 'cod') return Object.values(PAYMENT_STATUSES.COD);
  if (method === 'razorpay') return Object.values(PAYMENT_STATUSES.RAZORPAY);
  return [PAYMENT_STATUSES.UNKNOWN];
};


const OrdersTable = ({ orders: initialOrders, onView }) => {
  const [orders, setOrders] = useState(initialOrders || []);
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Effect to sync component state if the initialOrders prop changes
  useEffect(() => {
    setOrders(initialOrders || []);
  }, [initialOrders]);

  const formatDate = (timestamp) => new Date(timestamp).toLocaleString();

  // Memoized derivation of orders to display. Recalculates only when dependencies change.
  const filteredAndSortedOrders = useMemo(() => {
    let filtered =
      statusFilter === 'All'
        ? orders
        : orders.filter((order) => order.status === statusFilter);

    return [...filtered].sort((a, b) => {
      const order = sortOrder === 'asc' ? 1 : -1;
      if (sortBy === 'amount') {
        return (a.amount - b.amount) * order;
      }
      if (sortBy === 'date') {
        return (new Date(a.date) - new Date(b.date)) * order;
      }
      return 0;
    });
  }, [orders, statusFilter, sortBy, sortOrder]);

  // Generic handler for updating any order property
  const handleUpdateOrder = async (orderId, updatePayload) => {
    try {
      await axios.put(`${import.meta.env.VITE_BASE_URL}/orders/${orderId}/status`, updatePayload);
      setOrders((prevOrders) =>
        prevOrders.map((o) =>
          o._id === orderId ? { ...o, ...updatePayload } : o
        )
      );
    } catch (error) {
      console.error('Error updating order:', error);
      alert(`Failed to update order. ${error.message}`);
    }
  };

  // Maps dropdown selection to the correct backend fields
  const handlePaymentStatusChange = (orderId, newPaymentStatus) => {
    const isReceived = newPaymentStatus.includes('Received');
    const isRefunded = newPaymentStatus.includes('Refunded');

    const payload = {
      paymentStatus: newPaymentStatus,
      payment: isReceived || isRefunded, // Payment is true if it's received or has been refunded
    };
    handleUpdateOrder(orderId, payload);
  };

  const handleOrderStatusChange = (orderId, newStatus) => {
    handleUpdateOrder(orderId, { status: newStatus });
  };


  return (
    <div className="mb-6">
      {/* Filter & Sort Controls */}
      <div className="flex flex-wrap gap-4 items-center mb-4">
        <label className="text-sm font-medium">
          Filter by Status:
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="ml-2 border px-2 py-1 rounded focus:ring-2 focus:ring-[#b22222]"
          >
            <option>All</option>
            {Object.values(ORDER_STATUSES).map(status => <option key={status}>{status}</option>)}
          </select>
        </label>
        {/* Sorting controls remain unchanged but are good */}
        <label className="text-sm font-medium">
          Sort by:
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="ml-2 border px-2 py-1 rounded focus:ring-2 focus:ring-[#b22222]"
          >
            <option value="date">Date</option>
            <option value="amount">Amount</option>
          </select>
        </label>
        <label className="text-sm font-medium">
          Order:
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="ml-2 border px-2 py-1 rounded focus:ring-2 focus:ring-[#b22222]"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </label>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto rounded-xl shadow-lg border border-[#b22222]/30">
        <table className="min-w-full bg-white">
          <thead style={{ backgroundColor: '#b22222' }}>
            <tr>
              {['Order ID', 'User ID', 'Amount', 'Status', 'Payment Status', 'Date', 'Actions'].map((heading) => (
                <th key={heading} className="p-3 text-left text-white text-sm font-semibold">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedOrders.map((order, index) => {
              const currentPaymentStatus = getCurrentPaymentDisplayStatus(order);
              const paymentOptions = getPaymentOptions(order);
              const isOrderCancelled = order.status === ORDER_STATUSES.CANCELLED;
              
              return (
              <tr
                key={order._id}
                className={`border-t ${
                  isOrderCancelled
                    ? 'bg-gray-100 text-gray-500'
                    : index % 2 === 0
                    ? 'bg-white'
                    : 'bg-[#fff5f5]'
                }`}
              >
                <td className="p-3">{order._id}</td>
                <td className="p-3">{order.userID}</td>
                <td className="p-3 font-semibold">₹{order.amount}</td>
                <td className="p-3">
                  <select
                    value={order.status}
                    onChange={(e) => handleOrderStatusChange(order._id, e.target.value)}
                    disabled={isOrderCancelled}
                    className={`border rounded px-2 py-1 ${
                      isOrderCancelled ? 'bg-gray-200 cursor-not-allowed' : ''
                    }`}
                  >
                   {Object.values(ORDER_STATUSES).map(status => <option key={status}>{status}</option>)}
                  </select>
                </td>
                <td className="p-3">
                   {paymentOptions.length > 0 ? (
                      <select
                        value={currentPaymentStatus}
                        onChange={(e) => handlePaymentStatusChange(order._id, e.target.value)}
                        className={`border rounded px-2 py-1 ${
                           isOrderCancelled ? 'bg-yellow-100 border-yellow-400' : ''
                        }`}
                      >
                        {paymentOptions.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                   ) : (
                     <span className="px-2 py-1 text-gray-400">{currentPaymentStatus}</span>
                   )}
                </td>
                <td className="p-3">{formatDate(order.date)}</td>
                <td className="p-3">
                  <button
                    onClick={() => onView(order)}
                    className="text-[#b22222] font-medium underline hover:text-red-800 text-sm"
                  >
                    View
                  </button>
                </td>
              </tr>
            )})}
            {filteredAndSortedOrders.length === 0 && (
              <tr>
                <td colSpan="7" className="p-4 text-center text-gray-500">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrdersTable;