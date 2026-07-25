import express from "express";
import passport from "passport";
import bcrypt from "bcrypt";
import userModel from "../models/userModel.js";
import { validateRegister, validateLogin, validateAddress } from '../middlewares/validate.js';
import { isLoggedIn } from '../middlewares/auth.js';
import { exportMyData, deleteMyAccount } from '../controllers/complianceController.js';
import 'dotenv/config';

const BASE_URL = process.env.BASE_URL;
const router = express.Router();

// ✅ Get current logged-in user with complete data
router.get('/me', (req, res) => {
  console.log('🔍 /me endpoint hit - Session ID:', req.sessionID);
  console.log('🔍 Authenticated?', req.isAuthenticated());
  console.log('🔍 User in session:', req.user ? req.user.email : 'No user');
  console.log('🔍 Session data:', req.session);
  
  if (req.isAuthenticated()) {
    const userData = {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      userType: req.user.userType,
      phonenumber: req.user.phonenumber || '',
      addresses: req.user.addresses || [],
      cartData: req.user.cartData || [],
      // Lets the client show a password field vs "type DELETE" on account deletion.
      isGoogle: Boolean(req.user.googleId),
    };
    console.log('✅ Returning user data:', userData.email);
    res.json(userData);
  } else {
    console.log('❌ Not authenticated, returning 401');
    res.status(401).json({ error: "Not authenticated" });
  }
});

// ✅ Registration
router.post("/register", validateRegister, async (req, res) => {
  try {
    const { name, email, password, userType = "user" } = req.body;

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await userModel.create({
      name,
      email,
      password: hashed,
      userType,
    });

    res.status(201).json({
      success: true,
      message: "Registration successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType,
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: "Registration failed", details: error.message });
  }
});

// ✅ Local login - Enhanced with better session handling
router.post('/login', validateLogin, (req, res, next) => {
  console.log('🔐 Login attempt for email:', req.body.email);
  
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ message: info.message });

    req.login(user, (err) => {
      if (err) return next(err);
      
      // ✅ Return complete user data including addresses
      const userData = {
        _id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        phonenumber: user.phonenumber || '',
        addresses: user.addresses || [],
        cartData: user.cartData || [],
        isGoogle: Boolean(user.googleId),
      };

      return res.status(200).json({
        message: "Login successful",
        user: userData,
        sessionId: req.sessionID // Optional: for tracking
      });
    });
  })(req, res, next);
});

// ✅ Logout - Enhanced with session cleanup
router.post("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ 
        success: false,
        error: "Logout failed" 
      });
    }
    
    // Destroy session
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destruction error:', err);
        return res.status(500).json({ 
          success: false,
          error: "Failed to destroy session" 
        });
      }
      
      res.clearCookie('erimuga.sid');
      res.status(200).json({ 
        success: true,
        message: "Logged out successfully" 
      });
    });
  });
});

// ✅ Google OAuth (placed ABOVE /:id)
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
  }),
  (req, res) => {
    // ✅ Store complete user data in session
    const userData = {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      userType: req.user.userType,
      phonenumber: req.user.phonenumber || '',
      addresses: req.user.addresses || [],
      cartData: req.user.cartData || [],
      orders: req.user.orders || [] // ✅ Include orders array
    };
    
    // Store in session for frontend to access
    req.session.userData = userData;
    
    // Redirect back to frontend with success parameter
    const frontendUrl = process.env.FRONTEND_URL || 'https://www.erindmuga.com';
    const redirectUrl = `${frontendUrl}?auth=success`;
    res.redirect(redirectUrl);
  }
);

// ✅ Update user profile and return updated data
router.put('/update-profile', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { name, phonenumber } = req.body;
    const userId = req.user._id;

    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { name, phonenumber },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // ✅ Return complete updated user data for frontend
    const userData = {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      userType: updatedUser.userType,
      phonenumber: updatedUser.phonenumber || '',
      addresses: updatedUser.addresses || [],
      cartData: updatedUser.cartData || []
    };

    res.json({
      message: 'Profile updated successfully',
      user: userData
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile', details: error.message });
  }
});

// ✅ Update addresses — userId always from session, never from body
router.put("/update-address", async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });

  try {
    const { address, addressId, action } = req.body;
    const user = await userModel.findById(req.user._id);

    if (!user) return res.status(404).json({ message: "User not found" });

    switch (action) {
      case "add": {
        if (!validateAddress(address, res)) return;
        // First address added is automatically the default
        const isFirst = user.addresses.length === 0;
        if (address.isDefault || isFirst) {
          user.addresses.forEach((addr) => (addr.isDefault = false));
          address.isDefault = true;
        }
        user.addresses.push(address);
        break;
      }

      case "update": {
        if (!validateAddress(address, res)) return;
        const idx = user.addresses.findIndex((a) => a._id.toString() === (address._id || addressId));
        if (idx === -1) return res.status(404).json({ message: "Address not found" });

        if (address.isDefault) {
          user.addresses.forEach((addr) => (addr.isDefault = false));
        }

        user.addresses[idx] = { ...user.addresses[idx]._doc, ...address };
        break;
      }

      case "delete": {
        const deletingDefault = user.addresses.find(
          (a) => a._id.toString() === addressId && a.isDefault
        );
        user.addresses = user.addresses.filter((a) => a._id.toString() !== addressId);
        // Auto-promote the first remaining address to default if the deleted one was default
        if (deletingDefault && user.addresses.length > 0) {
          user.addresses[0].isDefault = true;
        }
        break;
      }

      case "set-default":
        user.addresses.forEach((addr) => {
          addr.isDefault = addr._id.toString() === addressId;
        });
        break;

      default:
        return res.status(400).json({ message: "Invalid action" });
    }

    user.markModified('addresses');
    await user.save();
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ message: "Server error", details: err.message });
  }
});

// ── DPDP data rights ──────────────────────────────────────────────
// Access: download everything we hold about you.
router.get('/export-data', isLoggedIn, exportMyData);
// Erasure: delete the account (anonymises, retaining legally-required orders).
router.delete('/account', isLoggedIn, deleteMyAccount);

export default router;
