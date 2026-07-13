import React from 'react';
import { Dialog } from '@headlessui/react';

const OrderModal = ({ order, isOpen, onClose }) => {
  if (!order) return null;

  const { address = {} } = order;

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />

      {/* Modal container */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-2xl rounded-2xl bg-white shadow-xl p-8">
          <Dialog.Title className="text-2xl font-semibold text-gray-800 border-b pb-2 mb-4">
            🧾 Order Details
          </Dialog.Title>

          <div className="space-y-3 text-sm text-gray-700">
            <p>
              <span className="font-medium">Customer:</span>{' '}
              {order.userID?.name || 'Unknown'}
              {order.userID?.email && <span className="text-gray-400"> ({order.userID.email})</span>}
            </p>
            <p><span className="font-medium">Payment:</span> {order.payment ? '✅ Yes' : '❌ No'}</p>
            <p><span className="font-medium">Payment Method:</span> {order.paymentMethod || 'N/A'}</p>
            <p><span className="font-medium">Amount:</span> ₹{order.amount}</p>
            <p><span className="font-medium">Date:</span> {new Date(order.date).toLocaleString()}</p>

            {/* Address Section */}
            <div>
              <p className="font-medium">Shipping Address:</p>
                <div className="ml-4 text-gray-600 text-sm space-y-0.5">
                  {address.street && <p><span className="font-medium">Street:</span> {address.street}</p>}
                  {address.city && <p><span className="font-medium">City:</span> {address.city}</p>}
                  {address.state && <p><span className="font-medium">State:</span> {address.state}</p>}
                  {address.zip && <p><span className="font-medium">ZIP:</span> {address.zip}</p>}
                  {address.country && <p><span className="font-medium">Country:</span> {address.country}</p>}
                  {order.phone && <p><span className="font-medium">Phone:</span> {order.phone}</p>} {/* ✅ separate phone */}
              </div>
            </div>

          

            {/* Items Section */}
            <div>
              <p className="font-medium">Items:</p>
              <ul className="mt-2 space-y-2">
                {order.items.map((item, i) => {
                  const thumb = item.productID?.image?.[0];
                  const name = item.productName || item.productID?.name || 'Product';
                  return (
                    <li key={i} className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 rounded-lg p-2">
                      {thumb ? (
                        <img src={thumb} alt="" className="w-10 h-10 rounded object-cover shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded bg-gray-200 shrink-0" />
                      )}
                      <span>
                        <span className="font-medium text-gray-800">{name}</span>
                        {' — '}Qty: {item.quantity} | Size: {item.size || '—'} | Colour: {item.color || '—'}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* Close button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-700 transition"
            >
              Close
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default OrderModal;
