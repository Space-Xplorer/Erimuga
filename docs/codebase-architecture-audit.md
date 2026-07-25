# Erimuga Codebase Architecture Audit

This document consolidates the current research notes into a Markdown format suitable for the `docs/` folder. It focuses on the main backend, frontend, and cross-cutting architectural findings in the Erimuga application.

> **Partially superseded — July 2026.** The homepage and category restructure changed several things described below. See [homepage-and-categories.md](homepage-and-categories.md) for the current design. Sections known to be out of date: 1.2 (product images are now `colors[].images[]`, not a flat `image: [String]`), 1.5 (the hero carousel is DB-backed and admin-editable), and everything describing categories as three flat, unrelated lists. The security and order-concurrency findings below are still accurate and still open.

## 1. Order IDs, Product Variants, Bestseller, Guest Cart, and Hero Carousel

### 1.1 Order ID / Tracking Number Generation

Relevant files:

- [server/utils/generateOrderNumber.js](../server/utils/generateOrderNumber.js)
- [server/controllers/orderController.js](../server/controllers/orderController.js)
- [server/models/orderModel.js](../server/models/orderModel.js)

Current format:

```js
const year = new Date().getFullYear();
const prefix = `ERM-${year}-`;
const count = await Order.countDocuments({ orderNumber: { $regex: `^${prefix}\\d{5}$` } });
const serial = String(count + 1).padStart(5, '0');
return `${prefix}${serial}`; // e.g. ERM-2026-00042
```

- Format is human-friendly and sortable: `ERM-<year>-<5-digit-serial>`.
- The counter resets each year because the regex is scoped to the current year prefix.
- It is not concurrency-safe: `countDocuments()` plus increment is a read-then-write race.
- The `orderNumber` field is unique and sparse, so a collision becomes a duplicate-key error rather than a silent duplicate.
- Under real concurrent checkout traffic, one order can fail after stock has already been decremented, which creates an inventory/order inconsistency.

Observed gaps:

- `getOrderDetails` looks up orders by Mongo `_id`, not by `orderNumber`.
- `orderNumber` is optional because the schema uses `sparse`, so code paths that skip generation can create orders without a number.
- The same pattern is reused in `server/utils/generatebasecode.js` for product codes.

### 1.2 Product Color / Image / Variant Mapping

Relevant files:

- [server/models/productModel.js](../server/models/productModel.js)
- [server/controllers/adminController.js](../server/controllers/adminController.js)
- [client/src/components/Admin/ProductForm.jsx](../client/src/components/Admin/ProductForm.jsx)
- [client/src/pages/ProductinDetail.jsx](../client/src/pages/ProductinDetail.jsx)

Schema shape:

```js
const variantSchema = new Schema({ size, color, stock }, { _id: false });
const productSchema = new Schema({
  image: { type: [String], required: true },
  availableSizes: [String],
  availableColors: [String],
  variants: { type: [variantSchema], default: [] },
});
```

- Size and quantity granularity is supported via `variants: [{ size, color, stock }]`.
- Color-to-image mapping is not supported anywhere.
- The admin form uploads a single flat multi-file image set; there is no per-color grouping.
- The backend stores the uploaded images as one flat `image: [String]` array.
- The storefront shows one shared gallery regardless of selected color.
- Zero images are possible through the API even though the UI tries to prevent it.
- Fallback behavior is inconsistent across customer-facing components.

Summary table:

| Concern | Schema | Admin form | Result |
| --- | --- | --- | --- |
| Images | Flat `image: [String]` | Single multi-file input | Shared gallery only |
| Per-color images | Not modeled | Not supported | Not possible |
| Sizes | `availableSizes` | CSV input | Supported |
| Colors | `availableColors` | CSV input | Supported |
| Stock by size/color | `variants` | Auto-generated grid | Supported |

### 1.3 Bestseller / Newest Sorting

- Bestseller is a manually set flag, not derived from sales data.
- `isBestSeller` is set by the admin checkbox and consumed client-side in `BestSellers.jsx`.
- There is no persisted sold-count or purchase-count field.
- The admin analytics dashboard calculates top products transiently from orders, but it does not write that back to products.

Newest-sort issues:

- The product schema does not use `timestamps: true`.
- The frontend sort logic references `createdAt`, which is likely undefined.
- The admin product list also sorts by `createdAt`, so that path is not reliable.
- The public product endpoint sorts by `date`, so the UI can appear correct by accident.

