import React, { useState, useMemo } from 'react';

const OrdersTable = ({ orders, onStatusChange, onView }) => {
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('date'); // or 'amount'
  const [sortOrder, setSortOrder] = useState('desc'); // or 'asc'

  const formatDate = (timestamp) => new Date(timestamp).toLocaleString();

  const filteredAndSortedOrders = useMemo(() => {
    let filtered = statusFilter === 'All' ? orders : orders.filter(order => order.status === statusFilter);

    let sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'amount') {
        return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
      } else if (sortBy === 'date') {
        return sortOrder === 'asc'
          ? new Date(a.date) - new Date(b.date)
          : new Date(b.date) - new Date(a.date);
      }
      return 0;
    });

    return sorted;
  }, [orders, statusFilter, sortBy, sortOrder]);

  return (
    <div className="mb-6">
      {/* Filter & Sort Controls */}
      <div className="flex flex-wrap gap-4 items-center mb-4">
        <label className="text-sm">
          Filter by Status:
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="ml-2 border px-2 py-1 rounded"
          >
            <option>All</option>
            <option>Order Placed</option>
            <option>Shipped</option>
            <option>Delivered</option>
            <option>Cancelled</option>
          </select>
        </label>

        <label className="text-sm">
          Sort by:
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="ml-2 border px-2 py-1 rounded"
          >
            <option value="date">Date</option>
            <option value="amount">Amount</option>
          </select>
        </label>

        <label className="text-sm">
          Order:
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="ml-2 border px-2 py-1 rounded"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </label>
      </div>

      {/* Orders Table */}
      <table className="min-w-full bg-white rounded-xl shadow-md">
        <thead>
          <tr>
            <th className="p-3 text-left">Order ID</th>
            <th className="p-3 text-left">User ID</th>
            <th className="p-3 text-left">Amount</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-left">Date</th>
            <th className="p-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredAndSortedOrders.map(order => (
            <tr key={order._id} className="border-t">
              <td className="p-3">{order._id}</td>
              <td className="p-3">{order.userID}</td>
              <td className="p-3">₹{order.amount}</td>
              <td className="p-3">
                <select
                  value={order.status}
                  onChange={(e) => onStatusChange(order._id, e.target.value)}
                  className="border rounded px-2 py-1"
                >
                  <option>Order Placed</option>
                  <option>Shipped</option>
                  <option>Delivered</option>
                  <option>Cancelled</option>
                </select>
              </td>
              <td className="p-3">{formatDate(order.date)}</td>
              <td className="p-3">
                <button
                  onClick={() => onView(order)}
                  className="text-blue-600 underline text-sm"
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrdersTable;
