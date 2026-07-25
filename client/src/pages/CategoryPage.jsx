import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import axios from '../config/axios';
import ProductGrid from '../components/Collection/ProductGrid';

const SORT_OPTIONS = [
  { label: 'Newest', value: '' },
  { label: 'Price: low to high', value: 'priceLowHigh' },
  { label: 'Price: high to low', value: 'priceHighLow' },
];

/**
 * A single main category, reached from the homepage bands via /collection/:slug.
 * Subcategories are chips that drive `?sub=` rather than a sidebar, keeping the
 * page closer to a lookbook than to a filter-heavy storefront.
 */
const CategoryPage = () => {
  const { categorySlug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeSub = searchParams.get('sub') || '';
  const sortBy = searchParams.get('sort') || '';

  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Category metadata only changes when the slug does.
  useEffect(() => {
    let cancelled = false;
    setNotFound(false);

    axios
      .get(`/categories/${categorySlug}`)
      .then((res) => {
        if (!cancelled) setCategory(res.data);
      })
      .catch(() => {
        if (!cancelled) {
          setCategory(null);
          setNotFound(true);
        }
      });

    return () => { cancelled = true; };
  }, [categorySlug]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const params = { mainCategory: categorySlug };
    if (activeSub) params.subcategory = activeSub;
    if (sortBy) params.sortBy = sortBy;

    axios
      .get('/products', { params })
      .then((res) => {
        if (!cancelled) setProducts(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => {
        if (!cancelled) setProducts([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [categorySlug, activeSub, sortBy]);

  // Writing through searchParams keeps the URL shareable and the back button honest.
  const setParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  };

  const subcategories = useMemo(() => category?.subcategories || [], [category]);

  if (notFound) {
    return (
      <div className="py-32 text-center">
        <h1 className="font-display text-4xl text-ink">Collection not found</h1>
        <Link to="/" className="mt-6 inline-block border-b border-ink/25 pb-1 text-sm text-ink hover:border-brand hover:text-brand">
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-paper">
      {/* Header ---------------------------------------------------------- */}
      <header className="relative overflow-hidden">
        {category?.homepageImage?.url ? (
          <div className="relative h-64 md:h-80">
            <img
              src={category.homepageImage.url}
              alt={category.name}
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/65 to-black/25" />
            <div className="relative mx-auto flex h-full max-w-7xl items-end px-4 pb-10 sm:px-6 lg:px-8">
              <div>
                <p className="eyebrow text-paper/70">Collection</p>
                <h1 className="mt-2 font-display text-5xl text-paper md:text-6xl">{category.name}</h1>
              </div>
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-7xl px-4 pt-16 pb-4 sm:px-6 lg:px-8">
            <p className="eyebrow">Collection</p>
            <h1 className="mt-2 font-display text-5xl text-ink md:text-6xl">
              {category?.name || ' '}
            </h1>
          </div>
        )}
      </header>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {category?.description && (
          <p className="max-w-2xl text-[0.95rem] leading-[1.9] text-ink-soft">
            {category.description}
          </p>
        )}

        {/* Subcategory chips + sort ---------------------------------------- */}
        <div className="mt-8 flex flex-col gap-4 border-b border-paper-deep pb-5 sm:flex-row sm:items-center sm:justify-between">
          {subcategories.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setParam('sub', '')}
                className={`rounded-full border px-4 py-1.5 text-sm transition ${
                  activeSub === ''
                    ? 'border-ink bg-ink text-paper'
                    : 'border-paper-deep text-ink-soft hover:border-ink-muted'
                }`}
              >
                All
              </button>
              {subcategories.map((sub) => (
                <button
                  key={sub._id}
                  type="button"
                  onClick={() => setParam('sub', sub.slug)}
                  className={`rounded-full border px-4 py-1.5 text-sm transition ${
                    activeSub === sub.slug
                      ? 'border-ink bg-ink text-paper'
                      : 'border-paper-deep text-ink-soft hover:border-ink-muted'
                  }`}
                >
                  {sub.name}
                </button>
              ))}
            </div>
          ) : (
            <span />
          )}

          <div className="flex items-center gap-3 shrink-0">
            <span className="text-sm text-ink-muted">
              {loading ? '…' : `${products.length} piece${products.length === 1 ? '' : 's'}`}
            </span>
            <select
              value={sortBy}
              onChange={(e) => setParam('sort', e.target.value)}
              aria-label="Sort products"
              className="border border-paper-deep bg-transparent px-3 py-1.5 text-sm text-ink-soft focus:border-ink focus:outline-none"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Grid ------------------------------------------------------------ */}
        <div className="mt-10">
          {loading ? (
            <p className="py-20 text-center text-sm text-ink-muted">Loading…</p>
          ) : (
            <ProductGrid products={products} view="grid" />
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
