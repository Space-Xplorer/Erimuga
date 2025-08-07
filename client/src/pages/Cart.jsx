import React, { useContext } from 'react';
import { ShopContext } from '../context/ShopContext'; // Adjust the path if needed
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const {
    cartItems = [],
    products = [],
    removeFromCart,
    updateQuantity,
    getTotalAmount,
  } = useContext(ShopContext);

  const navigate = useNavigate();
  const totalAmount = getTotalAmount();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-center mb-6">Shopping Cart</h2>

      {Array.isArray(cartItems) && cartItems.length > 0 ? (
        <div className="space-y-6">
          {cartItems.map((item) => {
            const product = products.find((p) => p._id === item.productId);
            if (!product) return null;

            return (
              <div
                key={item._id || item.productId}
                className="flex items-center bg-white p-4 md:p-6 rounded-xl shadow gap-4"
              >
                <img
                  src={product.image?.[0] || '/fallback.jpg'}
                  alt={product.name}
                  className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-lg"
                />

                <div className="flex-grow">
                  <p className="font-semibold text-lg text-gray-800">{product.name}</p>
                  <p className="text-sm text-gray-500">Size: {item.size || 'N/A'}</p>
                  <p className="text-sm text-gray-500 mb-1">Color: {item.color || 'N/A'}</p>
                  <p className="text-sm text-gray-500 mb-1">
                    ₹{item.priceAtPurchase || product.price} per item
                  </p>
                  <button
                    onClick={() => removeFromCart(item.productCode)}
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
                    onChange={(e) =>
                      updateQuantity(item.productId, Number(e.target.value))
                    }
                    className="w-16 text-center border border-gray-300 rounded-md py-1 px-2"
                  />
                  <p className="w-24 text-right font-bold text-gray-800">
                    ₹{((item.priceAtPurchase || product.price) * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            );
          })}

          <div className="text-right mt-8">
            <h3 className="text-xl font-bold mb-4">
              Total Amount: ₹{totalAmount.toFixed(2)}
            </h3>

            <button
              onClick={() => navigate('/checkout')}
              style={{ backgroundColor: '#b22222' }}
              className="text-white px-6 py-2 rounded-lg hover:opacity-90 transition"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-600">Your cart is empty.</p>
      )}
    </div>
  );
};

export default Cart;