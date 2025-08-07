import React from 'react';
import { useNavigate } from 'react-router-dom';

const OrderCard = ({ order, onStatusChange }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/admin/orders/${order._id}`);
  };

  const handleStatusChange = (e) => {
    onStatusChange(order._id, e.target.value);
  };

  return (
    <div
      onClick={handleCardClick}
      className="cursor-pointer border p-4 rounded shadow-md bg-white hover:bg-gray-50 transition"
    >
      <div className="mb-2">
        <strong>Status:</strong>{' '}
        <select
          value={order.status}
          onChange={handleStatusChange}
          onClick={(e) => e.stopPropagation()} // prevent card click on dropdown
          className="border p-1 rounded ml-2"
        >
          <option>Order Placed</option>
          <option>Shipped</option>
          <option>Delivered</option>
          <option>Cancelled</option>
        </select>
      </div>

      {order.items.slice(0, 1).map((item, idx) => (
        <div key={idx}>
          <div className="mb-1">
            <strong>Product ID:</strong> {item.productId}
          </div>
          <div className="mb-1">
            <img
              src={item.image}
              alt={`Product ${item.productId}`}
              className="w-24 h-24 object-cover border"
            />
          </div>
          <div>
            <strong>Quantity:</strong> {item.quantity}
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrderCard;
