import React, { useContext, useState } from 'react';
import axios from 'axios';
import { ShopContext } from '../context/ShopContext';

const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;

const Checkout = () => {
  const { cartItems, getTotalAmount, clearCart , authUser } = useContext(ShopContext);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [userDetails, setUserDetails] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  const totalAmount = getTotalAmount();

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleInputChange = (e) => {
    setUserDetails({ ...userDetails, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async () => {
   const items = cartItems.map((item) => ({
  productId: item.productId,
  quantity: item.quantity,
  priceAtPurchase: item.priceAtPurchase,
  color: item.color,       // ✅ include selected color
  size: item.size,         // ✅ include selected size
}));


    if (paymentMethod === 'cod') {
      try {
        await axios.post(
          'http://localhost:5000/orders/place-order/cod',
          {
            userID: authUser._id,
            items,
            amount: totalAmount,
            address: userDetails,
          },
          { withCredentials: true }
        );
        alert('Order placed successfully via Cash on Delivery!');
        clearCart();
      } catch (err) {
        console.error('COD Order error:', err);
        alert('Failed to place COD order.');
      }
      return;
    }

    const razorpayLoaded = await loadRazorpayScript();
    if (!razorpayLoaded) {
      alert('Failed to load Razorpay. Try again.');
      return;
    }

    try {
      const razorpayOrder = await axios.post(
        'http://localhost:5000/orders/place-order/razorpay',
        { amount: totalAmount},
        { withCredentials: true }
      );

      const options = {
        key: razorpayKey,
        amount: razorpayOrder.data.amount,
        currency: 'INR',
        name: 'MyShop Checkout',
        description: 'Order Payment',
        order_id: razorpayOrder.data.id,
        handler: async function (response) {
          try {
            await axios.post(
              'http://localhost:5000/orders/verify-payment',
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                userID: authUser._id,
                items,
                amount: totalAmount,
                address: userDetails,
              },
              { withCredentials: true }
            );

            alert('Payment successful and order placed!');
            clearCart();
          } catch (err) {
            console.error('Payment verification error:', err);
            alert('Payment succeeded but order saving failed.');
          }
        },
        prefill: {
          name: userDetails.name,
          email: userDetails.email,
          contact: userDetails.phone,
        },
        theme: {
          color: '#b22222',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error('Razorpay order creation error:', err);
      alert('Something went wrong with payment.');
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
          {cartItems.length > 0 ? (
            <ul className="space-y-4">
              {cartItems.map((item, index) => (
                <li key={index} className="border-b pb-2">
                  <div className="flex justify-between">
                    <span className="font-medium">
                      {item.productId?.name || 'Unnamed Product'}
                    </span>
                    <span>
                      {item.quantity} x ₹{item.priceAtPurchase} = ₹
                      {item.quantity * item.priceAtPurchase}
                    </span>
                  </div>
                </li>
              ))}
              <li className="font-bold text-right pt-4 border-t mt-4">Total: ₹{totalAmount}</li>
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
