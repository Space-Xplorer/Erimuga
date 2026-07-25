// models/subCategoryModel.js
import mongoose from 'mongoose';
import slugify from '../utils/slugify.js';

// Subcategories are scoped to exactly one main category. The name is only
// unique *within* its parent, so "Eri Silk" can exist under both Sarees and
// Shawls as two independent records.
const subcategorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, index: true },
  mainCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MainCategory',
    required: true,
    index: true,
  },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

subcategorySchema.pre('validate', function (next) {
  if (this.name && (this.isModified('name') || !this.slug)) {
    this.slug = slugify(this.name);
  }
  next();
});

// Replaces the old global unique index on `name`.
subcategorySchema.index({ mainCategory: 1, slug: 1 }, { unique: true });

export default mongoose.model('Subcategory', subcategorySchema);
