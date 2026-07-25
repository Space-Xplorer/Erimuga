import React, { useState } from 'react';
import { useAuth } from '../Auth/AuthContext';
import axios from '../../config/axios';
import toast from 'react-hot-toast';
import { MapPin, Star, Pencil, Trash2, Plus } from 'lucide-react';
import { useConfirmDialog } from '../ConfirmDialog';

const EMPTY_FORM = {
  recipientName: '',
  street: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'India',
  phonenumber: '',
  landmark: '',
  addressType: 'Home',
  isDefault: false,
};

const AddressForm = ({ value, onChange, onSubmit, onCancel, loading, submitLabel }) => (
  <div className="space-y-3">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div className="col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Name</label>
        <input
          type="text"
          value={value.recipientName}
          onChange={e => onChange({ ...value, recipientName: e.target.value })}
          placeholder="Name on the door"
          className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand"
        />
      </div>
      <div className="col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
        <input
          type="text"
          value={value.street}
          onChange={e => onChange({ ...value, street: e.target.value })}
          placeholder="House / flat no., Building, Street"
          className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand"
        />
      </div>
      <div className="col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">Landmark</label>
        <input
          type="text"
          value={value.landmark}
          onChange={e => onChange({ ...value, landmark: e.target.value })}
          placeholder="Near bus stand, landmark…"
          className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
        <input
          type="text"
          value={value.city}
          onChange={e => onChange({ ...value, city: e.target.value })}
          placeholder="City"
          className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
        <input
          type="text"
          value={value.state}
          onChange={e => onChange({ ...value, state: e.target.value })}
          placeholder="State"
          className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">PIN Code *</label>
        <input
          type="text"
          value={value.postalCode}
          onChange={e => onChange({ ...value, postalCode: e.target.value })}
          placeholder="6-digit PIN"
          maxLength={6}
          className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
        <input
          type="tel"
          value={value.phonenumber}
          onChange={e => onChange({ ...value, phonenumber: e.target.value })}
          placeholder="10-digit mobile"
          maxLength={10}
          className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Address Type</label>
        <select
          value={value.addressType}
          onChange={e => onChange({ ...value, addressType: e.target.value })}
          className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand"
        >
          {['Home', 'Work', 'Other'].map(t => <option key={t}>{t}</option>)}
        </select>
      </div>
    </div>

    <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
      <input
        type="checkbox"
        checked={value.isDefault}
        onChange={e => onChange({ ...value, isDefault: e.target.checked })}
        className="accent-brand"
      />
      Set as default delivery address
    </label>

    <div className="flex gap-2 pt-1">
      <button
        onClick={onSubmit}
        disabled={loading}
        className="flex-1 bg-brand text-white py-2.5 rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium transition-colors"
      >
        {loading ? 'Saving…' : submitLabel}
      </button>
      {onCancel && (
        <button
          onClick={onCancel}
          disabled={loading}
          className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg hover:bg-gray-200 font-medium transition-colors"
        >
          Cancel
        </button>
      )}
    </div>
  </div>
);

