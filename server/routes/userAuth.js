import express from "express";
import passport from "passport";
import bcrypt from "bcrypt";
import userModel from "../models/userModel.js";
import 'dotenv/config';

const BASE_URL = process.env.BASE_URL;

const router = express.Router();

// ✅ Get current logged-in user
router.get('/me', (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
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
    if (!user) return res.status(401).json({ message: info.message || 'Invalid credentials' });

    req.login(user, (err) => {
      if (err) return next(err);
      console.log("User logged in:", user);
      return res.status(200).json({
        message: "Login successful",
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          userType: user.userType
        }
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
    // Redirect back to frontend (dashboard, home, etc.)
    res.redirect(BASE_URL.endsWith('/') ? BASE_URL : BASE_URL + '/');
  }
);

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