### 1.4 Ghost User / Guest Cart Flow

- Guest cart does not exist.
- Cart routes require authentication end to end.
- The frontend blocks all cart actions when the user is not authenticated.
- No localStorage/sessionStorage cart is implemented.
- No anonymous session cart or merge-on-login flow exists.

Current implication:

- Anonymous users cannot add items to cart at all.
- The application behaves as a strict authenticated-cart model, not a guest-shopping model.

### 1.5 Homepage Hero / Carousel Editability

- The hero carousel is hardcoded in JSX.
- Images, heading, subtext, and CTA are all static.
- There is no backend model or admin UI for editing hero content.

If this should become admin-editable, it would need:

1. A new banner/hero model.
2. Admin CRUD routes and controller logic.
3. A management UI in the admin panel.
4. A frontend fetch in the carousel component.

## 2. Backend Architecture Audit

### 2.1 Route Inventory

#### Admin routes

Mounted at `/admin` and guarded by `isLoggedIn` + `isAdmin`.

| Method | Path | Handler | Notes |
| --- | --- | --- | --- |
| GET | `/orders` | `getAllOrders` | Admin order list |
| PUT | `/orders/:id` | `updateOrderStatus` | Status update path |
| POST | `/add-product` | `addProduct` | Uses upload + validation |
| GET | `/products` | `getAllProducts` | Admin product list |
| PUT | `/edit-product/:id` | `editProduct` | No validation middleware |
| DELETE | `/delete-product/:id` | `deleteProduct` | Cloudinary cleanup is broken |
| GET | `/order-stats` | `getOrderStats` | Analytics feed |
| GET | `/customers` | `getAllCustomers` | Customer list |
| GET | `/customers/:id` | `getCustomerDetail` | Customer detail |

#### Cart routes

Mounted at `/cart` and guarded by `isLoggedIn`.

- `POST /add`
- `PUT /update/:id`
- `GET /get`
- `DELETE /remove`
- `DELETE /clear`

#### User auth routes

Mounted at `/user/auth`.

- Some routes are authenticated correctly.
- Two routes return raw user documents with no field projection and no auth check, which leaks sensitive fields.

#### Coupon routes

- All mutating routes are guarded by authentication and admin checks.
- The validation route is authenticated.

#### Review routes

- Public product review fetch is allowed.
- Review creation requires login.
- Review deletion is admin-only.

#### Order routes

- Checkout routes are authenticated.
- Some admin-style order routes exist without admin ownership checks.
- `GET /:id`, `PUT /:id/status`, and `DELETE /:id` are only gated by login, not ownership or admin authorization.

#### Product routes

- Public and thin.
- Search uses regex on `name` and `description`.
- Frontend still fetches the full catalog and filters many things client-side.

#### Metadata routes

- No auth middleware is applied.
- The frontend uses these routes from admin-only UI, but the API itself is open.

### 2.2 Controllers

#### adminController.js

- `deleteProduct` references `cloudinary.uploader.destroy(...)` without importing `cloudinary`, so image cleanup never really happens.
- Product variant parsing is duplicated across multiple code paths.
- `editProduct` does not use the same validation middleware as `addProduct`.

#### cartController.js

- Cart ownership is tied to the authenticated user, which is fine.
- Quantity validation is weak.
- Stock is only enforced later at order time.

#### orderController.js

- This is the most carefully validated controller.
- It re-derives price and stock server-side.
- Razorpay signature verification is implemented.
- However, some routes still lack ownership authorization.
- Stock decrements are not wrapped in a transaction, so partial failure is possible.
- Coupon usage count is incremented before final order persistence, which can drift if later steps fail.
- COD and Razorpay order creation are nearly duplicate implementations.

#### productController.js

- Public product search is regex-based and unbounded.
- Category filtering is still performed client-side.

#### couponController.js

- Clean and centralized.
- Concurrency around usage limits is still a risk because increments are not atomic with enforcement.

#### reviewController.js

- Duplicate review prevention is handled both explicitly and through a unique compound index.
- Rating validation could still be stricter.

### 2.3 Security / Authorization Concerns

