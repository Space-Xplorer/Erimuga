// One-time migration: buckets each existing product's old flat `image: [String]`
// array into the new `colors: [{ name, swatchHex, images: [{url, public_id}] }]`
// structure. Idempotent — only touches products that don't have `colors` yet.
//
// The old `image` field is no longer declared on the Mongoose schema, so we read
// via the raw driver collection (bypasses schema hydration) to still see it.
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/productModel.js';

dotenv.config();

async function migrateProductImages() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB\n');

  const rawProducts = await Product.collection
    .find({ $or: [{ colors: { $exists: false } }, { colors: { $size: 0 } }] })
    .toArray();

  console.log(`Found ${rawProducts.length} product(s) needing image migration\n`);

  let migrated = 0;
  let skipped = 0;

  for (const doc of rawProducts) {
    const oldImages = Array.isArray(doc.image) ? doc.image.filter(Boolean) : [];
    if (oldImages.length === 0) {
      console.log(`- Skipped (no old images): ${doc.name} (${doc.productCode})`);
      skipped++;
      continue;
    }

    const colorName = (doc.availableColors && doc.availableColors[0]) || 'Default';
    const colors = [{
      name: colorName,
      swatchHex: '',
      images: oldImages.map((url) => ({ url, public_id: null })),
    }];

    await Product.collection.updateOne(
      { _id: doc._id },
      { $set: { colors }, $unset: { image: '' } }
    );

    console.log(`+ Migrated: ${doc.name} (${doc.productCode}) -> colour "${colorName}", ${oldImages.length} image(s)`);
    migrated++;
  }

  console.log(`\nDone. Migrated: ${migrated}, Skipped: ${skipped}`);
  await mongoose.disconnect();
}

migrateProductImages().catch((err) => {
  console.error('Product image migration failed:', err);
  process.exit(1);
});
