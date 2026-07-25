import React, { useContext, useState, useEffect } from 'react';
import axios from '../config/axios';
import { useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { useAuth } from '../components/Auth/AuthContext';
import toast from 'react-hot-toast';
import { MapPin, CreditCard, ShoppingBag, Check } from 'lucide-react';
import { getProductThumbnail } from '../utils/productImage';

const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;

const EMPTY_ADDR = { recipientName: '', street: '', city: '', state: '', postalCode: '', country: 'India', landmark: '', phonenumber: '', addressType: 'Home' };

const Checkout = () => {
  const { cartItems, products, getTotalAmount, clearCart } = useContext(ShopContext);
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [phone, setPhone] = useState('');
  const [newAddress, setNewAddress] = useState(EMPTY_ADDR);
  const [saveNewAddress, setSaveNewAddress] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const addresses = user?.addresses || [];

  // Pre-select default address once user loads
  useEffect(() => {
    if (user) {
      const defaultAddr = addresses.find(a => a.isDefault) || addresses[0];
      if (defaultAddr) setSelectedAddressId(defaultAddr._id);
      setPhone(user.phonenumber || '');
    }
  }, [user?._id]);

  const subtotal = getTotalAmount();
  const discount = appliedCoupon?.discount || 0;
  const totalAmount = Math.max(0, subtotal - discount);
  const selectedAddress = addresses.find(a => a._id === selectedAddressId);
  const finalAddress = selectedAddress || newAddress;
  const usingNewAddress = !selectedAddressId;

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return toast.error('Enter a coupon code first');
    setApplyingCoupon(true);
    try {
      const res = await axios.post('/coupons/validate', { code: couponInput, amount: subtotal });
      setAppliedCoupon(res.data);
      toast.success(`Coupon applied! You save ₹${res.data.discount}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid coupon');
      setAppliedCoupon(null);
    } finally { setApplyingCoupon(false); }
  };

  const removeCoupon = () => { setAppliedCoupon(null); setCouponInput(''); };

  const loadRazorpayScript = () => new Promise(resolve => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  const validate = () => {
    if (!cartItems.length) { toast.error('Your cart is empty'); return false; }
    if (!phone.trim() || !/^\d{10}$/.test(phone.replace(/\s/g, ''))) {
      toast.error('Please enter a valid 10-digit phone number'); return false;
    }
    if (!finalAddress.street?.trim()) { toast.error('Street address is required'); return false; }
    if (!finalAddress.city?.trim()) { toast.error('City is required'); return false; }
    if (!finalAddress.state?.trim()) { toast.error('State is required'); return false; }
    if (!/^\d{6}$/.test((finalAddress.postalCode || '').trim())) { toast.error('PIN code must be 6 digits'); return false; }
    return true;
  };

  const maybeSaveAddress = async () => {
    if (!usingNewAddress || !saveNewAddress || !user) return;
    try {
      const res = await axios.put('/user/auth/update-address', { address: newAddress, action: 'add' });
      if (res.data.success) updateUser(res.data.user);
    } catch { /* non-blocking */ }
  };

  const buildOrderPayload = () => ({
    items: cartItems.map(item => ({ productId: item.productId, quantity: item.quantity, size: item.size, color: item.color })),
    amount: totalAmount,
    address: { ...finalAddress, zip: finalAddress.postalCode },
    phone,
    ...(appliedCoupon ? { couponCode: appliedCoupon.code } : {}),
  });

  const handleCOD = async () => {
    if (!validate()) return;
    setPlacing(true);
    const loadingToast = toast.loading('Placing your order…');
    try {
      await maybeSaveAddress();
      await axios.post('/orders/place-order/cod', buildOrderPayload());
      await clearCart();
      toast.dismiss(loadingToast);
      toast.success('Order placed successfully!');
      navigate('/orders');
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error(err.response?.data?.error || 'Failed to place order. Please try again.');
    } finally { setPlacing(false); }
  };

  const handleRazorpay = async () => {
    if (!validate()) return;
    setPlacing(true);

    const loaded = await loadRazorpayScript();
    if (!loaded) { toast.error('Could not load payment gateway. Check your internet.'); setPlacing(false); return; }

    const loadingToast = toast.loading('Initiating payment…');
    try {
      await maybeSaveAddress();
      const razorpayOrder = await axios.post('/orders/place-order/razorpay', buildOrderPayload());
      toast.dismiss(loadingToast);

      const options = {
        key: razorpayKey,
        amount: razorpayOrder.data.amount,
        currency: 'INR',
        name: 'Erimuga',
        description: 'Order Payment',
        order_id: razorpayOrder.data.id,
        handler: async (response) => {
          const verifyToast = toast.loading('Verifying payment…');
          try {
            await axios.post('/orders/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              ...buildOrderPayload(),
            });
            await clearCart();
            toast.dismiss(verifyToast);
            toast.success('Payment successful! Order placed.');
            navigate('/orders');
          } catch (err) {
            toast.dismiss(verifyToast);
            toast.error(err.response?.data?.error || 'Payment succeeded but order failed. Contact support.');
          }
        },
        prefill: { name: user?.name || '', email: user?.email || '', contact: phone },
        theme: { color: '#9c2a21' },
      };
      new window.Razorpay(options).open();
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error(err.response?.data?.error || 'Payment initiation failed. Please try again.');
    } finally { setPlacing(false); }
  };

  const handlePlaceOrder = () => paymentMethod === 'cod' ? handleCOD() : handleRazorpay();

  if (!cartItems.length) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 bg-paper">
        <ShoppingBag className="h-14 w-14 text-paper-deep" />
        <p className="font-display text-2xl text-ink">Your cart is empty</p>
        <a href="/collection" className="mt-2 inline-flex items-center gap-2 border-b border-ink/25 pb-1 text-sm text-ink transition-colors hover:border-brand hover:text-brand">
          Continue browsing <span aria-hidden="true">&rarr;</span>
        </a>
      </div>
    );
  }

  return (
    <div className="bg-paper">
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="eyebrow">Almost there</p>
      <h1 className="mt-2 mb-8 font-display text-4xl text-ink sm:text-5xl">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Left: Shipping + Payment */}
        <div className="space-y-6">
          {/* Contact info */}
          <div className="bg-white shadow-sm rounded-xl p-6">
            <h2 className="font-display text-2xl mb-4 text-ink">Contact Information</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
                <input type="text" value={user?.name || ''} readOnly className="w-full p-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                <input type="email" value={user?.email || ''} readOnly className="w-full p-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="10-digit mobile number"
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand"
                />
              </div>
            </div>
          </div>

          {/* Delivery address */}
          <div className="bg-white shadow-sm rounded-xl p-6">
            <h2 className="flex items-center gap-2 font-display text-2xl mb-4 text-ink">
              <MapPin className="w-5 h-5 text-brand" /> Delivery Address
            </h2>

            {addresses.length > 0 && (
              <div className="space-y-2 mb-4">
                {addresses.map(addr => (
                  <label
                    key={addr._id}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${selectedAddressId === addr._id ? 'border-brand bg-paper-dim' : 'border-gray-200 hover:bg-gray-50'}`}
                  >
                    <input
                      type="radio"
                      name="address"
                      checked={selectedAddressId === addr._id}
                      onChange={() => setSelectedAddressId(addr._id)}
                      className="mt-1 accent-brand"
                    />
                    <div className="text-sm text-gray-700">
                      <div className="font-medium flex items-center gap-2">
                        {addr.recipientName || addr.street}
                        <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{addr.addressType || 'Home'}</span>
                        {addr.isDefault && <span className="text-xs text-brand font-semibold">Default</span>}
                      </div>
                      {addr.recipientName && <div>{addr.street}</div>}
                      <div className="text-gray-500">{addr.city}, {addr.state} — {addr.postalCode}</div>
                      {addr.phonenumber && <div className="text-gray-400">{addr.phonenumber}</div>}
                    </div>
                  </label>
                ))}
                <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${usingNewAddress ? 'border-brand bg-paper-dim' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <input
                    type="radio"
                    name="address"
                    checked={usingNewAddress}
                    onChange={() => setSelectedAddressId(null)}
                    className="accent-brand"
                  />
                  <span className="text-sm font-medium text-gray-700">Use a different address</span>
                </label>
              </div>
            )}

            {/* New address form */}
            {(usingNewAddress || addresses.length === 0) && (
              <div className="space-y-3 pt-2">
                {[
                  ['recipientName', 'Recipient Name', 'Name on the door'],
                  ['street', 'Street Address *', 'House no., Building, Street'],
                  ['landmark', 'Landmark', 'Near bus stand, area…'],
                ].map(([key, label, placeholder]) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                    <input
                      type="text"
                      value={newAddress[key]}
                      onChange={e => setNewAddress({ ...newAddress, [key]: e.target.value })}
                      placeholder={placeholder}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand"
                    />
                  </div>
                ))}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[['city', 'City *'], ['state', 'State *']].map(([key, label]) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                      <input
                        type="text"
                        value={newAddress[key]}
                        onChange={e => setNewAddress({ ...newAddress, [key]: e.target.value })}
                        placeholder={label.replace(' *', '')}
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">PIN Code *</label>
                    <input
                      type="text"
                      value={newAddress.postalCode}
                      onChange={e => setNewAddress({ ...newAddress, postalCode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                      placeholder="6-digit PIN"
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address Type</label>
                    <select
                      value={newAddress.addressType}
                      onChange={e => setNewAddress({ ...newAddress, addressType: e.target.value })}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand"
                    >
                      {['Home', 'Work', 'Other'].map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                {user && (
                  <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer mt-1">
                    <input
                      type="checkbox"
                      checked={saveNewAddress}
                      onChange={e => setSaveNewAddress(e.target.checked)}
                      className="accent-brand"
                    />
                    Save this address to my profile for future orders
                  </label>
                )}
              </div>
            )}
          </div>

          {/* Payment method */}
          <div className="bg-white shadow-sm rounded-xl p-6">
            <h2 className="flex items-center gap-2 font-display text-2xl mb-4 text-ink">
              <CreditCard className="w-5 h-5 text-brand" /> Payment Method
            </h2>
            <div className="space-y-2">
              {[
                { value: 'cod', label: 'Cash on Delivery', desc: 'Pay when your order arrives' },
                { value: 'razorpay', label: 'Pay Online (Razorpay)', desc: 'Cards, UPI, Net Banking, Wallets' },
              ].map(opt => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${paymentMethod === opt.value ? 'border-brand bg-paper-dim' : 'border-gray-200 hover:bg-gray-50'}`}
                >
                  <input type="radio" name="payment" value={opt.value} checked={paymentMethod === opt.value} onChange={() => setPaymentMethod(opt.value)} className="accent-brand" />
                  <div>
                    <div className="font-medium text-sm text-gray-800">{opt.label}</div>
                    <div className="text-xs text-gray-400">{opt.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Order summary */}
        <div className="space-y-6">
          <div className="bg-white shadow-sm rounded-xl p-6 sticky top-28">
            <h2 className="font-display text-2xl mb-4 text-ink">Order Summary</h2>

            <div className="space-y-3 mb-4">
              {cartItems.map((item, idx) => {
                const product = products.find(p => p._id === (item.productId?._id || item.productId));
                return (
                  <div key={idx} className="flex items-center gap-3 text-sm">
                    <img
                      src={getProductThumbnail(product)}
                      alt={item.productName}
                      className="w-14 h-14 object-cover rounded-lg border border-gray-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-800 truncate">{item.productName}</div>
                      <div className="text-gray-400 text-xs">
                        Qty: {item.quantity}
                        {item.size && ` | Size: ${item.size}`}
                        {item.color && ` | ${item.color}`}
                      </div>
                    </div>
                    <span className="text-gray-700 font-medium shrink-0">₹{(item.priceAtPurchase * item.quantity).toLocaleString('en-IN')}</span>
                  </div>
                );
              })}
            </div>

            {/* Coupon input */}
            <div className="mt-2 mb-3">
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-sm">
                  <span className="font-medium text-green-700">
                    <span className="font-mono">{appliedCoupon.code}</span> applied — saving ₹{appliedCoupon.discount}
                  </span>
                  <button onClick={removeCoupon} className="text-gray-400 hover:text-red-500 ml-2 text-xs underline">Remove</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={e => setCouponInput(e.target.value.toUpperCase())}
                    onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                    placeholder="Coupon code"
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand focus:border-brand"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={applyingCoupon}
                    className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-60 transition-colors whitespace-nowrap"
                  >
                    {applyingCoupon ? '…' : 'Apply'}
                  </button>
                </div>
              )}
            </div>

            <div className="border-t pt-3 space-y-1 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount ({appliedCoupon.code})</span><span>−₹{discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span><span className="text-green-600">Free</span>
              </div>
              <div className="flex justify-between font-bold text-gray-800 text-base border-t pt-2 mt-2">
                <span>Total</span><span>₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Delivery confirmation */}
            {finalAddress.street && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-500 border border-gray-200">
                <div className="font-semibold text-gray-700 mb-1 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-green-500" /> Delivering to:
                </div>
                {finalAddress.recipientName && <div>{finalAddress.recipientName}</div>}
                <div>{finalAddress.street}</div>
                <div>{finalAddress.city}, {finalAddress.state} — {finalAddress.postalCode}</div>
              </div>
            )}

            <button
              onClick={handlePlaceOrder}
              disabled={placing}
              className="mt-5 w-full bg-brand text-white py-3 rounded-xl font-semibold hover:opacity-90 disabled:opacity-60 transition-colors text-sm"
            >
              {placing ? 'Placing Order…' : paymentMethod === 'cod' ? 'Place Order (COD)' : 'Pay & Place Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default Checkout;
