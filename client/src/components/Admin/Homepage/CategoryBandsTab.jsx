import { useState, useEffect } from 'react';
import axios from '../../../config/axios';
import toast from 'react-hot-toast';
import {
  ToggleLeft, ToggleRight, ImagePlus, ArrowUp, ArrowDown, X, Search, GripVertical,
} from 'lucide-react';
import { getProductThumbnail } from '../../../utils/productImage';
import useDragSort from '../../../hooks/useDragSort';

// Moves item at `from` to `to`, returning a new array.
const reorder = (arr, from, to) => {
  const next = [...arr];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
};

/**
 * Per-category homepage presentation: visibility, editorial image, order,
 * tagline, and the hand-picked product rail.
 *
 * Reordering supports both drag (desktop) and up/down buttons (touch).
 */
export default function CategoryBandsTab() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);
  const [search, setSearch] = useState('');
  const [savingId, setSavingId] = useState(null);

  // Hand-picked ids, keyed by category. Held locally so the admin can reorder
  // and toggle freely, then commit with "Save featured pieces".
  const [featured, setFeatured] = useState({});

  const load = async () => {
    try {
      // `all: true` is the admin view — it includes hidden categories and the
      // raw featuredProducts list.
      const [catRes, prodRes] = await Promise.all([
        axios.get('/categories', { params: { all: true } }),
        axios.get('/admin/products'),
      ]);
      setCategories(catRes.data);
      setProducts(prodRes.data);
      setFeatured(
        catRes.data.reduce((acc, c) => {
          acc[c._id] = (c.featuredProducts || []).map(String);
          return acc;
        }, {})
      );
    } catch {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const patch = async (cat, body, { silent } = {}) => {
    setSavingId(cat._id);
    try {
      const isForm = body instanceof FormData;
      await axios.put(`/categories/${cat._id}`, body, isForm
        ? { headers: { 'Content-Type': 'multipart/form-data' } }
        : undefined);
      if (!silent) toast.success('Saved');
      await load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save');
    } finally {
      setSavingId(null);
    }
  };

  const toggleHomepage = (cat) =>
    patch(cat, { showOnHomepage: !cat.showOnHomepage });

  const uploadImage = async (cat, file) => {
    if (!file) return;
    const data = new FormData();
    data.append('image', file);
    await patch(cat, data);
  };

  const reorderCategories = async (from, to) => {
    if (from === to || to < 0 || to >= categories.length) return;
    const next = reorder(categories, from, to);
    setCategories(next); // optimistic, so the list doesn't jump on slow networks
    try {
      await axios.put('/categories/reorder', { order: next.map((c) => c._id) });
    } catch {
      toast.error('Failed to reorder');
      load();
    }
  };
  const move = (index, direction) => reorderCategories(index, index + direction);

  const saveTagline = (cat, tagline) => patch(cat, { tagline });

  const toggleFeatured = (cat, productId) => {
    const current = featured[cat._id] || [];
    const next = current.includes(productId)
      ? current.filter((id) => id !== productId)
      : [...current, productId];
    setFeatured((f) => ({ ...f, [cat._id]: next }));
  };

  const reorderFeatured = (cat, from, to) => {
    const current = featured[cat._id] || [];
    if (from === to || to < 0 || to >= current.length) return;
    setFeatured((f) => ({ ...f, [cat._id]: reorder(current, from, to) }));
  };
  const moveFeatured = (cat, index, direction) => reorderFeatured(cat, index, index + direction);

  const saveFeatured = (cat) =>
    patch(cat, { featuredProducts: JSON.stringify(featured[cat._id] || []) });

  const productsIn = (cat) =>
    products.filter((p) => p.mainCategory === cat.slug);

  const byId = (id) => products.find((p) => p._id === id);

  // Drag reordering. Only one band editor is open at a time, so a single hook
  // covers the open band's featured list.
  const catDrag = useDragSort(categories.length, reorderCategories);
  const openCat = categories.find((c) => c._id === openId);
  const featDrag = useDragSort(
    (featured[openId] || []).length,
    (from, to) => openCat && reorderFeatured(openCat, from, to)
  );

  if (loading) return <p className="text-center py-16 text-gray-400">Loading…</p>;

  if (categories.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-10 text-center">
        <p className="text-gray-500">
          No categories yet. Create them in <span className="font-medium">Categories</span> first.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {categories.map((cat, index) => {
        const isOpen = openId === cat._id;
        const picks = featured[cat._id] || [];
        const available = productsIn(cat);
        const filtered = search
          ? available.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
          : available;

        return (
          <div
            key={cat._id}
            // Only draggable while collapsed — dragging an expanded card would
            // hijack mousedown on its text inputs.
            {...(isOpen ? {} : catDrag.dragProps(index))}
            className={`bg-white rounded-2xl shadow-sm overflow-hidden transition ${
              catDrag.isDragging(index) ? 'opacity-40' : ''
            } ${catDrag.isOver(index) ? 'ring-2 ring-brand' : ''}`}
          >
            {/* Row header ------------------------------------------------- */}
            <div className="flex items-center gap-4 px-5 py-4">
              <div className="flex flex-col items-center">
                <GripVertical
                  className={`w-4 h-4 text-gray-300 mb-1 ${isOpen ? 'opacity-30' : 'cursor-grab'}`}
                  title={isOpen ? 'Close to reorder' : 'Drag to reorder'}
                />
                <button
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  className="text-ink-muted hover:text-ink disabled:opacity-25"
                  aria-label="Move up"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => move(index, 1)}
                  disabled={index === categories.length - 1}
                  className="text-ink-muted hover:text-ink disabled:opacity-25"
                  aria-label="Move down"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {cat.homepageImage?.url ? (
                <img src={cat.homepageImage.url} alt="" className="w-14 h-16 object-cover rounded shrink-0" />
              ) : (
                <div className="w-14 h-16 rounded bg-gray-100 flex items-center justify-center shrink-0">
                  <ImagePlus className="w-4 h-4 text-gray-300" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-800">{cat.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    cat.showOnHomepage ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {cat.showOnHomepage ? 'On homepage' : 'Hidden'}
                  </span>
                  {!cat.homepageImage?.url && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
                      No image
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 truncate">
                  {cat.tagline || <span className="italic text-gray-400">No tagline</span>}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {picks.length > 0
                    ? `${picks.length} hand-picked`
                    : `Automatic — newest of ${available.length}`}
                </p>
              </div>

              <button
                onClick={() => toggleHomepage(cat)}
                disabled={savingId === cat._id}
                className="text-gray-400 hover:text-brand transition-colors shrink-0"
                title={cat.showOnHomepage ? 'Hide from homepage' : 'Show on homepage'}
              >
                {cat.showOnHomepage
                  ? <ToggleRight className="w-6 h-6 text-green-500" />
                  : <ToggleLeft className="w-6 h-6" />}
              </button>

              <button
                onClick={() => { setOpenId(isOpen ? null : cat._id); setSearch(''); }}
                className="text-sm font-medium text-brand hover:underline shrink-0"
              >
                {isOpen ? 'Close' : 'Edit'}
              </button>
            </div>

            {/* Editor ----------------------------------------------------- */}
            {isOpen && (
              <div className="border-t border-gray-100 bg-gray-50/60 px-5 py-5 space-y-6">
                {/* Image + tagline */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Editorial image
                    </label>
                    <p className="text-xs text-gray-400 mb-2">
                      Tall works best — roughly 4:5, at least 1000px wide.
                    </p>
                    <input
                      id={`catimg-${cat._id}`}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => uploadImage(cat, e.target.files?.[0])}
                    />
                    <button
                      type="button"
                      onClick={() => document.getElementById(`catimg-${cat._id}`).click()}
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 text-sm font-medium"
                    >
                      <ImagePlus className="w-4 h-4" />
                      {cat.homepageImage?.url ? 'Replace image' : 'Upload image'}
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
                    <p className="text-xs text-gray-400 mb-2">One line, shown under the name.</p>
                    <input
                      defaultValue={cat.tagline}
                      onBlur={(e) => {
                        if (e.target.value !== cat.tagline) saveTagline(cat, e.target.value);
                      }}
                      placeholder="e.g. Handwoven in Eri silk, dyed with madder root."
                      className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-brand focus:outline-none"
                    />
                  </div>
                </div>

                {/* Featured picker */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Featured pieces
                  </label>
                  <p className="text-xs text-gray-400 mb-3">
                    Pick and order the products shown in this band. Leave empty to show the newest
                    automatically.
                  </p>

                  {picks.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {picks.map((id, i) => {
                        const p = byId(id);
                        return (
                          <div
                            key={id}
                            {...featDrag.dragProps(i)}
                            className={`flex items-center gap-3 bg-white border rounded-lg px-3 py-2 transition ${
                              featDrag.isDragging(i) ? 'opacity-40' : ''
                            } ${featDrag.isOver(i) ? 'border-brand ring-1 ring-brand' : 'border-gray-200'}`}
                          >
                            <GripVertical className="w-3.5 h-3.5 text-gray-300 shrink-0 cursor-grab" title="Drag to reorder" />
                            <span className="text-xs text-gray-400 w-4 shrink-0">{i + 1}</span>
                            {p ? (
                              <>
                                <img src={getProductThumbnail(p)} alt="" className="w-8 h-10 object-cover rounded shrink-0" />
                                <span className="text-sm text-gray-700 flex-1 truncate">{p.name}</span>
                              </>
                            ) : (
                              <span className="text-sm text-gray-400 italic flex-1">Product unavailable</span>
                            )}
                            <button onClick={() => moveFeatured(cat, i, -1)} disabled={i === 0}
                              className="text-ink-muted hover:text-ink disabled:opacity-25" aria-label="Move up">
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => moveFeatured(cat, i, 1)} disabled={i === picks.length - 1}
                              className="text-ink-muted hover:text-ink disabled:opacity-25" aria-label="Move down">
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => toggleFeatured(cat, id)}
                              className="text-gray-300 hover:text-red-600" aria-label="Remove">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="relative mb-3">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder={`Search ${cat.name} products…`}
                      className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-brand focus:outline-none"
                    />
                  </div>

                  {available.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">
                      No products in {cat.name} yet.
                    </p>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 max-h-64 overflow-y-auto p-1">
                      {filtered.map((p) => {
                        const selected = picks.includes(p._id);
                        return (
                          <button
                            key={p._id}
                            type="button"
                            onClick={() => toggleFeatured(cat, p._id)}
                            className={`text-left rounded-lg overflow-hidden border-2 transition ${
                              selected ? 'border-brand' : 'border-transparent hover:border-gray-300'
                            }`}
                          >
                            <img src={getProductThumbnail(p)} alt="" className="w-full aspect-3/4 object-cover" />
                            <span className="block px-1.5 py-1 text-[11px] leading-tight text-gray-600 truncate">
                              {p.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <button
                    onClick={() => saveFeatured(cat)}
                    disabled={savingId === cat._id}
                    className="mt-4 px-5 py-2 rounded-lg bg-brand text-white text-sm font-semibold hover:opacity-90 disabled:opacity-60 transition"
                  >
                    {savingId === cat._id ? 'Saving…' : 'Save featured pieces'}
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
