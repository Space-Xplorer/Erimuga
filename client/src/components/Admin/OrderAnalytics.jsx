import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, PieChart, Pie, Cell, Legend, ResponsiveContainer
} from 'recharts';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';

const COLORS = ['#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#FF6666'];

export default function OrderAnalytics() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    axios.get('/admin/order-stats').then(res => {
      setStats(res.data);
    });
  }, []);

  if (!stats) return <div className="p-4 text-center">Loading stats...</div>;

  return (
    <div className="p-6 space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Total Revenue" value={`₹${stats.totalRevenue}`} />
        <StatCard title="Total Orders" value={stats.totalOrders} />
        <StatCard title="Top Product" value={stats.topProduct} />
      </div>

      {/* Revenue Over Time */}
      <div className="bg-white rounded-2xl shadow p-4">
        <h2 className="text-lg font-semibold mb-2">Revenue Over Time</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={stats.revenueOverTime}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <CartesianGrid stroke="#ccc" />
            <Line type="monotone" dataKey="revenue" stroke="#00C49F" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Orders Per Category */}
      <div className="bg-white rounded-2xl shadow p-4">
        <h2 className="text-lg font-semibold mb-2">Orders Per Category</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stats.ordersByCategory}>
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="orders" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Payment Method Pie */}
      <div className="bg-white rounded-2xl shadow p-4">
        <h2 className="text-lg font-semibold mb-2">Payment Methods</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={stats.paymentMethods}
              dataKey="count"
              nameKey="method"
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              label
            >
              {stats.paymentMethods.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-white shadow rounded-2xl p-4 flex flex-col items-center justify-center">
      <h3 className="text-sm text-gray-500">{title}</h3>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
