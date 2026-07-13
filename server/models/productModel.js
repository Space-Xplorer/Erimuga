import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const variantSchema = new Schema({
  size: { type: String, default: '' },
  color: { type: String, default: '' },
  stock: { type: Number, default: 0, min: 0 },
}, { _id: false });

const colorImageSchema = new Schema({
  url: { type: String, required: true },
  public_id: { type: String }, // enables real Cloudinary cleanup on delete/edit
}, { _id: false });

const colorSchema = new Schema({
  name: { type: String, required: true },
  swatchHex: { type: String, default: '' },
  images: { type: [colorImageSchema], default: [] },
}, { _id: false });

const productSchema = new Schema({
  productCode: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  mainCategory: { type: String, required: true },
  apparelType: { type: String, required: true },
  subcategory: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  // Images grouped per colour. `image` below is a derived flat list for
  // components that just need "some" thumbnail regardless of colour.
  colors: { type: [colorSchema], default: [] },
  availableSizes: [{ type: String }],
  availableColors: [{ type: String }],
  // Per size×color inventory tracking
  variants: { type: [variantSchema], default: [] },
  isBestSeller: { type: String, enum: ['yes', 'no'], default: 'no' },
  // Units sold across delivered orders — real sales signal alongside the manual flag above
  soldCount: { type: Number, default: 0 },
  avgRating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  date: { type: Date, default: Date.now },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

productSchema.index({ mainCategory: 1 });
productSchema.index({ subcategory: 1 });
productSchema.index({ apparelType: 1 });

// Backward-compatible flat image list for cards/thumbnails that don't need a specific colour.
productSchema.virtual('image').get(function () {
  return (this.colors || []).flatMap((c) => (c.images || []).map((img) => img.url));
});

const Product = model('Product', productSchema);
export default Product;
