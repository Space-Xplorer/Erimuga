// models/mainCategoryModel.js
import mongoose from 'mongoose';
import slugify from '../utils/slugify.js';

// A main category is both a catalogue node (Sarees, Mekhela, Chador, Shawls)
// and the unit the homepage renders as an editorial band, so it carries
// presentation fields alongside its structural ones.
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  slug: { type: String, unique: true, index: true },

  // Ordering drives both the homepage bands and the nav.
  order: { type: Number, default: 0 },

  // Catalogue visibility vs homepage visibility are separate concerns:
  // a category can be live in /collection but withheld from the homepage.
  isActive: { type: Boolean, default: true },
  showOnHomepage: { type: Boolean, default: true },

  // Purpose-shot editorial image. Same shape as bannerModel so the upload
  // and Cloudinary-cleanup paths behave identically.
  homepageImage: {
    url: { type: String, default: '' },
    public_id: { type: String, default: '' },
  },

  tagline: { type: String, default: '' },      // one line under the title in the band
  description: { type: String, default: '' },  // longer copy for the category page header

  // Hand-picked products for the homepage rail. Array order is display order.
  // Empty means "fall back to newest in this category".
  featuredProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
}, { timestamps: true });

categorySchema.pre('validate', function (next) {
  if (this.name && (this.isModified('name') || !this.slug)) {
    this.slug = slugify(this.name);
  }
  next();
});

export default mongoose.model('MainCategory', categorySchema);
