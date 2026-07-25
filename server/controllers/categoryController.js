import mongoose from 'mongoose';
import MainCategory from '../models/mainCategoryModel.js';
import Subcategory from '../models/subCategoryModel.js';
import Product from '../models/productModel.js';
import Tag from '../models/tagModel.js';
import cloudinary, { uploadToCloudinary } from '../config/cloudinary.js';
import slugify from '../utils/slugify.js';
import fs from 'fs';

// Fields the storefront needs. Deliberately excludes featuredProducts —
// only the homepage endpoint populates those.
const PUBLIC_FIELDS = 'name slug order tagline description homepageImage showOnHomepage';

const shapeCategory = (cat, subs = [], { includeFeatured = false } = {}) => ({
  _id: cat._id,
  name: cat.name,
  slug: cat.slug,
  order: cat.order,
  tagline: cat.tagline,
  description: cat.description,
  homepageImage: cat.homepageImage,
  showOnHomepage: cat.showOnHomepage,
  // Admin only. The homepage endpoint deliberately blends real picks with a
  // newest-first fallback, so the editor can't tell them apart from there —
  // it needs the raw list.
  ...(includeFeatured ? { featuredProducts: cat.featuredProducts || [] } : {}),
  subcategories: subs.map((s) => ({ _id: s._id, name: s.name, slug: s.slug, order: s.order })),
});

// Public — the full tree, used by the nav, category pages and the admin pickers.
export const getCategories = async (req, res) => {
  try {
    const includeInactive = req.query.all === 'true';
    const catFilter = includeInactive ? {} : { isActive: true };

    const categories = await MainCategory.find(catFilter)
      .select(`${PUBLIC_FIELDS} isActive${includeInactive ? ' featuredProducts' : ''}`)
      .sort({ order: 1, name: 1 });

    const subs = await Subcategory.find(
      includeInactive ? {} : { isActive: true }
    ).sort({ order: 1, name: 1 });

    const byParent = subs.reduce((acc, s) => {
      const key = String(s.mainCategory);
      (acc[key] ||= []).push(s);
      return acc;
    }, {});

    res.status(200).json(
      categories.map((c) =>
        shapeCategory(c, byParent[String(c._id)] || [], { includeFeatured: includeInactive })
      )
    );
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories', details: err.message });
  }
};

// Public — one category by slug, for /collection/:slug
export const getCategoryBySlug = async (req, res) => {
  try {
    const category = await MainCategory.findOne({ slug: req.params.slug, isActive: true })
      .select(PUBLIC_FIELDS);
    if (!category) return res.status(404).json({ error: 'Category not found' });

    const subs = await Subcategory.find({ mainCategory: category._id, isActive: true })
      .sort({ order: 1, name: 1 });

    res.status(200).json(shapeCategory(category, subs));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch category', details: err.message });
  }
};

/* ---------------------------------------------------------------- admin --- */

export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'Name is required' });

    const slug = slugify(name);
    if (await MainCategory.findOne({ slug })) {
      return res.status(409).json({ error: `A category called "${name}" already exists` });
    }

    const count = await MainCategory.countDocuments();
    const category = await MainCategory.create({
      name: name.trim(),
      order: count + 1,
      tagline: req.body.tagline || '',
      description: req.body.description || '',
    });

    res.status(201).json({ message: 'Category created', category });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create category', details: err.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const category = await MainCategory.findById(req.params.id);
    if (!category) return res.status(404).json({ error: 'Category not found' });

    const { name, tagline, description, showOnHomepage, isActive, order, featuredProducts } = req.body;

    // Renaming changes the slug, which products store denormalised — so the
    // products have to move with it or they silently fall out of the category.
    if (name && name.trim() && name.trim() !== category.name) {
      const newSlug = slugify(name);
      const clash = await MainCategory.findOne({ slug: newSlug, _id: { $ne: category._id } });
      if (clash) return res.status(409).json({ error: `A category called "${name}" already exists` });

      const oldSlug = category.slug;
      category.name = name.trim();
      category.slug = newSlug;
      await Product.updateMany({ mainCategory: oldSlug }, { $set: { mainCategory: newSlug } });
    }

    if (req.file) {
      const result = await uploadToCloudinary(req.file.path, { folder: 'erimuga/categories' });
      fs.unlinkSync(req.file.path);
      if (category.homepageImage?.public_id) {
        await cloudinary.uploader.destroy(category.homepageImage.public_id).catch(() => {});
      }
      category.homepageImage = { url: result.url, public_id: result.public_id };
    }

    if (tagline !== undefined) category.tagline = tagline;
    if (description !== undefined) category.description = description;
    if (order !== undefined) category.order = Number(order) || 0;
    if (showOnHomepage !== undefined) {
      category.showOnHomepage = showOnHomepage === 'true' || showOnHomepage === true;
    }
    if (isActive !== undefined) {
      category.isActive = isActive === 'true' || isActive === true;
    }

    if (featuredProducts !== undefined) {
      const ids = Array.isArray(featuredProducts)
        ? featuredProducts
        : JSON.parse(featuredProducts || '[]');
      category.featuredProducts = ids.filter((id) => mongoose.isValidObjectId(id));
    }

    await category.save();
    res.status(200).json({ message: 'Category updated', category });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update category', details: err.message });
  }
};

