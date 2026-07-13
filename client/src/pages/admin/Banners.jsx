import { useState, useEffect } from 'react';
import axios from '../../config/axios';
import toast from 'react-hot-toast';
import { ToggleLeft, ToggleRight, Trash2, ImagePlus } from 'lucide-react';
import { useConfirmDialog } from '../../components/ConfirmDialog';

const EMPTY_FORM = { heading: '', subtext: '', ctaLabel: '', ctaLink: '', order: 0 };

export default function Banners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const { confirm, dialog } = useConfirmDialog();

  const fetchBanners = async () => {
    try {
      const res = await axios.get('/banners/admin/all');
      setBanners(res.data);
    } catch {
      toast.error('Failed to load banners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBanners(); }, []);

  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!imageFile) return toast.error('Please choose a slide image');

    setSaving(true);
    const loadId = toast.loading('Adding slide…');
    try {
      const data = new FormData();
      data.append('image', imageFile);
      Object.entries(form).forEach(([k, v]) => data.append(k, v));

      await axios.post('/banners', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.dismiss(loadId);
      toast.success('Slide added!');
      setForm(EMPTY_FORM);
      setImageFile(null);
      setPreview('');
      fetchBanners();
    } catch (err) {
      toast.dismiss(loadId);
      toast.error(err.response?.data?.error || 'Failed to add slide');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (banner) => {
    try {
      await axios.put(`/banners/${banner._id}`, { isActive: !banner.isActive });
      setBanners(prev => prev.map(b => b._id === banner._id ? { ...b, isActive: !b.isActive } : b));
      toast.success(banner.isActive ? 'Slide hidden from homepage' : 'Slide is now live');
    } catch {
      toast.error('Failed to update slide');
    }
  };

  const handleDelete = async (id) => {
    const ok = await confirm('Delete this slide? This cannot be undone.', { confirmLabel: 'Delete' });
    if (!ok) return;
    try {
      await axios.delete(`/banners/${id}`);
      setBanners(prev => prev.filter(b => b._id !== id));
      toast.success('Slide deleted');
    } catch {
      toast.error('Failed to delete slide');
    }
  };

  const field = (key, label, placeholder = '') => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type="text"
        value={form[key]}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        placeholder={placeholder}
        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#b22222] focus:border-[#b22222]"
      />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2 text-gray-800">Homepage Carousel</h1>
      <p className="text-sm text-gray-500 mb-8">
        Manage the slides shown at the top of the homepage — great for seasonal sales or new collection launches.
      </p>

      {/* Create form */}
      <form onSubmit={handleCreate} className="bg-white rounded-2xl shadow-sm p-6 mb-8 space-y-4">
        <h2 className="text-lg font-semibold text-gray-700">Add New Slide</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Slide Image *</label>
          {preview && <img src={preview} alt="" className="w-full h-40 object-cover rounded-lg mb-2" />}
          <input id="bannerImgInput" type="file" accept="image/*" onChange={handleImage} className="hidden" />
          <button
            type="button"
            onClick={() => document.getElementById('bannerImgInput').click()}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 text-sm font-medium"
          >
            <ImagePlus className="w-4 h-4" /> {imageFile ? 'Change Image' : 'Choose Image'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {field('heading', 'Heading', 'e.g. Festive Sale — Up to 30% Off')}
          {field('subtext', 'Subtext', 'Short supporting line')}
          {field('ctaLabel', 'Button Label', 'e.g. Shop Now')}
          {field('ctaLink', 'Button Link', 'e.g. /collection')}
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-[#b22222] text-white rounded-xl py-2.5 font-semibold hover:bg-red-700 disabled:opacity-60 transition-colors"
        >
          {saving ? 'Adding…' : 'Add Slide'}
        </button>
      </form>

      {/* Slide list */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <h2 className="text-lg font-semibold text-gray-700 p-6 border-b border-gray-100">All Slides</h2>
        {loading ? (
          <p className="text-gray-400 text-center py-12">Loading…</p>
        ) : banners.length === 0 ? (
          <p className="text-gray-400 text-center py-12">No slides yet. Add your first one above.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {banners.map(banner => (
              <div key={banner._id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50">
                <img src={banner.imageUrl} alt="" className="w-20 h-14 object-cover rounded-lg shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-800 truncate">{banner.heading?.replace('\n', ' ') || 'Untitled slide'}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${banner.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {banner.isActive ? 'Live' : 'Hidden'}
                    </span>
                  </div>
                  {banner.subtext && <div className="text-sm text-gray-500 truncate">{banner.subtext}</div>}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => toggleActive(banner)}
                    className="text-gray-400 hover:text-[#b22222] transition-colors"
                    title={banner.isActive ? 'Hide from homepage' : 'Show on homepage'}
                  >
                    {banner.isActive ? <ToggleRight className="w-6 h-6 text-green-500" /> : <ToggleLeft className="w-6 h-6" />}
                  </button>
                  <button
                    onClick={() => handleDelete(banner._id)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete slide"
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
