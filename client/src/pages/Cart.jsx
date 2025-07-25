import React, { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';

const Cart = () => {
  const {
    cartItems,
    products,
    removeFromCart,
    updateQuantity,
    getTotalAmount
  } = useContext(ShopContext);

  if (!cartItems || cartItems.length === 0) {
    return <div className="p-4">Your cart is empty 🛒</div>;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Your Cart</h2>

      {cartItems.map((item) => {
        const product = products.find(p => p._id === item.productId);
        if (!product) return null;

        return (
          <div
            key={item.productId}
            className="border rounded-lg p-4 mb-4 shadow-sm flex justify-between items-center"
          >
            <div>
              <h3 className="font-semibold">{product.name}</h3>
              <p className="text-sm text-gray-500">
                ₹{product.price} x {item.quantity}
              </p>
              <div className="flex mt-2 gap-2 items-center">
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  className="px-2 py-1 border rounded"
                >
                  -
                </button>
                <span>{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                  className="px-2 py-1 border rounded"
                >
                  +
                </button>
                <button
                  onClick={() => removeFromCart(item.productId)}
                  className="ml-4 px-2 py-1 text-red-500 border rounded"
                >
                  Remove
                </button>
              </div>
            </div>
            <div className="font-semibold text-right">
              ₹{product.price * item.quantity}
            </div>
          </div>
        );
      })}

      <div className="text-right font-bold text-xl mt-6">
        Total: ₹{getTotalAmount()}
      </div>
    </div>
  );
};

export default Cart;
