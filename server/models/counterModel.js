import mongoose from 'mongoose';

// Backs atomic, collision-safe sequence generation (order numbers, product codes)
// via findOneAndUpdate + $inc, instead of racy countDocuments()-based counting.
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

const Counter = mongoose.models.Counter || mongoose.model('Counter', counterSchema);
export default Counter;
