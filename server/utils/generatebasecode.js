// utils/generateBaseCode.js
import Counter from '../models/counterModel.js';

const getInitial = (str) => str?.trim().charAt(0).toUpperCase() || 'X';

// Prefix is derived from the category pair only. Tags are optional and
// cross-cutting, so they can't contribute to a stable product code.
export const generateBaseProductCode = async (mainCategory, subcategory) => {
  const prefix = `${getInitial(mainCategory)}${getInitial(subcategory)}`;

  const counter = await Counter.findOneAndUpdate(
    { _id: `product-${prefix}` },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const serial = String(counter.seq).padStart(4, '0');
  return `${prefix}-${serial}`; // e.g., SE-0001 (Sarees / Eri Silk)
};
