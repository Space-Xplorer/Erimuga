import Product from "../models/productModel.js";
import slugify from "../utils/slugify.js";

const MAX_LIMIT = 100;

const getProducts = async (req, res) => {
  try {
    const { search, mainCategory, subcategory, tag, sortBy, page, limit } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    // Category params are slugs. slugify() is applied so a display name
    // ("Eri Silk") coming from an older client still resolves.
    if (mainCategory) query.mainCategory = slugify(mainCategory);
    if (subcategory) query.subcategory = slugify(subcategory);
    if (tag) query.tags = tag;

    let sort = { date: -1 }; // default: newest first
    if (sortBy === 'priceLowHigh') sort = { price: 1 };
    else if (sortBy === 'priceHighLow') sort = { price: -1 };

    // Unbounded by default previously — a growing catalogue would have kept
    // shipping the whole thing to every client.
    const perPage = Math.min(Number(limit) || MAX_LIMIT, MAX_LIMIT);
    const currentPage = Math.max(Number(page) || 1, 1);

    const [products, total] = await Promise.all([
      Product.find(query).sort(sort).skip((currentPage - 1) * perPage).limit(perPage),
      Product.countDocuments(query),
    ]);

    // Kept as a bare array: every existing caller does `res.data.map(...)`.
    // Pagination travels in headers so those callers keep working.
    res.set('X-Total-Count', String(total));
    res.set('X-Page', String(currentPage));
    res.set('X-Per-Page', String(perPage));
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

// Get product by ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch product" });
  }
};

export {
  getProducts,
  getProductById
};
