// routes/categoryRoutes.js
import express from 'express';
import {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  reorderCategories,
  deleteCategory,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
  getTags,
  createTag,
  deleteTag,
} from '../controllers/categoryController.js';
import { isLoggedIn, isAdmin } from '../middlewares/auth.js';
import upload from '../middlewares/multer.js';

const router = express.Router();
const admin = [isLoggedIn, isAdmin];

// Public — nav, category pages, storefront filters
router.get('/', getCategories);
router.get('/tags', getTags);
router.get('/:slug', getCategoryBySlug);

// Admin — main categories
router.post('/', ...admin, createCategory);
router.put('/reorder', ...admin, reorderCategories); // before /:id so "reorder" isn't read as an id
router.put('/:id', ...admin, upload.single('image'), updateCategory);
router.delete('/:id', ...admin, deleteCategory);

// Admin — subcategories, always scoped to their parent
router.post('/:id/subcategories', ...admin, createSubcategory);
router.put('/:id/subcategories/:subId', ...admin, updateSubcategory);
router.delete('/:id/subcategories/:subId', ...admin, deleteSubcategory);

// Admin — tags
router.post('/tags', ...admin, createTag);
router.delete('/tags/:id', ...admin, deleteTag);

export default router;
