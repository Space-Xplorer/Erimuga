import Counter from '../models/counterModel.js';

export const generateOrderNumber = async () => {
  const year = new Date().getFullYear();
  const counter = await Counter.findOneAndUpdate(
    { _id: `order-${year}` },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const serial = String(counter.seq).padStart(5, '0');
  return `ERM-${year}-${serial}`; // e.g. ERM-2026-00042
};
