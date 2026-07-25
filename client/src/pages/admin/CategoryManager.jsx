import { useState, useEffect } from 'react';
import axios from '../../config/axios';
import toast from 'react-hot-toast';
import { ChevronDown, ChevronRight, Plus, Trash2, Pencil, Check, X, Tag as TagIcon } from 'lucide-react';
import { useConfirmDialog } from '../../components/ConfirmDialog';

/**
 * Catalogue structure: main categories, their subcategories, and the flat tag
 * vocabulary. Presentation (homepage image, order, featured picks) lives in the
 * Homepage Studio instead — this page is about what exists, not how it looks.
 */
export default function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [newCategory, setNewCategory] = useState('');
  const [newSub, setNewSub] = useState({});     // categoryId -> input value
  const [editing, setEditing] = useState(null); // { type, id, parentId, value }
  const [newTag, setNewTag] = useState('');
  const { confirm, dialog } = useConfirmDialog();

  const load = async () => {
    try {
      const [catRes, tagRes] = await Promise.all([
        axios.get('/categories', { params: { all: true } }),
        axios.get('/categories/tags'),
      ]);
      setCategories(catRes.data);
      setTags(tagRes.data);
    } catch {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // The API returns a clear message for guarded deletes (category still has
  // products/subcategories), so surface it rather than a generic failure.
  const explain = (err, fallback) => toast.error(err.response?.data?.error || fallback);

  const addCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    try {
      await axios.post('/categories', { name: newCategory.trim() });
      toast.success('Category added');
      setNewCategory('');
      load();
    } catch (err) { explain(err, 'Failed to add category'); }
  };

  const removeCategory = async (cat) => {
    const ok = await confirm(`Delete "${cat.name}"?`, { confirmLabel: 'Delete' });
    if (!ok) return;
    try {
      await axios.delete(`/categories/${cat._id}`);
      toast.success('Category deleted');
      load();
    } catch (err) { explain(err, 'Failed to delete category'); }
  };

  const addSubcategory = async (catId) => {
    const name = (newSub[catId] || '').trim();
    if (!name) return;
    try {
      await axios.post(`/categories/${catId}/subcategories`, { name });
      toast.success('Subcategory added');
      setNewSub((s) => ({ ...s, [catId]: '' }));
      load();
    } catch (err) { explain(err, 'Failed to add subcategory'); }
  };

  const removeSubcategory = async (catId, sub) => {
    const ok = await confirm(`Delete "${sub.name}"?`, { confirmLabel: 'Delete' });
    if (!ok) return;
    try {
      await axios.delete(`/categories/${catId}/subcategories/${sub._id}`);
      toast.success('Subcategory deleted');
      load();
    } catch (err) { explain(err, 'Failed to delete subcategory'); }
  };

  const saveRename = async () => {
    if (!editing?.value.trim()) return setEditing(null);
    try {
      if (editing.type === 'category') {
        await axios.put(`/categories/${editing.id}`, { name: editing.value.trim() });
      } else {
        await axios.put(`/categories/${editing.parentId}/subcategories/${editing.id}`, {
          name: editing.value.trim(),
        });
      }
      toast.success('Renamed');
      setEditing(null);
      load();
    } catch (err) { explain(err, 'Failed to rename'); }
  };

  const addTag = async (e) => {
    e.preventDefault();
    if (!newTag.trim()) return;
    try {
      await axios.post('/categories/tags', { name: newTag.trim() });
      setNewTag('');
      load();
    } catch (err) { explain(err, 'Failed to add tag'); }
  };

  const removeTag = async (tag) => {
    const ok = await confirm(`Delete the "${tag.name}" tag? It will be removed from all products.`, {
      confirmLabel: 'Delete',
    });
    if (!ok) return;
    try {
      await axios.delete(`/categories/tags/${tag._id}`);
      toast.success('Tag deleted');
      load();
    } catch (err) { explain(err, 'Failed to delete tag'); }
  };

  const renameInput = (onSave) => (
    <div className="flex items-center gap-1.5">
      <input
        autoFocus
        value={editing.value}
        onChange={(e) => setEditing((s) => ({ ...s, value: e.target.value }))}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onSave();
          if (e.key === 'Escape') setEditing(null);
        }}
        className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-brand focus:outline-none"
      />
      <button onClick={onSave} className="text-green-600 hover:text-green-700" title="Save">
        <Check className="w-4 h-4" />
      </button>
      <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-gray-600" title="Cancel">
        <X className="w-4 h-4" />
      </button>
    </div>
  );

  if (loading) return <p className="text-center py-20 text-gray-400">Loading…</p>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2 text-gray-800">Categories</h1>
      <p className="text-sm text-gray-500 mb-8">
        The catalogue structure. Every product belongs to one main category and one of its
        subcategories. Homepage images and ordering live in the Homepage Studio.
      </p>

      {/* Add category */}
      <form onSubmit={addCategory} className="flex gap-2 mb-6">
        <input
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="New main category"
          className="flex-1 border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-brand focus:outline-none"
        />
        <button
          type="submit"
          className="px-5 rounded-lg bg-brand text-white font-medium hover:opacity-90 transition"
        >
          Add
        </button>
      </form>

      {/* Tree */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden divide-y divide-gray-100">
        {categories.length === 0 && (
          <p className="text-gray-400 text-center py-12">
            No categories yet. Add Sarees, Mekhela, Chador and Shawls above.
          </p>
        )}

        {categories.map((cat) => {
          const isOpen = expanded[cat._id];
          return (
            <div key={cat._id}>
              <div className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50">
                <button
                  onClick={() => setExpanded((s) => ({ ...s, [cat._id]: !s[cat._id] }))}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label={isOpen ? 'Collapse' : 'Expand'}
                >
                  {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>

                <div className="flex-1 min-w-0">
                  {editing?.type === 'category' && editing.id === cat._id ? (
                    renameInput(saveRename)
                  ) : (
                    <>
                      <span className="font-medium text-gray-800">{cat.name}</span>
                      <span className="ml-2 text-xs text-gray-400">/{cat.slug}</span>
                      <span className="ml-2 text-xs text-gray-400">
                        · {cat.subcategories.length} subcategor{cat.subcategories.length === 1 ? 'y' : 'ies'}
                      </span>
                    </>
                  )}
                </div>

                <button
                  onClick={() => setEditing({ type: 'category', id: cat._id, value: cat.name })}
                  className="text-gray-400 hover:text-brand"
                  title="Rename"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => removeCategory(cat)}
                  className="text-gray-400 hover:text-red-600"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {isOpen && (
                <div className="bg-gray-50/70 px-5 py-4 pl-14 space-y-2">
                  {cat.subcategories.length === 0 && (
                    <p className="text-sm text-gray-400 italic">No subcategories yet.</p>
                  )}

                  {cat.subcategories.map((sub) => (
                    <div key={sub._id} className="flex items-center gap-3 group">
                      {editing?.type === 'sub' && editing.id === sub._id ? (
                        renameInput(saveRename)
                      ) : (
                        <>
                          <span className="text-sm text-gray-700">{sub.name}</span>
                          <span className="text-xs text-gray-400">/{sub.slug}</span>
                          <div className="flex-1" />
                          <button
                            onClick={() => setEditing({ type: 'sub', id: sub._id, parentId: cat._id, value: sub.name })}
                            className="text-gray-300 group-hover:text-gray-500 hover:text-brand!"
                            title="Rename"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => removeSubcategory(cat._id, sub)}
                            className="text-gray-300 group-hover:text-gray-500 hover:text-red-600!"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  ))}

                  <div className="flex gap-2 pt-2">
                    <input
                      value={newSub[cat._id] || ''}
                      onChange={(e) => setNewSub((s) => ({ ...s, [cat._id]: e.target.value }))}
                      onKeyDown={(e) => e.key === 'Enter' && addSubcategory(cat._id)}
                      placeholder={`New subcategory under ${cat.name}`}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-brand focus:outline-none"
                    />
                    <button
                      onClick={() => addSubcategory(cat._id)}
                      className="flex items-center gap-1 px-3 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-white"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Tags ---------------------------------------------------------- */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
          <TagIcon className="w-4 h-4" /> Tags
        </h2>
        <p className="text-sm text-gray-500 mt-1 mb-4">
          Cross-cutting labels like “Eri Silk” or “Organic Dye”. Optional, and independent of the
          category tree — a product can carry several.
        </p>

        <form onSubmit={addTag} className="flex gap-2 mb-4">
          <input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="New tag"
            className="flex-1 border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-brand focus:outline-none"
          />
          <button type="submit" className="px-5 rounded-lg border border-gray-300 font-medium text-gray-700 hover:bg-gray-50">
            Add
          </button>
        </form>

        <div className="flex flex-wrap gap-2">
          {tags.length === 0 && <p className="text-sm text-gray-400 italic">No tags yet.</p>}
          {tags.map((tag) => (
            <span
              key={tag._id}
              className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
            >
              {tag.name}
              <button
                onClick={() => removeTag(tag)}
                className="text-gray-400 hover:text-red-600"
                aria-label={`Delete ${tag.name}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {dialog}
    </div>
  );
}