// Reordering is a whole-list operation — sending them one at a time would leave
// the list in an inconsistent order between requests.
export const reorderCategories = async (req, res) => {
  try {
    const { order } = req.body; // array of category ids, in display order
    if (!Array.isArray(order)) return res.status(400).json({ error: 'order must be an array of ids' });

    await Promise.all(
      order.map((id, idx) => MainCategory.findByIdAndUpdate(id, { order: idx + 1 }))
    );
    res.status(200).json({ message: 'Order updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reorder categories', details: err.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const category = await MainCategory.findById(req.params.id);
    if (!category) return res.status(404).json({ error: 'Category not found' });

    // Refuse rather than orphan. The old metadata endpoint deleted blindly and
    // left products pointing at a category that no longer existed.
    const productCount = await Product.countDocuments({ mainCategoryId: category._id });
    if (productCount > 0) {
      return res.status(409).json({
        error: `${category.name} still has ${productCount} product${productCount === 1 ? '' : 's'}. Move or delete them first.`,
      });
    }
    const subCount = await Subcategory.countDocuments({ mainCategory: category._id });
    if (subCount > 0) {
      return res.status(409).json({
        error: `${category.name} still has ${subCount} subcategor${subCount === 1 ? 'y' : 'ies'}. Delete them first.`,
      });
    }

    if (category.homepageImage?.public_id) {
      await cloudinary.uploader.destroy(category.homepageImage.public_id).catch(() => {});
    }
    await MainCategory.findByIdAndDelete(category._id);

    res.status(200).json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete category', details: err.message });
  }
};

/* --------------------------------------------------------- subcategories --- */

export const createSubcategory = async (req, res) => {
  try {
    const parent = await MainCategory.findById(req.params.id);
    if (!parent) return res.status(404).json({ error: 'Category not found' });

    const { name } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'Name is required' });

    const slug = slugify(name);
    if (await Subcategory.findOne({ mainCategory: parent._id, slug })) {
      return res.status(409).json({ error: `${parent.name} already has a "${name}" subcategory` });
    }

    const count = await Subcategory.countDocuments({ mainCategory: parent._id });
    const sub = await Subcategory.create({
      name: name.trim(),
      mainCategory: parent._id,
      order: count + 1,
    });

    res.status(201).json({ message: 'Subcategory created', subcategory: sub });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create subcategory', details: err.message });
  }
};

export const updateSubcategory = async (req, res) => {
  try {
    const sub = await Subcategory.findOne({
      _id: req.params.subId,
      mainCategory: req.params.id,
    });
    if (!sub) return res.status(404).json({ error: 'Subcategory not found' });

    const { name, order, isActive } = req.body;

    if (name && name.trim() && name.trim() !== sub.name) {
      const newSlug = slugify(name);
      const clash = await Subcategory.findOne({
        mainCategory: sub.mainCategory,
        slug: newSlug,
        _id: { $ne: sub._id },
      });
      if (clash) return res.status(409).json({ error: `A "${name}" subcategory already exists here` });

      sub.name = name.trim();
      sub.slug = newSlug;
      // Matched by id, not old slug — subcategory slugs are only unique within
      // a parent, so a slug-based match could hit another category's records.
      await Product.updateMany({ subcategoryId: sub._id }, { $set: { subcategory: newSlug } });
    }

    if (order !== undefined) sub.order = Number(order) || 0;
    if (isActive !== undefined) sub.isActive = isActive === 'true' || isActive === true;

    await sub.save();
    res.status(200).json({ message: 'Subcategory updated', subcategory: sub });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update subcategory', details: err.message });
  }
};

export const deleteSubcategory = async (req, res) => {
  try {
    const sub = await Subcategory.findOne({
      _id: req.params.subId,
      mainCategory: req.params.id,
    });
    if (!sub) return res.status(404).json({ error: 'Subcategory not found' });

    const productCount = await Product.countDocuments({ subcategoryId: sub._id });
    if (productCount > 0) {
      return res.status(409).json({
        error: `${sub.name} still has ${productCount} product${productCount === 1 ? '' : 's'}. Move or delete them first.`,
      });
    }

    await Subcategory.findByIdAndDelete(sub._id);
    res.status(200).json({ message: 'Subcategory deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete subcategory', details: err.message });
  }
};

/* ------------------------------------------------------------------ tags --- */

// Returns full documents, not bare names — the admin needs the id to delete,
// and the product form only ever stores the name.
export const getTags = async (req, res) => {
  try {
    const tags = await Tag.find().select('name slug').sort({ name: 1 });
    res.status(200).json(tags);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tags', details: err.message });
  }
};

export const createTag = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'Name is required' });

    const existing = await Tag.findOne({ slug: slugify(name) });
    if (existing) return res.status(200).json({ message: 'Tag already exists', tag: existing });

    const tag = await Tag.create({ name: name.trim() });
    res.status(201).json({ message: 'Tag created', tag });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create tag', details: err.message });
  }
};

export const deleteTag = async (req, res) => {
  try {
    const tag = await Tag.findById(req.params.id);
    if (!tag) return res.status(404).json({ error: 'Tag not found' });

    // Tags are optional metadata, so unlike categories this can cascade safely.
    await Product.updateMany({ tags: tag.name }, { $pull: { tags: tag.name } });
    await Tag.findByIdAndDelete(tag._id);

    res.status(200).json({ message: 'Tag deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete tag', details: err.message });
  }
};
