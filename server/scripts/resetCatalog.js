/**
 * resetCatalog.js — destructive. Wipes the catalogue and reseeds the four main categories.
 *
 *   node scripts/resetCatalog.js            -> dry run, shows what WOULD be deleted
 *   node scripts/resetCatalog.js --yes      -> actually does it
 *
 * Deletes: products, main categories, subcategories, apparel types / tags,
 * reviews, product code counters, and every user's cart.
 *
 * Does NOT touch orders. orderModel snapshots productName / productCode / price
 * per item, so order history stays fully readable — only "view product" deep
 * links go dead. Users, coupons and banners are also left alone.
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import Product from '../models/productModel.js';
import MainCategory from '../models/mainCategoryModel.js';
import Subcategory from '../models/subCategoryModel.js';
import Tag from '../models/tagModel.js';
import Review from '../models/reviewModel.js';
import Counter from '../models/counterModel.js';
import User from '../models/userModel.js';

dotenv.config();

const CONFIRMED = process.argv.includes('--yes');

// Order here is the order they appear on the homepage and in the nav.
const MAIN_CATEGORIES = [
  { name: 'Sarees',  order: 1, tagline: 'Handwoven drapes in Eri and Muga silk.' },
  { name: 'Mekhela', order: 2, tagline: 'The lower drape, woven on the pit loom.' },
  { name: 'Chador',  order: 3, tagline: 'The upper drape that completes the set.' },
  { name: 'Shawls',  order: 4, tagline: 'Warmth in naturally dyed handspun yarn.' },
];

async function run() {
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI is not set. Aborting.');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log(`✓ Connected to MongoDB\n`);

  const counts = {
    products: await Product.countDocuments(),
    mainCategories: await MainCategory.countDocuments(),
    subcategories: await Subcategory.countDocuments(),
    tags: await Tag.countDocuments(),
    reviews: await Review.countDocuments(),
    productCounters: await Counter.countDocuments({ _id: /^product-/ }),
    usersWithCart: await User.countDocuments({ cartData: { $nin: [null, {}] } }),
  };

  console.log('About to delete:');
  Object.entries(counts).forEach(([k, v]) => console.log(`   ${String(v).padStart(6)}  ${k}`));

  // Deliberately reported, never deleted — this is the number that makes people
  // pause, so show it before asking for confirmation.
  const orderCount = await mongoose.connection.db.collection('orders').countDocuments();
  console.log(`\n   ${String(orderCount).padStart(6)}  orders  (PRESERVED — item snapshots keep history readable)\n`);

  if (!CONFIRMED) {
    console.log('Dry run. Nothing was changed.');
    console.log('Re-run with --yes to apply. Back up your database first.\n');
    await mongoose.disconnect();
    return;
  }

  console.log('Deleting…');
  await Product.deleteMany({});
  await Subcategory.deleteMany({});
  await MainCategory.deleteMany({});
  await Tag.deleteMany({});
  await Review.deleteMany({});
  await Counter.deleteMany({ _id: /^product-/ });
  await User.updateMany({}, { $set: { cartData: {} } });

  // The old Subcategory collection had a unique index on `name` alone, and the
  // old ApparelType collection is gone entirely. Dropping the indexes lets
  // Mongoose rebuild them from the new schemas instead of inheriting stale ones.
  for (const name of ['subcategories', 'maincategories', 'apparaltypes', 'apparelTypes']) {
    try {
      await mongoose.connection.db.collection(name).dropIndexes();
      console.log(`   dropped stale indexes on ${name}`);
    } catch {
      /* collection may not exist — fine */
    }
  }
  try {
    await mongoose.connection.db.collection('apparaltypes').drop();
    console.log('   dropped obsolete apparaltypes collection');
  } catch { /* already gone */ }

  console.log('✓ Catalogue cleared\n');

  console.log('Seeding main categories…');
  for (const cat of MAIN_CATEGORIES) {
    const created = await MainCategory.create({
      ...cat,
      showOnHomepage: true,
      isActive: true,
      featuredProducts: [],
    });
    console.log(`   ✓ ${created.name.padEnd(8)} /collection/${created.slug}`);
  }

  await Subcategory.syncIndexes();
  await MainCategory.syncIndexes();
  await Product.syncIndexes();
  console.log('\n✓ Indexes synced');

  console.log('\nDone. Next: add subcategories in /admin/categories, then products.\n');
  await mongoose.disconnect();
}

run().catch(async (err) => {
  console.error('❌ Reset failed:', err.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
