import React from 'react';
import axios from 'axios';

const OrderCard = ({ order }) => {
  const cancelOrder = async () => {
    try {
      const confirmed = window.confirm("Are you sure you want to cancel this order?");
      if (!confirmed) return;

      const res = await axios.delete(`http://localhost:5000/orders/${order._id}`);
      
      // ✅ Razorpay specific refund message
      if (order.paymentMethod.toLowerCase() === 'razorpay') {
        alert("This was a Razorpay order. The money will be refunded to your account shortly.");
      }

      alert(res.data.message || "Order cancelled successfully.");
      window.location.reload();
    } catch (err) {
      console.error("Cancel failed:", err);
      alert("Failed to cancel order.");
    }
  };

  return (
    <div className="border p-4 rounded-xl shadow-sm hover:shadow-md transition">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xl font-semibold">Order #{order._id.slice(-6).toUpperCase()}</h3>
        <span className={`text-sm font-medium ${order.status === 'Cancelled' ? 'text-red-500' : 'text-green-600'}`}>
          {order.status}
        </span>
      </div>

      <div className="mb-2 text-gray-600">
        {new Date(order.date).toLocaleDateString()} | ₹{order.amount} | {order.paymentMethod}
      </div>

      <div className="grid gap-2 text-sm text-gray-700">
        {order.items.map((item, idx) => (
          <div key={idx} className="border p-2 rounded bg-gray-50">
            <div className="font-medium">{item.productName}</div>
            <div>Qty: {item.quantity} | Size: {item.size} | Color: {item.color}</div>
          </div>
        ))}
      </div>

      {order.status !== 'Cancelled' && (
        <div className="mt-4 text-right">
          <button
            onClick={cancelOrder}
            className="text-sm bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
          >
            Cancel Order
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderCard;
