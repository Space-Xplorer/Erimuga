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

const router = express.Router();

router.get('/', getMetadata);

router.post('/category', addCategory);
router.delete('/category/:name', deleteCategory);

router.post('/apparelType', addApparelType);
router.delete('/apparelType/:name', deleteApparelType);

router.post('/subcategory', addSubcategory);
router.delete('/subcategory/:name', deleteSubcategory);

export default router;
