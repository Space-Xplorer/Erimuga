// routes/metadataRoutes.js
import express from 'express';
import {
  getMetadata,
  addCategory,
  deleteCategory,
  addApparelType,
  deleteApparelType,
  addSubcategory,
  deleteSubcategory,
} from '../controllers/metadataController.js';
import { isLoggedIn, isAdmin } from '../middlewares/auth.js';

const router = express.Router();

// Public: storefront filters need to read metadata
router.get('/', getMetadata);

// Admin-only: mutating metadata (only ever called from the admin UI)
router.post('/category', isLoggedIn, isAdmin, addCategory);
router.delete('/category/:name', isLoggedIn, isAdmin, deleteCategory);

router.post('/apparelType', isLoggedIn, isAdmin, addApparelType);
router.delete('/apparelType/:name', isLoggedIn, isAdmin, deleteApparelType);

router.post('/subcategory', isLoggedIn, isAdmin, addSubcategory);
router.delete('/subcategory/:name', isLoggedIn, isAdmin, deleteSubcategory);

export default router;