const AddressManager = () => {
  const { user, updateUser } = useAuth();

  const [newAddress, setNewAddress] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [editAddress, setEditAddress] = useState(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const { confirm, dialog } = useConfirmDialog();

  const callApi = async (payload) => {
    const res = await axios.put('/user/auth/update-address', payload);
    if (res.data.success) updateUser(res.data.user);
    return res;
  };

  const validate = (addr) => {
    if (!addr.street.trim()) { toast.error('Street address is required'); return false; }
    if (!addr.city.trim()) { toast.error('City is required'); return false; }
    if (!addr.state.trim()) { toast.error('State is required'); return false; }
    if (!/^\d{6}$/.test(addr.postalCode.trim())) { toast.error('PIN code must be 6 digits'); return false; }
    return true;
  };

  const handleAdd = async () => {
    if (!validate(newAddress)) return;
    setLoading(true);
    try {
      await callApi({ address: newAddress, action: 'add' });
      setNewAddress(EMPTY_FORM);
      setShowForm(false);
      toast.success('Address added!');
    } catch { toast.error('Failed to add address'); }
    finally { setLoading(false); }
  };

  const handleUpdate = async () => {
    if (!validate(editAddress)) return;
    setLoading(true);
    try {
      await callApi({ address: editAddress, addressId: editingId, action: 'update' });
      setEditingId(null);
      toast.success('Address updated!');
    } catch { toast.error('Failed to update address'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (addressId) => {
    const ok = await confirm('Remove this address?', { confirmLabel: 'Remove' });
    if (!ok) return;
    setLoading(true);
    try {
      await callApi({ addressId, action: 'delete' });
      toast.success('Address removed');
    } catch { toast.error('Failed to remove address'); }
    finally { setLoading(false); }
  };

  const handleSetDefault = async (addressId) => {
    setLoading(true);
    try {
      await callApi({ addressId, action: 'set-default' });
      toast.success('Default address updated');
    } catch { toast.error('Failed to update default'); }
    finally { setLoading(false); }
  };

  const startEdit = (addr) => {
    setEditingId(addr._id);
    setEditAddress({ ...EMPTY_FORM, ...addr });
    setShowForm(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-800">
          <MapPin className="w-5 h-5 text-brand" /> My Addresses
        </h2>
        {!showForm && (
          <button
            onClick={() => { setShowForm(true); setEditingId(null); }}
            className="flex items-center gap-1 text-sm text-brand border border-brand px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add New
          </button>
        )}
      </div>

      {/* Saved addresses */}
      {user?.addresses?.length > 0 ? (
        <div className="space-y-3 mb-5">
          {user.addresses.map(addr => (
            <div
              key={addr._id}
              className={`border rounded-xl p-4 transition-colors ${addr.isDefault ? 'border-brand bg-red-50' : 'border-gray-200 bg-white hover:bg-gray-50'}`}
            >
              {editingId === addr._id ? (
                <AddressForm
                  value={editAddress}
                  onChange={setEditAddress}
                  onSubmit={handleUpdate}
                  onCancel={() => setEditingId(null)}
                  loading={loading}
                  submitLabel="Save Changes"
                />
              ) : (
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 text-sm text-gray-700 space-y-0.5">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-800">
                        {addr.recipientName || addr.street}
                      </span>
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                        {addr.addressType || 'Home'}
                      </span>
                      {addr.isDefault && (
                        <span className="text-xs bg-brand text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Star className="w-3 h-3" fill="currentColor" /> Default
                        </span>
                      )}
                    </div>
                    {addr.recipientName && <div>{addr.street}</div>}
                    {addr.landmark && <div className="text-gray-500">{addr.landmark}</div>}
                    <div>{addr.city}, {addr.state} — {addr.postalCode}</div>
                    {addr.phonenumber && <div className="text-gray-500">{addr.phonenumber}</div>}
                  </div>

                  <div className="flex flex-col gap-1.5 shrink-0">
                    <button onClick={() => startEdit(addr)} className="flex items-center gap-1 text-xs text-gray-600 border border-gray-300 px-2.5 py-1 rounded-lg hover:bg-gray-100 transition-colors">
                      <Pencil className="w-3 h-3" /> Edit
                    </button>
                    {!addr.isDefault && (
                      <button onClick={() => handleSetDefault(addr._id)} disabled={loading} className="flex items-center gap-1 text-xs text-brand border border-brand px-2.5 py-1 rounded-lg hover:bg-red-50 transition-colors">
                        <Star className="w-3 h-3" /> Default
                      </button>
                    )}
                    <button onClick={() => handleDelete(addr._id)} disabled={loading} className="flex items-center gap-1 text-xs text-red-500 border border-red-200 px-2.5 py-1 rounded-lg hover:bg-red-50 transition-colors">
                      <Trash2 className="w-3 h-3" /> Remove
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-gray-400 mb-4">
          <MapPin className="w-10 h-10 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No saved addresses yet</p>
        </div>
      )}

      {/* Add new address form */}
      {showForm && (
        <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">New Address</h3>
          <AddressForm
            value={newAddress}
            onChange={setNewAddress}
            onSubmit={handleAdd}
            onCancel={() => { setShowForm(false); setNewAddress(EMPTY_FORM); }}
            loading={loading}
            submitLabel="Add Address"
          />
        </div>
      )}
      {dialog}
    </div>
  );
};

export default AddressManager;
