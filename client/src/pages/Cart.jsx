import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';

const Cart = () => {
  const {
    cartItems,
    products,
    removeFromCart,
    updateQuantity,
    getTotalAmount,
  } = useContext(ShopContext);

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="text-center py-24 px-6 bg-gray-50 min-h-screen">
        <h2 className="text-4xl font-bold text-gray-800 mb-4">Your Cart is Empty 🛒</h2>
        <p className="text-gray-600 mb-6 text-lg">Looks like you haven't added anything yet.</p>
        <Link
          to="/"
          className="inline-block bg-[#B22222] text-white font-semibold py-3 px-8 rounded-xl shadow hover:bg-red-600 transition-all"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-10">
          Your Shopping Cart
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {cartItems.map((item) => {
              const product = products.find((p) => p._id === item.itemId);

              if (!product) {
                console.warn(`Product with ID ${item.itemId} not found in products list.`);
                return null;
              }

              return (
                <div
                  key={item.itemId}
                  className="flex items-center bg-white p-4 md:p-6 rounded-xl shadow gap-4"
                >
                  <img
                    src={product.image[0]}
                    alt={product.name}
                    className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-lg"
                  />

                  <div className="flex-grow">
                    <p className="font-semibold text-lg text-gray-800">{product.name}</p>
                    <p className="text-sm text-gray-500 mb-1">₹{product.price}</p>
                    <button
                      onClick={() => removeFromCart(item.itemId)}
                      className="text-sm text-red-500 hover:underline"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      value={item.quantity}
                      min="1"
                      onChange={(e) => updateQuantity(item.itemId, Number(e.target.value))}
                      className="w-16 text-center border border-gray-300 rounded-md py-1 px-2"
                    />
                    <p className="w-24 text-right font-bold text-gray-800">
                      ₹{(product.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="bg-white p-6 rounded-xl shadow h-fit">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">
              Order Summary
            </h2>
            <div className="space-y-4 text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium">₹{getTotalAmount().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-medium">Free</span>
              </div>
            </div>

            <div className="border-t mt-6 pt-4 flex justify-between font-bold text-lg text-gray-800">
              <span>Total</span>
              <span>₹{getTotalAmount().toFixed(2)}</span>
            </div>

            <Link
              to="/checkout"
              className="block w-full text-center mt-6 bg-[#B22222] text-white font-semibold py-3 rounded-xl shadow hover:bg-red-600 transition"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
