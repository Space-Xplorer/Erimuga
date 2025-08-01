import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const productSchema = new Schema({
  productCode: { type: String, required: true, unique: true }, // Base code
  name: { type: String, required: true },
  mainCategory: { type: String, required: true },
  apparelType: { type: String, required: true },
  subcategory: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: [String], required: true },
  availableSizes: [{ type: String }], // e.g., ['S', 'M', 'L']
  availableColors: [{ type: String }], // e.g., ['Black', 'Blue']
  isBestSeller: { type: String, enum: ['yes', 'no'], default: 'no' },
  date: { type: Date, default: Date.now },
});

const Product = model('Product', productSchema);
export default Product;
