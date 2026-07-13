# Demo / Test Accounts

Temporary accounts for client demos and manual testing. **Remove these before real
handover** — see [Removal](#removal) below.

## Credentials

| Role | Email | Password |
| --- | --- | --- |
| Admin | `demo.admin@erimuga.com` | `DemoAdmin@123` |
| Customer | `demo.customer@erimuga.com` | `DemoCustomer@123` |

The demo customer has a pre-filled default address (Mumbai, 400001) so checkout can
be demoed immediately without filling out a form first.

## Creating them

```bash
cd server
npm run seed:demo-users
```

Idempotent — running it again skips any account that already exists. Both accounts
were created and verified working (login, cart, admin endpoints) in the database
this project currently points to (`server/.env`'s `MONGODB_URI`).

## Removal

Before handing the site over to the real client:

```bash
cd server
npm run remove:demo-users
```

This deletes both accounts by email. Do this as one of the last steps before
go-live — after this point `demo.admin@erimuga.com` / `demo.customer@erimuga.com`
will no longer work.

## Related test/seed scripts

These live in `server/scripts/` and are gitignored (not committed — dev/demo
fixtures only, not something a production deploy should run automatically):

- `seedProducts.js` / `npm run seed` — seeds the initial product catalog.
- `seedDemoUsers.js` / `removeDemoUsers.js` — this doc.
- `migrateProductImages.js` / `npm run migrate:product-images` — one-time migration
  from the old flat `image: [String]` product field to the per-colour `colors[]`
  structure. Already run against the current database; safe to re-run (idempotent,
  no-ops if every product already has `colors`).

`seedBanners.js` (`npm run seed:banners`) is **not** gitignored — unlike the above,
it seeds real homepage content (the carousel slides that used to be hardcoded in
`Carousel.jsx`), not throwaway test data, so it's meant to run on a fresh
deployment.
