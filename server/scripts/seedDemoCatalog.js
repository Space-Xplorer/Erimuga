/**
 * seedDemoCatalog.js — replaces the catalogue with a demo built on the new
 * category structure (Sarees / Mekhela / Chador / Shawls), so the redesigned
 * homepage has something to show.
 *
 *   node scripts/seedDemoCatalog.js          -> dry run
 *   node scripts/seedDemoCatalog.js --yes    -> apply
 *
 * Wipes products, categories, subcategories, tags, reviews, product counters
 * and user carts. Leaves orders and user accounts untouched.
 *
 * Images: the two products that already existed keep their Cloudinary photos;
 * everything else points at the demo images in client/public/Test Demo and
 * client/public/Home Page (served statically, so the paths resolve in the
 * browser). Swap these for real uploads via the admin once you're set up.
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import MainCategory from '../models/mainCategoryModel.js';
import Subcategory from '../models/subCategoryModel.js';
import Product from '../models/productModel.js';
import Tag from '../models/tagModel.js';
import Review from '../models/reviewModel.js';
import Counter from '../models/counterModel.js';
import User from '../models/userModel.js';
import { generateBaseProductCode } from '../utils/generatebasecode.js';

const CONFIRMED = process.argv.includes('--yes');

// Local demo image → encode spaces so the stored URL is browser-safe.
const img = (path) => encodeURI(path);

// Two photos already uploaded to Cloudinary — reuse rather than lose them.
const EXISTING = {
  blackSaree: 'https://res.cloudinary.com/dbulzhhh7/image/upload/v1755199163/erimuga/products/Women/c3b3bf8fd66057b2c2a0de891d4d20a1.jpg',
  assamDress: 'https://res.cloudinary.com/dbulzhhh7/image/upload/v1755199071/erimuga/products/Women/40d128ecf2353878e38b53280a8abece.jpg',
};

const CATEGORIES = [
  {
    name: 'Sarees', order: 1,
    tagline: 'Handwoven drapes in Eri and Muga silk.',
    description: 'Six yards, woven by hand on the pit looms of Assam. Each saree carries the quiet irregularity of the loom and the warmth of naturally dyed yarn.',
    image: img('/Home Page/Screenshot_2026-07-15-10-55-57-55.jpg'),
    subs: ['Eri Silk', 'Muga Silk', 'Cotton'],
  },
  {
    name: 'Mekhela', order: 2,
    tagline: 'The lower drape, woven on the pit loom.',
    description: 'The mekhela is the lower half of the traditional Assamese two-piece, wrapped in soft pleats and paired with the chador.',
    image: img('/Home Page/IMG-20220809-WA0024.jpg'),
    subs: ['Eri', 'Cotton'],
  },
  {
    name: 'Chador', order: 3,
    tagline: 'The upper drape that completes the set.',
    description: 'Draped over the shoulder to complete the mekhela-chador, finished with woven borders and motifs.',
    image: img('/Test Demo/ERI SHAWL COLOR V2.jpg'),
    subs: ['Eri', 'Organic Dye'],
  },
  {
    name: 'Shawls', order: 4,
    tagline: 'Warmth in naturally dyed handspun yarn.',
    description: 'Handspun Eri — the “peace silk” of Assam — woven into shawls that are light, warm and made to last.',
    image: img('/Test Demo/Eri handwoven design shawls.JPG'),
    subs: ['Handwoven', 'Organic Dye'],
  },
];

const PRODUCTS = [
  // Sarees
  { cat: 'Sarees', sub: 'Eri Silk', name: 'Black Saree', price: 7999, color: 'Black', hex: '#1f1b18', image: EXISTING.blackSaree, featured: true },
  { cat: 'Sarees', sub: 'Eri Silk', name: 'Eri Saree — Indigo', price: 4200, color: 'Indigo', hex: '#33456b', image: img('/Test Demo/ERI SAREE COLOR V1.jpg') },
  { cat: 'Sarees', sub: 'Eri Silk', name: 'Eri Saree — Madder', price: 4200, color: 'Madder', hex: '#9c2a21', image: img('/Test Demo/ERI SAREE COLOR V2.jpg') },
  { cat: 'Sarees', sub: 'Muga Silk', name: 'Muga Saree — Golden', price: 8999, color: 'Golden', hex: '#a68a52', image: img('/Test Demo/MugaSaree.jpg'), featured: true },
  { cat: 'Sarees', sub: 'Cotton', name: 'Eri Saree — Natural', price: 3900, color: 'Natural', hex: '#e8dfd2', image: img('/Test Demo/ERI SAREE COLOR V3.jpg') },

  // Mekhela
  { cat: 'Mekhela', sub: 'Cotton', name: 'Traditional Assamese Dress', price: 3999, color: 'Cream', hex: '#f2ece3', image: EXISTING.assamDress },
  { cat: 'Mekhela', sub: 'Eri', name: 'Mekhela Set — Rust', price: 4500, color: 'Rust', hex: '#a1552f', image: img('/Test Demo/ERI SAREE COLOR V4.jpg') },

  // Chador
  { cat: 'Chador', sub: 'Organic Dye', name: 'Organic Dye Chador — V1', price: 2300, color: 'Indigo', hex: '#33456b', image: img('/Test Demo/ERI ORGANIC DYE STOLE COLOR V1.jpg') },
  { cat: 'Chador', sub: 'Organic Dye', name: 'Organic Dye Chador — V2', price: 2300, color: 'Madder', hex: '#9c2a21', image: img('/Test Demo/ERI ORGANIC DYE STOLE COLOR V2.jpg') },
  { cat: 'Chador', sub: 'Eri', name: 'Eri Fibre Chador', price: 1800, color: 'Natural', hex: '#e8dfd2', image: img('/Test Demo/ERI FIBRE STOLE COLOR V1.jpg') },

  // Shawls
  { cat: 'Shawls', sub: 'Handwoven', name: 'Eri Shawl — V1', price: 1600, color: 'Ecru', hex: '#e8dfd2', image: img('/Test Demo/ERI SHAWL COLOR V1.jpg') },
  { cat: 'Shawls', sub: 'Handwoven', name: 'Handwoven Design Shawl', price: 2200, color: 'Natural', hex: '#d8cbb5', image: img('/Test Demo/Eri handwoven design shawls.JPG') },
  { cat: 'Shawls', sub: 'Organic Dye', name: 'Organic Dye Shawl — V3', price: 1800, color: 'Slate', hex: '#5a6270', image: img('/Test Demo/ERI SHAWL COLOR V3.jpg') },
];

async function run() {
  if (!process.env.MONGODB_URI) { console.error('❌ MONGODB_URI not set'); process.exit(1); }
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✓ Connected:', mongoose.connection.name, '\n');

  console.log('Will replace:');
  console.log('  products      :', await Product.countDocuments());
  console.log('  categories    :', await MainCategory.countDocuments());
  console.log('  subcategories :', await Subcategory.countDocuments());
  console.log('  (orders/users preserved:', await mongoose.connection.db.collection('orders').countDocuments(), '/', await User.countDocuments(), ')\n');
  console.log('Will create: 4 categories,', CATEGORIES.reduce((n, c) => n + c.subs.length, 0), 'subcategories,', PRODUCTS.length, 'products\n');

  if (!CONFIRMED) {
    console.log('Dry run. Re-run with --yes to apply.\n');
    await mongoose.disconnect();
    return;
  }

  // Wipe catalogue, keep orders + users.
  await Product.deleteMany({});
  await Subcategory.deleteMany({});
  await MainCategory.deleteMany({});
  await Tag.deleteMany({});
  await Review.deleteMany({});
  await Counter.deleteMany({ _id: /^product-/ });
  await User.updateMany({}, { $set: { cartData: [] } });

  // Clear stale indexes left by the old flat schema, then rebuild.
  for (const name of ['subcategories', 'maincategories', 'apparaltypes']) {
    try { await mongoose.connection.db.collection(name).dropIndexes(); } catch { /* ok */ }
  }
  await Promise.all([MainCategory.syncIndexes(), Subcategory.syncIndexes(), Product.syncIndexes()]);
  console.log('✓ Catalogue cleared\n');

  // Categories + subcategories
  const subMap = {}; // "Cat/Sub" -> sub doc
  const catMap = {}; // "Cat" -> cat doc
  for (const c of CATEGORIES) {
    const cat = await MainCategory.create({
      name: c.name, order: c.order, tagline: c.tagline, description: c.description,
      showOnHomepage: true, isActive: true,
      homepageImage: { url: c.image, public_id: '' },
      featuredProducts: [],
    });
    catMap[c.name] = cat;
    for (let i = 0; i < c.subs.length; i++) {
      const sub = await Subcategory.create({ name: c.subs[i], mainCategory: cat._id, order: i + 1 });
      subMap[`${c.name}/${c.subs[i]}`] = sub;
    }
    console.log(`   ✓ ${c.name} (${c.subs.length} subs)`);
  }

  // Products
  const featuredByCat = {};
  for (const p of PRODUCTS) {
    const main = catMap[p.cat];
    const sub = subMap[`${p.cat}/${p.sub}`];
    const productCode = await generateBaseProductCode(main.name, sub.name);
    const doc = await Product.create({
      productCode, name: p.name, price: p.price,
      mainCategory: main.slug, subcategory: sub.slug,
      mainCategoryId: main._id, subcategoryId: sub._id,
      description: `${p.name} — handwoven in Assam in ${p.color.toLowerCase()}.`,
      tags: [],
      colors: [{ name: p.color, swatchHex: p.hex || '', images: [{ url: p.image, public_id: '' }] }],
      availableSizes: ['Free Size'],
      availableColors: [p.color],
      variants: [{ size: 'Free Size', color: p.color, stock: 10 }],
      isBestSeller: 'no',
    });
    if (p.featured) (featuredByCat[p.cat] ||= []).push(doc._id);
  }
  console.log(`   ✓ ${PRODUCTS.length} products`);

  // Hand-picked featured, to demonstrate curation
  for (const [catName, ids] of Object.entries(featuredByCat)) {
    await MainCategory.findByIdAndUpdate(catMap[catName]._id, { featuredProducts: ids });
  }

  console.log('\n✓ Done. Homepage will now show all four bands.\n');
  await mongoose.disconnect();
}

run().catch(async (e) => { console.error('❌', e.message); await mongoose.disconnect().catch(() => {}); process.exit(1); });
