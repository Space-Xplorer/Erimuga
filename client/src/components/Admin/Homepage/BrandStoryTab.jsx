import { useState, useEffect } from 'react';
import axios from '../../../config/axios';
import toast from 'react-hot-toast';
import { ToggleLeft, ToggleRight, ImagePlus } from 'lucide-react';

const EMPTY = {
  brandStoryHeading: '',
  brandStoryBody: '',
  brandStoryCtaLabel: '',
  brandStoryCtaLink: '',
  categoryHeading: '',
  categorySubtext: '',
};

export default function BrandStoryTab() {
  const [form, setForm] = useState(EMPTY);
  const [enabled, setEnabled] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    axios.get('/homepage/settings')
      .then((res) => {
        const s = res.data;
        setForm({
          brandStoryHeading: s.brandStory?.heading || '',
          brandStoryBody: s.brandStory?.body || '',
          brandStoryCtaLabel: s.brandStory?.ctaLabel || '',
          brandStoryCtaLink: s.brandStory?.ctaLink || '',
          categoryHeading: s.categorySection?.heading || '',
          categorySubtext: s.categorySection?.subtext || '',
        });
        setEnabled(Boolean(s.brandStory?.enabled));
        setImageUrl(s.brandStory?.imageUrl || '');
      })
      .catch(() => toast.error('Failed to load homepage settings'))
      .finally(() => setLoading(false));
  }, []);

  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    const loadId = toast.loading('Saving…');
    try {
      // Always multipart: the same endpoint handles text and the optional image,
      // so there's no second request just for the picture.
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      data.append('brandStoryEnabled', String(enabled));
      if (imageFile) data.append('image', imageFile);

      const res = await axios.put('/homepage/settings', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.dismiss(loadId);
      toast.success('Saved');
      setImageUrl(res.data.settings?.brandStory?.imageUrl || imageUrl);
      setImageFile(null);
      setPreview('');
    } catch (err) {
      toast.dismiss(loadId);
      toast.error(err.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const field = (key, label, placeholder = '') => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type="text"
        value={form[key]}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        placeholder={placeholder}
        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-brand focus:border-brand focus:outline-none"
      />
    </div>
  );

  if (loading) return <p className="text-center py-16 text-gray-400">Loading…</p>;

  const shown = preview || imageUrl;

  return (
    <form onSubmit={save} className="space-y-6">
      {/* Collections heading -------------------------------------------- */}
      <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-700">Collections Heading</h2>
        <p className="text-sm text-gray-500 -mt-2">
          Sits above the category bands. Leave both blank to show no heading at all.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {field('categoryHeading', 'Heading', 'e.g. The Collections')}
          {field('categorySubtext', 'Subtext', 'Optional supporting line')}
        </div>
      </div>

      {/* Brand story ---------------------------------------------------- */}
      <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-700">Brand Story</h2>
            <p className="text-sm text-gray-500">
              The block that makes the site feel like a person rather than a shop.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setEnabled((v) => !v)}
            className="text-gray-400 hover:text-brand transition-colors shrink-0"
            title={enabled ? 'Hide from homepage' : 'Show on homepage'}
          >
            {enabled
              ? <ToggleRight className="w-7 h-7 text-green-500" />
              : <ToggleLeft className="w-7 h-7" />}
          </button>
        </div>

        {!enabled && (
          <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
            Currently hidden. Turn the switch on to show it on the homepage.
          </p>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
          {shown && <img src={shown} alt="" className="w-40 aspect-4/5 object-cover rounded-lg mb-2" />}
          <input id="storyImgInput" type="file" accept="image/*" onChange={handleImage} className="hidden" />
          <button
            type="button"
            onClick={() => document.getElementById('storyImgInput').click()}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 text-sm font-medium"
          >
            <ImagePlus className="w-4 h-4" /> {shown ? 'Replace Image' : 'Choose Image'}
          </button>
        </div>

        {field('brandStoryHeading', 'Heading', 'e.g. Woven by hand, in Assam')}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Body</label>
          <textarea
            rows={6}
            value={form.brandStoryBody}
            onChange={(e) => setForm((f) => ({ ...f, brandStoryBody: e.target.value }))}
            placeholder="Tell the story — who weaves these, where, and why it matters. Line breaks are kept."
            className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-brand focus:border-brand focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {field('brandStoryCtaLabel', 'Link Label', 'e.g. Read our story')}
          {field('brandStoryCtaLink', 'Link Target', 'e.g. /about')}
        </div>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full bg-brand text-white rounded-xl py-3 font-semibold hover:opacity-90 disabled:opacity-60 transition"
      >
        {saving ? 'Saving…' : 'Save Changes'}
      </button>
    </form>
  );
}
