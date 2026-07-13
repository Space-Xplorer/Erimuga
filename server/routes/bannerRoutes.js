import express from 'express';
import { getActiveBanners, getAllBanners, createBanner, updateBanner, deleteBanner } from '../controllers/bannerController.js';
import { isLoggedIn, isAdmin } from '../middlewares/auth.js';
import upload from '../middlewares/multer.js';

const router = express.Router();

// Public — storefront homepage carousel
router.get('/', getActiveBanners);

// Admin management
router.get('/admin/all', isLoggedIn, isAdmin, getAllBanners);
router.post('/', isLoggedIn, isAdmin, upload.single('image'), createBanner);
router.put('/:id', isLoggedIn, isAdmin, upload.single('image'), updateBanner);
router.delete('/:id', isLoggedIn, isAdmin, deleteBanner);

export default router;
