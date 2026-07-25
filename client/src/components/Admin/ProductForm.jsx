import { useEffect, useState } from 'react';
import axios from '../../config/axios';
import toast from 'react-hot-toast';
import { HelpCircle } from 'lucide-react';

const Tip = ({ text }) => (
  <span className="group relative inline-block ml-1 cursor-help">
    <HelpCircle className="w-3.5 h-3.5 text-gray-400 inline" />
    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block w-52 text-xs bg-gray-800 text-white rounded-lg p-2 z-10 shadow-lg">
      {text}
    </span>
  </span>
);

/**
 * Category picker. `options` are `{ value, label }` pairs so the form can send
 * slugs while showing display names. Creating new categories now happens in the
 * Category Manager, which is the only place that knows the parent relationship.
 */
const CategorySelect = ({ label, value, options, onChange, tip, disabled, disabledHint, required = true }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}{required && ' *'} {tip && <Tip text={tip} />}
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-brand focus:border-brand disabled:bg-gray-100 disabled:text-gray-400"
    >
      <option value="">{disabled && disabledHint ? disabledHint : `Select ${label}`}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

/** Multi-select tag input with create-on-type. Tags are optional. */
const TagInput = ({ selected, options, onChange, onCreate }) => {
  const [draft, setDraft] = useState('');

  const add = async (name) => {
    const clean = name.trim();
    if (!clean) return;
    if (!selected.some((t) => t.toLowerCase() === clean.toLowerCase())) {
      onChange([...selected, clean]);
      // Register unknown tags in the shared vocabulary so they're offered next time.
      if (!options.some((o) => o.toLowerCase() === clean.toLowerCase())) {
        await onCreate(clean).catch(() => {});
      }
    }
    setDraft('');
  };

  const unused = options.filter((o) => !selected.some((s) => s.toLowerCase() === o.toLowerCase()));

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Tags <Tip text="Optional cross-cutting labels like Eri Silk or Organic Dye. Unrelated to the category tree." />
      </label>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selected.map((tag) => (
            <span key={tag} className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-sm text-gray-700">
              {tag}
              <button
                type="button"
                onClick={() => onChange(selected.filter((t) => t !== tag))}
                className="text-gray-400 hover:text-red-600"
                aria-label={`Remove ${tag}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); add(draft); }
          }}
          placeholder="Type a tag and press Enter"
          className="flex-1 border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-brand focus:border-brand"
        />
        <button
          type="button"
          onClick={() => add(draft)}
          className="text-sm text-brand border border-brand px-3 py-1.5 rounded-lg hover:bg-red-50 whitespace-nowrap"
        >
          Add
        </button>
      </div>

      {unused.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {unused.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => add(tag)}
              className="rounded-full border border-gray-300 px-2.5 py-0.5 text-xs text-gray-500 hover:border-gray-500 hover:text-gray-700"
            >
              + {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const buildVariantGrid = (sizesStr, colorsStr, existing = []) => {
  const sizes = sizesStr ? sizesStr.split(',').map(s => s.trim()).filter(Boolean) : [''];
  const colors = colorsStr ? colorsStr.split(',').map(c => c.trim()).filter(Boolean) : [''];
  const grid = [];
  for (const size of sizes) {
    for (const color of colors) {
      const prev = existing.find(v => v.size === size && v.color === color);
      grid.push({ size, color, stock: prev ? prev.stock : 0 });
    }
  }
  return grid;
};

const newBlockKey = () => (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2));

const emptyColorBlock = () => ({
  key: newBlockKey(),
  name: '',
  swatchHex: '#cccccc',
  existingImages: [],
  newFiles: [],
  newPreviews: [],
});

export default function ProductForm({ initialData = null, onSuccess, submitLabel = 'Save Product' }) {
  const isEdit = !!initialData;

  // Categories arrive as a tree; subcategories are read off the selected parent.
  const [categories, setCategories] = useState([]);
  const [tagOptions, setTagOptions] = useState([]);
  const [tags, setTags] = useState([]);
  const [form, setForm] = useState({
    name: '',
    category: '',      // main category slug
    subcategory: '',   // subcategory slug, scoped to the selected main category
    price: '',
    availableSizes: '',
    description: '',
    isBestSeller: false,
  });
  const [colorBlocks, setColorBlocks] = useState([emptyColorBlock()]);
  const [variants, setVariants] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const fetchMeta = async () => {
    try {
      const [catRes, tagRes] = await Promise.all([
        axios.get('/categories'),
        axios.get('/categories/tags'),
      ]);
      setCategories(catRes.data || []);
      setTagOptions((tagRes.data || []).map((t) => t.name));
    } catch { /* silently fail */ }
  };

  useEffect(() => { fetchMeta(); }, []);

  const selectedCategory = categories.find((c) => c.slug === form.category);
  const subcategoryOptions = (selectedCategory?.subcategories || [])
    .map((s) => ({ value: s.slug, label: s.name }));

  useEffect(() => {
    if (!initialData) return;

    const sizesStr = (initialData.availableSizes || []).join(', ');
    setForm({
      name: initialData.name || '',
      category: initialData.mainCategory || '',
      subcategory: initialData.subcategory || '',
      price: initialData.price?.toString() || '',
      availableSizes: sizesStr,
      description: initialData.description || '',
      isBestSeller: initialData.isBestSeller === 'yes',
    });
    setTags(initialData.tags || []);

    let blocks;
    if (initialData.colors && initialData.colors.length > 0) {
      blocks = initialData.colors.map((c) => ({
        key: newBlockKey(),
        name: c.name || '',
        swatchHex: c.swatchHex || '#cccccc',
        existingImages: c.images || [],
        newFiles: [],
        newPreviews: [],
      }));
    } else {
      // Un-migrated product: bucket its flat image list under a single colour so nothing is lost
      blocks = [{
        key: newBlockKey(),
        name: (initialData.availableColors || [])[0] || 'Default',
        swatchHex: '#cccccc',
        existingImages: (initialData.image || []).map((url) => ({ url, public_id: null })),
        newFiles: [],
        newPreviews: [],
      }];
    }
    setColorBlocks(blocks);
    setVariants(buildVariantGrid(sizesStr, blocks.map((b) => b.name).filter(Boolean).join(','), initialData.variants || []));
  }, [initialData]);

  // Rebuild variant grid whenever sizes or colour names change, preserving existing stock values
  useEffect(() => {
    const colorsCsv = colorBlocks.map((b) => b.name).filter(Boolean).join(',');
    setVariants((prev) => buildVariantGrid(form.availableSizes, colorsCsv, prev));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.availableSizes, colorBlocks.map((b) => b.name).join('|')]);

  const createTag = async (name) => {
    await axios.post('/categories/tags', { name });
    await fetchMeta();
  };

  const updateBlock = (key, patch) => {
    setColorBlocks((prev) => prev.map((b) => (b.key === key ? { ...b, ...patch } : b)));
  };

  const addColorBlock = () => setColorBlocks((prev) => [...prev, emptyColorBlock()]);

  const removeColorBlock = (key) => {
    setColorBlocks((prev) => (prev.length > 1 ? prev.filter((b) => b.key !== key) : prev));
  };

  const handleColorFiles = (key, files) => {
    const selected = Array.from(files);
    updateBlock(key, {
      newFiles: [...(colorBlocks.find((b) => b.key === key)?.newFiles || []), ...selected],
      newPreviews: [
        ...(colorBlocks.find((b) => b.key === key)?.newPreviews || []),
        ...selected.map((f) => URL.createObjectURL(f)),
      ],
    });
  };

  const removeNewImage = (key, idx) => {
    const block = colorBlocks.find((b) => b.key === key);
    if (!block) return;
    updateBlock(key, {
      newFiles: block.newFiles.filter((_, i) => i !== idx),
      newPreviews: block.newPreviews.filter((_, i) => i !== idx),
    });
  };

  const removeExistingImage = (key, idx) => {
    const block = colorBlocks.find((b) => b.key === key);
    if (!block) return;
    updateBlock(key, { existingImages: block.existingImages.filter((_, i) => i !== idx) });
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Product name is required';
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0) e.price = 'Price must be a positive number';
    if (!form.category) e.category = 'Category is required';
    if (!form.subcategory) e.subcategory = 'Subcategory is required';

    const namedBlocks = colorBlocks.filter((b) => b.name.trim());
    if (namedBlocks.length === 0) e.colors = 'Add at least one colour';

    const names = namedBlocks.map((b) => b.name.trim().toLowerCase());
    if (new Set(names).size !== names.length) e.colors = 'Colour names must be unique';

    const totalImages = colorBlocks.reduce((sum, b) => sum + b.existingImages.length + b.newFiles.length, 0);
    if (!isEdit && totalImages === 0) e.images = 'Please add at least one product image';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) { toast.error('Please fix the errors below'); return; }

    setSubmitting(true);
    const loadId = toast.loading(isEdit ? 'Saving changes…' : 'Adding product…');

    try {
      const namedBlocks = colorBlocks.filter((b) => b.name.trim());

      const data = new FormData();
      data.append('name', form.name);
      data.append('mainCategory', form.category);
      data.append('subcategory', form.subcategory);
      data.append('tags', JSON.stringify(tags));
      data.append('price', form.price);
      data.append('availableSizes', form.availableSizes);
      data.append('availableColors', namedBlocks.map((b) => b.name.trim()).join(','));
      data.append('description', form.description);
      data.append('isBestSeller', form.isBestSeller ? 'yes' : 'no');
      if (variants.length > 0) data.append('variants', JSON.stringify(variants));

      const colorsMeta = namedBlocks.map((b) => ({
        name: b.name.trim(),
        swatchHex: b.swatchHex,
        existingImages: b.existingImages,
      }));
      data.append('colorsMeta', JSON.stringify(colorsMeta));

      const imageColorIndex = [];
      namedBlocks.forEach((b, idx) => {
        b.newFiles.forEach((file) => {
          data.append('images', file);
          imageColorIndex.push(idx);
        });
      });
      data.append('imageColorIndex', JSON.stringify(imageColorIndex));

      if (isEdit) {
        await axios.put(`/admin/edit-product/${initialData._id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await axios.post('/admin/add-product', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      }

      toast.dismiss(loadId);
      toast.success(isEdit ? 'Product updated!' : 'Product added!');
      onSuccess?.();

      if (!isEdit) {
        setForm({ name: '', category: '', subcategory: '', price: '', availableSizes: '', description: '', isBestSeller: false });
        setTags([]);
        setColorBlocks([emptyColorBlock()]);
      }
    } catch (err) {
      toast.dismiss(loadId);
      toast.error(err.response?.data?.error || (isEdit ? 'Failed to update product' : 'Failed to add product'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-md space-y-5 my-8">
      <h2 className="text-2xl font-bold text-gray-800">{isEdit ? 'Edit Product' : 'Add New Product'}</h2>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
        {errors.name && <p className="text-red-500 text-xs mb-1">{errors.name}</p>}
        <input
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          placeholder="e.g. Red Raw Silk Saree"
          className={`w-full border rounded-xl p-3 focus:ring-2 focus:ring-brand focus:border-brand ${errors.name ? 'border-red-400' : 'border-gray-300'}`}
        />
      </div>

      {/* Category */}
      {errors.category && <p className="text-red-500 text-xs -mt-3">{errors.category}</p>}
      <CategorySelect
        label="Category"
        value={form.category}
        options={categories.map((c) => ({ value: c.slug, label: c.name }))}
        // Changing the parent invalidates the current subcategory, so clear it
        // rather than let a mismatched pair reach the server.
        onChange={(v) => setForm((f) => ({ ...f, category: v, subcategory: '' }))}
        tip="The main collection, e.g. Sarees, Shawls. Managed in Categories."
      />

      {/* Subcategory — scoped to the selected category */}
      {errors.subcategory && <p className="text-red-500 text-xs">{errors.subcategory}</p>}
      <CategorySelect
        label="Subcategory"
        value={form.subcategory}
        options={subcategoryOptions}
        onChange={(v) => setForm((f) => ({ ...f, subcategory: v }))}
        disabled={!form.category || subcategoryOptions.length === 0}
        disabledHint={
          !form.category
            ? 'Choose a category first'
            : `${selectedCategory?.name} has no subcategories yet`
        }
        tip="Belongs to the category above. Add more in Categories."
      />

      {/* Tags — optional, independent of the category tree */}
      <TagInput
        selected={tags}
        options={tagOptions}
        onChange={setTags}
        onCreate={createTag}
      />

      {/* Price */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Price (₹) * <Tip text="The selling price in Indian Rupees" />
        </label>
        {errors.price && <p className="text-red-500 text-xs mb-1">{errors.price}</p>}
        <input
          type="number"
          min="1"
          value={form.price}
          onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
          placeholder="e.g. 2500"
          className={`w-full border rounded-xl p-3 focus:ring-2 focus:ring-brand ${errors.price ? 'border-red-400' : 'border-gray-300'}`}
        />
      </div>

      {/* Sizes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Available Sizes <Tip text="Type sizes separated by commas. For fabrics: 1m,2m,5m. For clothing: S,M,L,XL" />
        </label>
        <input
          type="text"
          value={form.availableSizes}
          onChange={e => setForm(f => ({ ...f, availableSizes: e.target.value }))}
          placeholder="e.g. S,M,L,XL  or  1m,2m,5m"
          className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-brand"
        />
        <p className="text-xs text-gray-400 mt-1">Separate each size with a comma</p>
      </div>

      {/* Colours + per-colour images */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-gray-700">
            Colours &amp; Images * <Tip text="Add each colour the product comes in, with its own photos. Shoppers will see the matching photos when they pick a colour." />
          </label>
          <button type="button" onClick={addColorBlock} className="text-sm text-brand border border-brand px-3 py-1 rounded-lg hover:bg-red-50">
            + Add Colour
          </button>
        </div>
        {errors.colors && <p className="text-red-500 text-xs mb-2">{errors.colors}</p>}
        {errors.images && <p className="text-red-500 text-xs mb-2">{errors.images}</p>}

        <div className="space-y-4">
          {colorBlocks.map((block) => (
            <div key={block.key} className="border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <input
                  type="color"
                  value={/^#[0-9a-fA-F]{6}$/.test(block.swatchHex) ? block.swatchHex : '#cccccc'}
                  onChange={(e) => updateBlock(block.key, { swatchHex: e.target.value })}
                  className="w-9 h-9 rounded border border-gray-300 cursor-pointer"
                  title="Swatch colour shown to shoppers"
                />
                <input
                  type="text"
                  value={block.name}
                  onChange={(e) => updateBlock(block.key, { name: e.target.value })}
                  placeholder="Colour name, e.g. Rust"
                  className="flex-1 border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-brand focus:border-brand"
                />
                {colorBlocks.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeColorBlock(block.key)}
                    className="text-sm text-red-600 hover:text-red-700 px-2"
                  >
                    Remove
                  </button>
                )}
              </div>

              {block.existingImages.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {block.existingImages.map((img, i) => (
                    <div key={img.public_id || img.url || i} className="relative group">
                      <img src={img.url} alt="" className="w-20 h-20 object-cover rounded-lg border border-gray-200" />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(block.key, i)}
                        className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {block.newPreviews.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {block.newPreviews.map((src, i) => (
                    <div key={src} className="relative group">
                      <img src={src} alt="" className="w-20 h-20 object-cover rounded-lg border border-gray-200" />
                      <button
                        type="button"
                        onClick={() => removeNewImage(block.key, i)}
                        className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <input
                id={`imgInput-${block.key}`}
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleColorFiles(block.key, e.target.files)}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => document.getElementById(`imgInput-${block.key}`).click()}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 text-sm font-medium"
              >
                📁 Add photos for this colour
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Variant Stock Grid */}
      {variants.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Stock per Size &amp; Colour <Tip text="Enter how many you have in your shop right now for each size and colour combination." />
          </label>
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-3 py-2 font-medium text-gray-600">Size</th>
                  <th className="text-left px-3 py-2 font-medium text-gray-600">Colour</th>
                  <th className="text-left px-3 py-2 font-medium text-gray-600">Qty in Stock</th>
                </tr>
              </thead>
              <tbody>
                {variants.map((v, i) => (
                  <tr key={`${v.size}-${v.color}`} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-3 py-2 text-gray-700">{v.size || '—'}</td>
                    <td className="px-3 py-2 text-gray-700">{v.color || '—'}</td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min="0"
                        value={v.stock}
                        onChange={e => {
                          const val = Math.max(0, Number(e.target.value));
                          setVariants(prev => prev.map((row, ri) => ri === i ? { ...row, stock: val } : row));
                        }}
                        className="w-24 border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-brand focus:border-brand"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          placeholder="Describe this product — material, weave, use, etc."
          rows={4}
          className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-brand"
        />
      </div>

      {/* Best Seller */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={form.isBestSeller}
          onChange={e => setForm(f => ({ ...f, isBestSeller: e.target.checked }))}
          className="accent-brand w-4 h-4"
        />
        <span className="text-sm text-gray-700 font-medium">
          Mark as Best Seller <Tip text="Best Sellers are highlighted on the home page" />
        </span>
      </label>

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-brand text-white rounded-xl py-3 font-semibold hover:bg-red-700 disabled:opacity-60 transition-colors"
      >
        {submitting ? 'Saving…' : submitLabel}
      </button>
    </form>
  );
}
