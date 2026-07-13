// Seeds the two homepage carousel slides that used to be hardcoded in
// Carousel.jsx, so switching to the CMS-backed carousel causes zero visual
// change on deploy. Idempotent — skips if any banners already exist.
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Banner from '../models/bannerModel.js';

dotenv.config();

const SLIDES = [
  {
    imageUrl: 'https://blog.indicinspirations.com/wp-content/uploads/2020/05/Eri-Silk-weaver-of-Assam.jpg',
    heading: 'Timeless Style.\nRustic Charm.',
    subtext: 'Explore our earthy collections crafted for those who love elegance with a touch of the wild.',
    ctaLabel: 'Shop the Collection',
    ctaLink: '/collection',
    order: 0,
    isActive: true,
  },
  {
    imageUrl: 'https://www.poojn.in/wp-content/uploads/2025/04/Assams-Rich-Culture-PeopleAttireandLanguage-Explained.jpeg.jpg',
    heading: 'Timeless Style.\nRustic Charm.',
    subtext: 'Explore our earthy collections crafted for those who love elegance with a touch of the wild.',
    ctaLabel: 'Shop the Collection',
    ctaLink: '/collection',
    order: 1,
    isActive: true,
  },
];

async function seedBanners() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB\n');

  const existingCount = await Banner.countDocuments();
  if (existingCount > 0) {
    console.log(`Skipped — ${existingCount} banner(s) already exist.`);
  } else {
    await Banner.insertMany(SLIDES);
    console.log(`Created ${SLIDES.length} banner(s).`);
  }

  await mongoose.disconnect();
}

seedBanners().catch((err) => {
  console.error('Banner seeding failed:', err);
  process.exit(1);
});
