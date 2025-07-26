import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';

const Checkout = () => {
  const { cartItems, getTotalAmount, clearCart } = useContext(ShopContext);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [userDetails, setUserDetails] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  const totalAmount = getTotalAmount();

  const handleInputChange = (e) => {
    setUserDetails({ ...userDetails, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async () => {
    if (paymentMethod === 'cod') {
      alert('Order placed successfully via Cash on Delivery!');
      clearCart();
    } else {
      const razorpayOrder = await axios.post('http://localhost:5000/api/razorpay/order', {
        amount: totalAmount * 100 // Razorpay takes amount in paise
      });

      const options = {
        key: 'YOUR_RAZORPAY_KEY_ID', // Replace with your Razorpay Key ID
        amount: razorpayOrder.data.amount,
        currency: 'INR',
        name: 'MyShop Checkout',
        description: 'Order Payment',
        handler: function (response) {
          alert('Payment successful! Payment ID: ' + response.razorpay_payment_id);
          clearCart();
        },
        prefill: {
          name: userDetails.name,
          email: userDetails.email,
          contact: userDetails.phone
        },
        theme: {
          color: '#b22222'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6 text-center text-[#b22222]">Checkout</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* User Form */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-[#b22222]">Shipping Information</h2>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            className="w-full p-2 mb-3 border rounded"
            onChange={handleInputChange}
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full p-2 mb-3 border rounded"
            onChange={handleInputChange}
          />
          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            className="w-full p-2 mb-3 border rounded"
            onChange={handleInputChange}
          />
          <textarea
            name="address"
            placeholder="Shipping Address"
            rows="4"
            className="w-full p-2 mb-3 border rounded"
            onChange={handleInputChange}
          ></textarea>

          <h3 className="text-lg font-medium mb-2">Payment Method</h3>
          <div className="flex gap-4 mb-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="payment"
                value="cod"
                checked={paymentMethod === 'cod'}
                onChange={() => setPaymentMethod('cod')}
              />
              Cash on Delivery
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="payment"
                value="razorpay"
                checked={paymentMethod === 'razorpay'}
                onChange={() => setPaymentMethod('razorpay')}
              />
              Razorpay
            </label>
          </div>

          <button
            onClick={handlePlaceOrder}
            className="w-full bg-[#b22222] text-white py-2 rounded hover:bg-[#a11c1c] transition"
          >
            Place Order
          </button>
        </div>

        {/* Cart Summary */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-[#b22222]">Cart Summary</h2>
          {Array.isArray(cartItems) && cartItems.length > 0 ? (
            <ul className="space-y-4">
              {cartItems.map((item, index) => (
                <li key={index} className="border-b pb-2">
                  <div className="flex justify-between">
                    <span className="font-medium">{item.productId.name || 'Product Name'}</span>
                    <span>
                      {item.quantity} x ₹{item.priceAtPurchase} = ₹{item.quantity * item.priceAtPurchase}
                    </span>
                  </div>
                </li>
              ))}
              <li className="font-bold text-right pt-4 border-t mt-4">
                Total: ₹{totalAmount}
              </li>
            </ul>
          ) : (
            <p>Your cart is empty.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Checkout;
