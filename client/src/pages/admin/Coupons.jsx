import { useState, useEffect } from 'react';
import axios from '../../config/axios';
import toast from 'react-hot-toast';
import { Trash2, ToggleLeft, ToggleRight, ChevronDown, ChevronUp } from 'lucide-react';
import { useConfirmDialog } from '../../components/ConfirmDialog';

const EMPTY_FORM = { code: '', type: 'percent', value: '', minOrderAmount: '', expiresAt: '', usageLimit: '' };

export default function Coupons() {
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [saving, setSaving] = useState(false);
  const { confirm, dialog } = useConfirmDialog();

  const fetchCoupons = async () => {
    try {
      const res = await axios.get('/coupons');
      setCoupons(res.data);
    } catch { toast.error('Failed to load coupons'); }
  };

  useEffect(() => { fetchCoupons(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.code.trim()) return toast.error('Coupon code is required');
    if (!form.value || Number(form.value) <= 0) return toast.error('Value must be greater than 0');
    if (form.type === 'percent' && Number(form.value) > 100) return toast.error('Percentage cannot exceed 100');

    setSaving(true);
    const loadId = toast.loading('Creating coupon…');
    try {
      await axios.post('/coupons', {
        code: form.code.toUpperCase().trim(),
        type: form.type,
        value: Number(form.value),
        minOrderAmount: Number(form.minOrderAmount) || 0,
        expiresAt: form.expiresAt || null,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
      });
      toast.dismiss(loadId);
      toast.success('Coupon created!');
      setForm(EMPTY_FORM);
      fetchCoupons();
    } catch (err) {
      toast.dismiss(loadId);
      toast.error(err.response?.data?.error || 'Failed to create coupon');
    } finally { setSaving(false); }
  };

  const toggleActive = async (coupon) => {
    if (coupon.active) {
      const ok = await confirm(`Deactivate coupon "${coupon.code}"? Customers won't be able to use it until reactivated.`, { confirmLabel: 'Deactivate' });
      if (!ok) return;
    }
    try {
      await axios.put(`/coupons/${coupon._id}`, { active: !coupon.active });
      setCoupons(prev => prev.map(c => c._id === coupon._id ? { ...c, active: !c.active } : c));
      toast.success(coupon.active ? 'Coupon deactivated' : 'Coupon activated');
    } catch { toast.error('Failed to update coupon'); }
  };

  const handleDelete = async (id) => {
    const ok = await confirm('Delete this coupon? This cannot be undone.', { confirmLabel: 'Delete' });
    if (!ok) return;
    try {
      await axios.delete(`/coupons/${id}`);
      setCoupons(prev => prev.filter(c => c._id !== id));
      toast.success('Coupon deleted');
    } catch { toast.error('Failed to delete coupon'); }
  };

  const field = (key, label, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        placeholder={placeholder}
        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-brand focus:border-brand"
      />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Coupons & Discounts</h1>

      {/* Create form */}
      <form onSubmit={handleCreate} className="bg-white rounded-2xl shadow-sm p-6 mb-8 space-y-4">
        <h2 className="text-lg font-semibold text-gray-700">Create New Coupon</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {field('code', 'Coupon Code *', 'text', 'e.g. SILK20')}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type *</label>
            <div className="flex gap-3 mt-1">
              {[{ v: 'percent', label: '% Percentage off' }, { v: 'flat', label: '₹ Flat amount off' }].map(opt => (
                <label key={opt.v} className={`flex-1 flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${form.type === opt.v ? 'border-brand bg-red-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <input type="radio" name="type" value={opt.v} checked={form.type === opt.v} onChange={() => setForm(f => ({ ...f, type: opt.v }))} className="accent-brand" />
                  <span className="text-sm font-medium">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {form.type === 'percent' ? 'Percentage Off (%) *' : 'Amount Off (₹) *'}
            </label>
            <input
              type="number"
              min="1"
              max={form.type === 'percent' ? 100 : undefined}
              value={form.value}
              onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
              placeholder={form.type === 'percent' ? 'e.g. 20' : 'e.g. 200'}
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-brand"
            />
          </div>
        </div>

        {/* Advanced options toggle */}
        <button
          type="button"
          onClick={() => setShowAdvanced(v => !v)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          Advanced options
        </button>

        {showAdvanced && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-gray-100">
            {field('minOrderAmount', 'Min Order Amount (₹)', 'number', '0 = no minimum')}
            {field('usageLimit', 'Max Uses', 'number', 'Leave blank for unlimited')}
            {field('expiresAt', 'Expiry Date', 'date')}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-brand text-white rounded-xl py-2.5 font-semibold hover:bg-red-700 disabled:opacity-60 transition-colors"
        >
          {saving ? 'Creating…' : 'Create Coupon'}
        </button>
      </form>

      {/* Coupon list */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <h2 className="text-lg font-semibold text-gray-700 p-6 border-b border-gray-100">All Coupons</h2>
        {coupons.length === 0 ? (
          <p className="text-gray-400 text-center py-12">No coupons yet. Create your first one above.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {coupons.map(coupon => (
              <div key={coupon._id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-gray-800">{coupon.code}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${coupon.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {coupon.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 mt-0.5">
                      {coupon.type === 'percent' ? `${coupon.value}% off` : `₹${coupon.value} off`}
                      {coupon.minOrderAmount > 0 && ` · min ₹${coupon.minOrderAmount}`}
                      {coupon.expiresAt && ` · expires ${new Date(coupon.expiresAt).toLocaleDateString('en-IN')}`}
                      {` · used ${coupon.usedCount}${coupon.usageLimit ? `/${coupon.usageLimit}` : ''} times`}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleActive(coupon)}
                    className="text-gray-400 hover:text-brand transition-colors"
                    title={coupon.active ? 'Deactivate' : 'Activate'}
                  >
                    {coupon.active ? <ToggleRight className="w-6 h-6 text-green-500" /> : <ToggleLeft className="w-6 h-6" />}
                  </button>
                  <button
                    onClick={() => handleDelete(coupon._id)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete coupon"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {dialog}
    </div>
  );
}
