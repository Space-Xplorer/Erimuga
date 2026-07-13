# Product Seeding Script Guide

## Overview
The `seedProducts.js` script automatically seeds your MongoDB database with product data using images from the public folder. The script is **designed for development only** and is added to `.gitignore` to prevent accidental commits.

## What the Script Does
- Creates 3 main product collections:
  - **Cotton Raw Silk Collection** (9 products) - from root public folder images
  - **Eri Textiles Collection** (16 products including stoles, shawls, gents wear) - from Home Page folder
  - **Eri Sarees Collection** (6 products) - from Home Page folder
  
- **Total: 31 products** ready to display in your storefront
- Automatically creates all required categories, apparel types, and subcategories
- Safely skips any products that already exist in the database (idempotent)

## Prerequisites
1. Make sure MongoDB is running on your system
2. Create/configure your `.env` file in the `server` folder with:
   ```
   MONGODB_URI=mongodb://localhost:27017/erimuga
   NODE_ENV=development
   ```
3. Ensure all dependencies are installed: `npm install`

## How to Run the Seed

Navigate to the server directory and run:

```bash
cd server
npm run seed
```

**Alternative** - Run directly with Node:
```bash
node scripts/seedProducts.js
```

## Setting up the npm script

If you haven't already, add this to your `server/package.json` in the `"scripts"` section:

```json
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js",
  "seed": "node scripts/seedProducts.js"
}
```

## Output
When you run the script, you'll see:
- ✓ Creation logs for each product
- ⊘ Skipped messages for existing products
- 📊 Summary with total products created/skipped

Example output:
```
✓ Connected to MongoDB

📁 Processing category: Cotton Raw Silk Collection
──────────────────────────────────────────────────
✓ Created MainCategory: Fabrics
✓ Created ApparelType: Fabric
✓ Created Subcategory: Raw Silk
✓ Created: Cotton Raw Silk - Natural (CRS-001)
✓ Created: Cotton Raw Silk - Premium Grade (CRS-002)
... (more products)

📊 Seeding Summary:
   ✓ Products Created: 31
   ⊘ Products Skipped: 0
   📦 Total Processed: 31

✓ Seeding completed successfully!

✓ Disconnected from MongoDB
```

## Product Details
- **Product Codes** are automatically generated (CRS-001, ERI-STOLE-001, etc.)
- **Images** reference the files in the public folder:
  - `/Cotton Raw Silk.jpg`
  - `/Cotton Raw Silk 2-9.jpg`
  - `/Home Page/ERI FIBRE STOLE COLOR V1.jpg`
  - etc.
- **Pricing** ranges from ₹1,500 - ₹4,200
- **Best Sellers** are marked with `isBestSeller: 'yes'` (select items)
- **Available Sizes & Colors** are pre-configured for each product

## Running Again
If you run the script multiple times, it will:
- ✓ Recognize existing products by product code
- ⊘ Skip them without creating duplicates
- Only create new products if they don't exist

This makes it safe to run repeatedly.

## Troubleshooting

**Error: Cannot find module**
- Make sure you're in the `server` directory
- Run `npm install` to ensure all dependencies are installed

**Error: Cannot connect to MongoDB**
- Ensure MongoDB is running: `mongod` (on Windows, use MongoDB Services)
- Check your `MONGODB_URI` in `.env` file

**Products not appearing**
- Check MongoDB connection logs
- Verify the database name matches in `MONGODB_URI`

## Notes
- The script connects to MongoDB, seeds products, then disconnects automatically
- It's safe to run multiple times - duplicates won't be created
- Image paths in the database are relative to the public folder
- All products use the images as-is from your public folder - no uploading to cloud storage needed yet
