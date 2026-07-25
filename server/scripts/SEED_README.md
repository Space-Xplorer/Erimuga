# Catalogue Scripts

The old `seedProducts.js` (flat Fabrics/Traditional-Wear categories) has been
removed. The catalogue now uses the Sarees / Mekhela / Chador / Shawls structure
with nested subcategories — see [../../docs/homepage-and-categories.md](../../docs/homepage-and-categories.md).

Two scripts manage it. Both **dry-run by default** and only act with `--yes`.

## `resetCatalog.js` — clean slate

Wipes products, categories, subcategories, tags, reviews, product-code counters
and all carts, then seeds the four **empty** main categories. Orders and users
are preserved.

```bash
node scripts/resetCatalog.js          # dry run — reports what would be deleted
node scripts/resetCatalog.js --yes    # apply
# or: npm run reset:catalog
```

Use this for a real launch: reset, then add subcategories in `/admin/categories`
and products via `/admin/add-product`.

## `seedDemoCatalog.js` — working demo

Same wipe, but also seeds subcategories, ~13 demo products (with images from
`client/public/Test Demo` and `client/public/Home Page`) and per-category
homepage images, so the redesigned homepage has content to show immediately.

```bash
node scripts/seedDemoCatalog.js         # dry run
node scripts/seedDemoCatalog.js --yes   # apply
```

Swap the demo images for real uploads through the admin once you're set up.

## Prerequisites

- `MONGODB_URI` set in `server/.env`
- `npm install` has been run

Both scripts **preserve orders and user accounts** — only the catalogue and
carts are replaced. Back up before running against production.