- Open metadata mutation routes are the biggest API-level authorization gap.
- Raw user lookup endpoints can leak password hashes and Google IDs.
- Some order endpoints allow authenticated users to act on orders they do not own.
- The app currently relies on route-level checks inconsistently instead of a central ownership guard.
- Multer filenames are not sanitized aggressively enough.
- Login and registration do not appear to have route-specific rate limiting.
- A tracked production env file is a serious operational risk if it contains real secrets.

### 2.4 Models

#### productModel.js

- `image` is stored as URL strings only, not Cloudinary public IDs.
- `availableSizes` and `availableColors` duplicate information that is already encoded in `variants`.
- There are no indexes for the primary filter fields.

#### orderModel.js

- `userID` is stored as a string instead of an ObjectId ref.
- There is no index on `userID` or `status`.
- Address fields are inconsistent across order and user schemas.
- Payment status values are mixed and inconsistent.

#### userModel.js

- Password is not marked `select: false`, so callers must remember to project it out.
- Google account linkage is not uniquely indexed.
- Cart snapshots are denormalized into the user record.

#### couponModel.js

- Clean and well-shaped.

#### reviewModel.js

- Clean; the unique index is appropriate.

#### contactMessageModel.js

- Has a `read` field, but no admin CRUD surface exists to manage messages.

### 2.5 Middleware and Auth

- `isLoggedIn` and `isAdmin` are simple and correct.
- Logging inside auth middleware is noisy for production.
- Validation helpers exist but are not consistently reused.
- Passport session wiring order is correct.
- CORS is explicitly allowlisted and credentialed.

### 2.6 Server Bootstrap

- Environment variables are loaded, but startup does not fail hard when required values are missing.
- A fallback session secret is a risk if production env configuration breaks.
- `express.static` uses a fragile relative path.
- `/health` is defined twice, leaving one route dead.
- The app logs env availability at startup but does not enforce it.

### 2.7 Seed and Utility Scripts

- `server/scripts/seedProducts.js` is an idempotent seed script.
- `server/utils/generateOrderNumber.js` and `server/utils/generatebasecode.js` both use non-atomic count-based generation.

## 3. Frontend Architecture Audit

### 3.1 App Structure and Routing

- `App.jsx` eagerly loads storefront pages and lazily loads admin pages.
- Protected routes are used for authenticated areas.
- Admin access checks are split between `ProtectedRoute` and navbar logic.
- The mobile navbar checks `user.isAdmin`, while the desktop/admin protection uses `user.userType === 'admin'`.
- That mismatch can hide admin links after refresh on mobile.

### 3.2 ShopContext

- `ShopContext` is the main client-side data hub.
- It fetches products, cart data, and exposes cart mutation methods.
- Cart actions are blocked for anonymous users.
- The app has no guest/ghost cart layer.

### 3.3 Frontend Calls vs Backend Routes

The frontend makes many direct data calls:

- Products are fetched in multiple places instead of being fully centralized.
- Orders are fetched from more than one screen.
- API usage is mixed between `axios`, a configured axios instance, and raw `fetch`.

Notable mismatches:

- The admin dashboard references a delete-order path that does not exist.
- There are two competing order-status update paths.
- Some admin navigation is available only through dashboard shortcuts.

### 3.4 Admin Dashboard

- Product upload/edit uses one flat image uploader.
- Variant stock is edited in a size-by-color grid.
- Images are not tied to colors.
- Edit mode replaces the whole image set when new images are uploaded.
- Order management is implemented, but some delete affordances are dead or inconsistent.
- Coupons and customers are fully implemented but not directly linked from the persistent navbar.

### 3.5 Usability Rough Edges

- Some admin messaging still uses native alerts instead of the toast system.
- Order modals expose raw object IDs to admins.
- Destructive actions do not always have consistent confirmation or loading states.
- Some dashboards compute the same metrics in different ways, which can drift.

## 4. Customer-Facing Side

The customer-facing product and collection sections continue beyond the extracted research notes. The key takeaway from the portions already reviewed is that the current storefront is functional, but product data, variant data, sorting, and search behavior are not fully centralized and still rely on several client-side assumptions.

## 5. Practical Takeaways

- The codebase is generally coherent, but there are several places where data shape, authorization, and ownership checks are inconsistent.
- The biggest operational risks are around concurrency in order and product code generation, missing authorization on some routes, and exposed secret/configuration patterns.
- The biggest UX gaps are guest cart support, admin navigation completeness, and the lack of editable homepage hero content.
