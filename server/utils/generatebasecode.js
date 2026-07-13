// utils/generateBaseCode.js
import Counter from '../models/counterModel.js';

const getInitial = (str) => str?.trim().charAt(0).toUpperCase() || 'X';

export const generateBaseProductCode = async (mainCategory, subcategory, apparelType) => {
  const prefix = `${getInitial(mainCategory)}${getInitial(subcategory)}-${getInitial(apparelType)}`;

  const counter = await Counter.findOneAndUpdate(
    { _id: `product-${prefix}` },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const serial = String(counter.seq).padStart(4, '0');
  return `${prefix}-${serial}`; // e.g., TS-MEN-0001
};
