import React from 'react';

const AdminSummary = ({ orders }) => {
  const totalRevenue = orders
    .filter((o) => o.status !== 'Cancelled')  // Exclude Cancelled orders
    .reduce((acc, o) => acc + o.amount, 0);

  const totalOrders = orders.length;

  const statusCount = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-4">
      <div className="bg-white rounded-2xl shadow-md p-4">
        <h4 className="text-sm text-gray-500">Total Orders</h4>
        <p className="text-xl font-bold">{totalOrders}</p>
      </div>
      <div className="bg-white rounded-2xl shadow-md p-4">
        <h4 className="text-sm text-gray-500">Total Revenue</h4>
        <p className="text-xl font-bold">₹{totalRevenue.toLocaleString()}</p>
      </div>
      <div className="bg-white rounded-2xl shadow-md p-4">
        <h4 className="text-sm text-gray-500">Shipped</h4>
        <p className="text-xl font-bold">{statusCount['Shipped'] || 0}</p>
      </div>
      <div className="bg-white rounded-2xl shadow-md p-4">
        <h4 className="text-sm text-gray-500">Delivered</h4>
        <p className="text-xl font-bold">{statusCount['Delivered'] || 0}</p>
      </div>
    </div>
  );
};

export default AdminSummary;
