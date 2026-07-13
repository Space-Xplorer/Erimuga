import validator from 'validator';

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

export const validateProduct = (req, res, next) => {
  const { name, price, mainCategory, apparelType, subcategory } = req.body;

  if (!name || name.trim().length < 2) {
    return res.status(400).json({ error: 'Product name must be at least 2 characters' });
  }
  if (!price || isNaN(price) || Number(price) <= 0) {
    return res.status(400).json({ error: 'Price must be a positive number' });
  }
  if (!mainCategory || !mainCategory.trim()) {
    return res.status(400).json({ error: 'Category is required' });
  }
  if (!apparelType || !apparelType.trim()) {
    return res.status(400).json({ error: 'Apparel type is required' });
  }
  if (!subcategory || !subcategory.trim()) {
    return res.status(400).json({ error: 'Subcategory is required' });
  }

  next();
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
