// routes/homepageRoutes.js
import express from 'express';
import {
  getHomepage,
  getHomepageSettings,
  updateHomepageSettings,
} from '../controllers/homepageController.js';
import { isLoggedIn, isAdmin } from '../middlewares/auth.js';
import upload from '../middlewares/multer.js';

const router = express.Router();

// Public — everything the homepage renders, in one request
router.get('/', getHomepage);
router.get('/settings', getHomepageSettings);

// Admin — the Homepage Studio's brand story + section headings
router.put('/settings', isLoggedIn, isAdmin, upload.single('image'), updateHomepageSettings);

export default router;
