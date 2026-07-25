import { useState, useEffect } from 'react';
import axios from '../../config/axios';
import toast from 'react-hot-toast';
import { ChevronDown, ChevronUp, User } from 'lucide-react';

const StatusBadge = ({ status }) => {
  const colors = {
    'Order Placed': 'bg-blue-100 text-blue-700',
    'Processing': 'bg-yellow-100 text-yellow-700',
    'Shipped': 'bg-indigo-100 text-indigo-700',
    'Delivered': 'bg-green-100 text-green-700',
    'Cancelled': 'bg-red-100 text-red-700',
    'Returned': 'bg-gray-100 text-gray-600',
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
};

const CustomerRow = ({ customer }) => {
  const [expanded, setExpanded] = useState(false);
  const [orders, setOrders] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadOrders = async () => {
    if (orders) { setExpanded(v => !v); return; }
    setLoading(true);
    try {
      const res = await axios.get(`/admin/customers/${customer._id}`);
      setOrders(res.data.orders);
      setExpanded(true);
    } catch { toast.error('Failed to load order history'); }
    finally { setLoading(false); }
  };

  return (
    <>
      <tr className="hover:bg-gray-50 transition-colors">
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center">
              <User className="w-4 h-4 text-brand" />
            </div>
            <div>
              <div className="font-medium text-gray-800 text-sm">{customer.name}</div>
              <div className="text-xs text-gray-400">{customer.email}</div>
            </div>
          </div>
        </td>
        <td className="px-4 py-3 text-sm text-gray-600">{customer.phone}</td>
        <td className="px-4 py-3 text-sm text-gray-800 text-center font-medium">{customer.orderCount}</td>
        <td className="px-4 py-3 text-sm text-gray-800 font-medium">
          ₹{customer.totalSpent.toLocaleString('en-IN')}
        </td>
        <td className="px-4 py-3 text-xs text-gray-400">
          {customer.joinedAt ? new Date(customer.joinedAt).toLocaleDateString('en-IN') : '—'}
        </td>
        <td className="px-4 py-3">
          <button
            onClick={loadOrders}
            disabled={loading}
            className="flex items-center gap-1 text-xs text-brand hover:underline disabled:opacity-50"
          >
            {loading ? '…' : expanded ? <><ChevronUp className="w-3.5 h-3.5" /> Hide</> : <><ChevronDown className="w-3.5 h-3.5" /> Orders</>}
          </button>
        </td>
      </tr>

      {expanded && orders && (
        <tr>
          <td colSpan={6} className="bg-gray-50 px-4 pb-3 pt-0">
            {orders.length === 0 ? (
              <p className="text-xs text-gray-400 py-2">No orders yet.</p>
            ) : (
              <table className="w-full text-xs mt-2">
                <thead>
                  <tr className="text-gray-500 border-b border-gray-200">
                    <th className="text-left py-1 font-medium">Order #</th>
                    <th className="text-left py-1 font-medium">Date</th>
                    <th className="text-left py-1 font-medium">Amount</th>
                    <th className="text-left py-1 font-medium">Payment</th>
                    <th className="text-left py-1 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order._id} className="border-b border-gray-100">
                      <td className="py-1.5 font-mono text-gray-700">{order.orderNumber || `#${order._id.slice(-6)}`}</td>
                      <td className="py-1.5 text-gray-500">{new Date(order.date).toLocaleDateString('en-IN')}</td>
                      <td className="py-1.5 font-medium text-gray-800">₹{order.amount?.toLocaleString('en-IN')}</td>
                      <td className="py-1.5 text-gray-500">{order.paymentMethod}</td>
                      <td className="py-1.5"><StatusBadge status={order.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </td>
        </tr>
      )}
    </>
  );
};

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    axios.get('/admin/customers')
      .then(res => setCustomers(res.data))
      .catch(() => toast.error('Failed to load customers'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalRevenue = customers.reduce((s, c) => s + c.totalSpent, 0);
  const totalOrders = customers.reduce((s, c) => s + c.orderCount, 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2 text-gray-800">Customers</h1>
      <p className="text-gray-500 text-sm mb-6">{customers.length} registered customers</p>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Customers', value: customers.length },
          { label: 'Total Orders', value: totalOrders },
          { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}` },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl shadow-sm p-4 text-center">
            <div className="text-2xl font-bold text-brand">{stat.value}</div>
            <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search by name or email…"
        className="w-full sm:w-72 border border-gray-300 rounded-xl px-4 py-2 mb-4 text-sm focus:ring-2 focus:ring-brand focus:border-brand"
      />

      {loading ? (
        <div className="text-center py-16 text-gray-400 animate-pulse">Loading customers…</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Customer', 'Phone', 'Orders', 'Total Spent', 'Joined', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">No customers found.</td></tr>
              ) : (
                filtered.map(c => <CustomerRow key={c._id} customer={c} />)
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
