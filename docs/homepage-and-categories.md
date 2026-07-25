# Homepage & Categories

How the storefront homepage and the category tree work as of July 2026.

## The category tree

Two levels, with a real parent link:

```
MainCategory (Sarees, Mekhela, Chador, Shawls)
└── Subcategory  (belongs to exactly one parent)
```

- `server/models/mainCategoryModel.js` — name, slug, order, `showOnHomepage`,
  `homepageImage {url, public_id}`, tagline, description, `featuredProducts[]`.
- `server/models/subCategoryModel.js` — name, slug, `mainCategory` ref, order.
  Unique on **`{ mainCategory, slug }`**, not on name — so "Eri Silk" can exist
  under both Sarees and Shawls as two independent records.
- `server/models/tagModel.js` — flat, cross-cutting vocabulary (Eri Silk,
  Organic Dye, Handwoven). Deliberately **not** part of the tree. Optional.
  This replaces the old `ApparelType`.

Slugs are generated from the name by `server/utils/slugify.js` and are what
appear in URLs (`/collection/sarees?sub=eri-silk`).

Products store the category **twice**: `mainCategory`/`subcategory` as slug
strings (cheap filtering, no populate) and `mainCategoryId`/`subcategoryId` as
refs (real relationship, cascade safety). Renaming a category updates the stored
slugs on its products in the same request.

### Guarantees worth knowing

- `validateProduct` (`server/middlewares/validate.js`) resolves both category
  params and **rejects a subcategory that doesn't belong to the given main
  category**. It runs on create *and* edit — edit previously had no validation.
- Deleting a category or subcategory that still has products returns **409**
  with a readable message rather than orphaning them.
- Deleting a product pulls it out of any category's `featuredProducts`.

## Homepage

`GET /homepage` returns everything in one request — banners, category bands
with their products, and the brand story. The previous homepage made three
requests, two of which downloaded the entire catalogue to filter it client-side.

Rendered by `client/src/pages/Home.jsx`:

1. `Carousel` — full-bleed hero, DB-backed via the `Banner` model.
2. `CategoryBands` — one band per visible category, sides alternating.
3. `BrandStory` — the "about the maker" block, hidden unless enabled.

Each band shows its **hand-picked** `featuredProducts` in the chosen order, and
falls back to the newest products in that category when nothing is picked. A
category with no `homepageImage` renders a typographic panel rather than a
broken or stretched image.

## Admin

| Route | Purpose |
|---|---|
| `/admin/categories` | **Structure** — the tree, plus the tag vocabulary |
| `/admin/homepage` | **Presentation** — carousel, category bands, brand story |

`/admin/banners` redirects to `/admin/homepage`; the old Banners page is now
the Carousel tab. `MetadataModal` is gone.

## Design tokens

`client/src/index.css` defines the palette and fonts in a Tailwind v4 `@theme`
block: `brand` (madder red), `paper`/`paper-dim`/`paper-deep` (warm grounds),
`ink`/`ink-soft`/`ink-muted`, and `accent` (muted gold). Fonts are Cormorant
Garamond (`font-display`) and Inter (`font-sans`).

**Use the tokens, not hex values.** The 140 hardcoded `#b22222` literals that
used to be spread across 20 files have all been replaced.

## Resetting the catalogue

`server/scripts/resetCatalog.js` wipes products, categories, subcategories,
tags, reviews, product-code counters and all carts, then seeds the four main
categories.

```bash
node scripts/resetCatalog.js        # dry run — reports what would be deleted
node scripts/resetCatalog.js --yes  # actually does it
```

It **does not touch orders**: `orderModel` snapshots `productName`,
`productCode` and `price` per item, so history stays readable after a wipe —
only "view product" deep links go dead.
