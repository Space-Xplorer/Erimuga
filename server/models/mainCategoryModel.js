// models/mainCategoryModel.js
import mongoose from 'mongoose';
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
});
export default mongoose.model('MainCategory', categorySchema);
