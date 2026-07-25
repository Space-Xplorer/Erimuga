import React from 'react';
import axios from '../../config/axios';
import toast from 'react-hot-toast';
import { Package, MapPin, CreditCard, Clock } from 'lucide-react';
import { useConfirmDialog } from '../ConfirmDialog';

const STATUS_COLORS = {
  'Order Placed': 'bg-blue-100 text-blue-700',
  Processing: 'bg-yellow-100 text-yellow-700',
  Shipped: 'bg-purple-100 text-purple-700',
  Delivered: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
  Returned: 'bg-gray-100 text-gray-700',
};

const OrderCard = ({ order, onCancelled }) => {
  const { confirm, dialog } = useConfirmDialog();

  const cancelOrder = async () => {
    const ok = await confirm('Are you sure you want to cancel this order?', { confirmLabel: 'Cancel Order' });
    if (!ok) return;
    try {
      const res = await axios.delete(`/orders/${order._id}`);
      toast.success(res.data.message || 'Order cancelled successfully');
      if (order.paymentMethod === 'Online') {
        toast('Any online payment will be refunded to your account shortly.', { icon: 'ℹ️' });
      }
      onCancelled?.();
    } catch {
      toast.error('Failed to cancel order. Please try again.');
    }
  };

  const displayId = order.orderNumber || `#${order._id.slice(-6).toUpperCase()}`;
  const statusClass = STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-700';

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition p-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Order {displayId}</h3>
          <div className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
            <Clock className="w-3.5 h-3.5" />
            {new Date(order.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusClass} self-start sm:self-center`}>
          {order.status}
        </span>
      </div>

      {/* Amount + Payment */}
      <div className="flex items-center gap-4 text-sm mb-4 text-gray-600">
        <div className="flex items-center gap-1">
          <CreditCard className="w-4 h-4" />
          <span className="font-semibold text-gray-800">₹{order.amount?.toLocaleString('en-IN')}</span>
        </div>
        <span className="text-gray-400">|</span>
        <span>{order.paymentMethod} — {order.paymentStatus}</span>
      </div>

      {/* Items */}
      <div className="space-y-2 mb-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Items</p>
        {order.items.map((item, idx) => (
          <div key={idx} className="flex items-start gap-3 bg-gray-50 rounded-lg p-3">
            <Package className="w-4 h-4 text-brand mt-0.5 shrink-0" />
            <div className="text-sm">
              <div className="font-medium text-gray-800">{item.productName || 'Product'}</div>
              <div className="text-gray-500">
                Qty: {item.quantity}
                {item.size && ` | Size: ${item.size}`}
                {item.color && ` | Colour: ${item.color}`}
                {item.price && ` | ₹${item.price} each`}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Status timeline */}
      {order.statusHistory?.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Order Progress</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {order.statusHistory.map((entry, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="w-1.5 h-1.5 rounded-full bg-brand shrink-0" />
                <span className="font-medium text-gray-700">{entry.status}</span>
                <span>— {new Date(entry.changedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Address */}
      {order.address?.street && (
        <div className="flex items-start gap-2 text-sm text-gray-500 mb-4">
          <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-gray-400" />
          <span>
            {order.address.street}, {order.address.city}, {order.address.state} — {order.address.postalCode || order.address.zip}
          </span>
        </div>
      )}

      {/* Cancel button */}
      {!['Cancelled', 'Delivered', 'Returned'].includes(order.status) && (
        <div className="text-right">
          <button
            onClick={cancelOrder}
            className="text-sm text-red-600 border border-red-300 px-4 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
          >
            Cancel Order
          </button>
        </div>
      )}
      {dialog}
    </div>
  );
};

export default OrderCard;
