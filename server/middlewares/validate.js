import validator from 'validator';
import MainCategory from '../models/mainCategoryModel.js';
import Subcategory from '../models/subCategoryModel.js';
import slugify from '../utils/slugify.js';

export const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || name.trim().length < 2) {
    return res.status(400).json({ error: 'Name must be at least 2 characters' });
  }
  if (!email || !validator.isEmail(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address' });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !validator.isEmail(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address' });
  }
  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }

  next();
};

// Resolves the category slugs on the request into real documents and proves the
// subcategory actually belongs to the given main category — a check the old flat
// model could not express. On success attaches `req.resolvedCategory`.
export const validateProduct = async (req, res, next) => {
  const { name, price, mainCategory, subcategory } = req.body;

  if (!name || name.trim().length < 2) {
    return res.status(400).json({ error: 'Product name must be at least 2 characters' });
  }
  if (!price || isNaN(price) || Number(price) <= 0) {
    return res.status(400).json({ error: 'Price must be a positive number' });
  }
  if (!mainCategory || !String(mainCategory).trim()) {
    return res.status(400).json({ error: 'Category is required' });
  }
  if (!subcategory || !String(subcategory).trim()) {
    return res.status(400).json({ error: 'Subcategory is required' });
  }

  try {
    const main = await MainCategory.findOne({ slug: slugify(mainCategory) });
    if (!main) {
      return res.status(400).json({ error: `Unknown category "${mainCategory}"` });
    }

    const sub = await Subcategory.findOne({
      mainCategory: main._id,
      slug: slugify(subcategory),
    });
    if (!sub) {
      return res.status(400).json({
        error: `"${subcategory}" is not a subcategory of ${main.name}`,
      });
    }

    req.resolvedCategory = { main, sub };
    next();
  } catch (err) {
    return res.status(500).json({ error: 'Failed to validate category', details: err.message });
  }
};

export const validateAddress = (address, res) => {
  if (!address) { res.status(400).json({ error: 'Address is required' }); return false; }
  if (!address.street || address.street.trim().length < 3) {
    res.status(400).json({ error: 'Street address must be at least 3 characters' }); return false;
  }
  if (!address.city || address.city.trim().length < 2) {
    res.status(400).json({ error: 'City is required' }); return false;
  }
  if (!address.state || address.state.trim().length < 2) {
    res.status(400).json({ error: 'State is required' }); return false;
  }
  if (!address.postalCode || !/^\d{6}$/.test(address.postalCode.trim())) {
    res.status(400).json({ error: 'Postal code must be a 6-digit PIN code' }); return false;
  }
  return true;
};

export const validatePhone = (phone, res) => {
  if (!phone || !/^\d{10}$/.test(phone.replace(/\s/g, ''))) {
    res.status(400).json({ error: 'Please enter a valid 10-digit phone number' });
    return false;
  }
  return true;
};
