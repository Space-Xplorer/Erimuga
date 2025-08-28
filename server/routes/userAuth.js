import express from "express";
import passport from "passport";
import bcrypt from "bcrypt";
import userModel from "../models/userModel.js";
import 'dotenv/config';

const BASE_URL = process.env.BASE_URL;
const router = express.Router();

// ✅ Specific route for getting user by ID (more specific path)
router.get('/user/:id', async (req, res) => {
  try {
    const user = await userModel.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});ss.Router();

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
      cartData: req.user.cartData || []
    };
    console.log('✅ Returning user data:', userData.email);
    res.json(userData);
  } else {
    console.log('❌ Not authenticated, returning 401');
    res.status(401).json({ error: "Not authenticated" });
  }
});

// ✅ Registration
router.post("/register", async (req, res) => {
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
      _id: user._id,
      name: user.name,
      email: user.email,
      userType: user.userType,
    });
  } catch (error) {
    res.status(500).json({ error: "Registration failed", details: error.message });
  }
});

// ✅ Local login
router.post('/login', (req, res, next) => {
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
        cartData: user.cartData || []
      };
      
      return res.status(200).json({
        message: "Login successful",
        user: userData,
        sessionId: req.sessionID // Optional: for tracking
      });
    });
  })(req, res, next);
});

// ✅ Logout
router.post("/logout", (req, res) => {
  req.logout(() => {
    res.status(200).json({ message: "Logged out" });
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
      cartData: req.user.cartData || []
    };
    
    // Store in session for frontend to access
    req.session.userData = userData;
    
    // Redirect back to frontend with success parameter
    const redirectUrl = `${BASE_URL.endsWith('/') ? BASE_URL : BASE_URL + '/'}?auth=success`;
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

// ✅ Update addresses
router.put("/update-address", async (req, res) => {
  try {
    const { userId, address, addressId, action } = req.body;
    const user = await userModel.findById(userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    switch (action) {
      case "add":
        if (address.isDefault) {
          user.addresses.forEach((addr) => (addr.isDefault = false));
        }
        user.addresses.push(address);
        break;

      case "update": {
        const idx = user.addresses.findIndex((a) => a._id.toString() === address._id);
        if (idx === -1) return res.status(404).json({ message: "Address not found" });

        if (address.isDefault) {
          user.addresses.forEach((addr) => (addr.isDefault = false));
        }

        user.addresses[idx] = { ...user.addresses[idx]._doc, ...address };
        break;
      }

      case "delete":
        user.addresses = user.addresses.filter((a) => a._id.toString() !== addressId);
        break;

      case "set-default":
        user.addresses.forEach((addr) => {
          addr.isDefault = addr._id.toString() === addressId;
        });
        break;

      default:
        return res.status(400).json({ message: "Invalid action" });
    }

    await user.save();
    res.json({ success: true, user });
  } catch (err) {
    console.error("updateAddress error:", err);
    res.status(500).json({ message: "Server error", details: err.message });
  }
});

// ✅ IMPORTANT: This must stay LAST so it doesn’t catch /google
router.get('/:id', async (req, res) => {
  try {
    const user = await userModel.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
