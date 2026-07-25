// models/tagModel.js
// Formerly ApparelType. Tags are a flat, cross-cutting vocabulary (Eri Silk,
// Organic Dye, Handwoven) that is deliberately independent of the
// MainCategory -> Subcategory tree. A product may carry several, or none.
import mongoose from 'mongoose';
import slugify from '../utils/slugify.js';

const tagSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  slug: { type: String, unique: true, index: true },
}, { timestamps: true });

tagSchema.pre('validate', function (next) {
  if (this.name && (this.isModified('name') || !this.slug)) {
    this.slug = slugify(this.name);
  }
  next();
});

export default mongoose.model('Tag', tagSchema);
