// models/apparelTypeModel.js
import mongoose from 'mongoose';
const apparelTypeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
});
export default mongoose.model('ApparelType', apparelTypeSchema);
