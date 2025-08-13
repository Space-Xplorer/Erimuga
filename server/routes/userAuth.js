import express from 'express';
import { registerUser, loginUser, logoutUser, getUserProfile, updateUserProfile } from '../controllers/userController.js';
import { isAuthenticated } from '../middlewares/auth.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/logout', logoutUser);
router.get('/auth/:userId', isAuthenticated, getUserProfile);

// Add new routes for profile updates
router.put('/update-profile', isAuthenticated, updateUserProfile);
router.put('/update-address', isAuthenticated, updateUserProfile);

export default router;
