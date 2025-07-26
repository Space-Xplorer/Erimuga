import express from "express";
import passport from "passport";
import bcrypt from "bcrypt";
import userModel from "../models/userModel.js";

const router = express.Router();

// server/routes/user.js (or auth.js)
router.get('/me', (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(401).json({ error: "Not authenticated" });
  }
});


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

// Local Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.status(200).json({
      message: "Logged in successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType
      },
      token: user._id // Using user._id as a simple token for now
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
});

// Logout
router.post("/logout", (req, res) => {
  req.logout(() => {
    res.status(200).json({ message: "Logged out" });
  });
});

// Google OAuth
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get("/google/callback", passport.authenticate("google", {
  failureRedirect: "/login",
  successRedirect: "http://localhost:5173/"
}));

export default router;
