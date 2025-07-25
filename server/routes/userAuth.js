import express from "express";
import passport from "passport";
import bcrypt from "bcrypt";
import userModel from "../models/userModel.js";

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const user = await userModel.create({ name, email, password: hashed });
    res.status(201).json(user);
  } catch (error) {
    if (error.code === 11000 && error.keyPattern?.email) {
      return res.status(400).json({ message: "Email already registered" });
    }
    res.status(500).json({ message: "Server error during registration" });
  }
});

// Local Login
router.post("/login", passport.authenticate("local"), (req, res) => {
  res.status(200).json({ message: "Logged in successfully", user: req.user });
});

// Logout
router.get("/logout", (req, res) => {
  req.logout(() => {
    res.status(200).json({ message: "Logged out" });
  });
});

// Google OAuth
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get("/google/callback", passport.authenticate("google", {
  failureRedirect: "/login",
  successRedirect: "/"
}));

export default router;
