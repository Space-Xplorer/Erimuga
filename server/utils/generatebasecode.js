// utils/generateBaseCode.js
import Product from "../models/productModel.js";

const getInitial = (str) => str?.trim().charAt(0).toUpperCase() || 'X';

export const generateBaseProductCode = async (mainCategory, subcategory, apparelType) => {
  const prefix = `${getInitial(mainCategory)}${getInitial(subcategory)}-${getInitial(apparelType)}`;

  // Count existing products with same prefix
  const existingCount = await Product.countDocuments({
    productCode: { $regex: `^${prefix}-\\d{4}$` }
  });

  const serial = String(existingCount + 1).padStart(4, '0');

  return `${prefix}-${serial}`; // e.g., TS-MEN-0001
};
