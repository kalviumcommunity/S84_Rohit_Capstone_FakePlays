const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const User = require("../models/User");
require("dotenv").config();

const router = express.Router();

// Helper: determine if in production
const isProduction = process.env.NODE_ENV === "production";

// ----------------- Register -----------------
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password)
    return res.status(400).json({ error: "All fields are required" });

  const existingUser = await User.findOne({ username });
  if (existingUser)
    return res.status(400).json({ error: "User already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ username, email, password: hashedPassword });
  await newUser.save();

  res.status(201).json({ message: "User registered successfully" });
});

// ----------------- Login -----------------
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ error: "Invalid credentials" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

  res
    .cookie("token", token, {
      httpOnly: true,
      secure: isProduction, // secure only in production
      sameSite: "strict",
      maxAge: 60 * 60 * 1000, // 1 hour
    })
    .json({ message: "Login successful" });
});

// ----------------- Google OAuth -----------------
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    const redirectURL = isProduction
      ? "https://fake-plays.netlify.app/main"
      : "http://localhost:5173/main"; // Update port if using Vite

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "strict",
        maxAge: 60 * 60 * 1000,
      })
      .redirect(redirectURL);
  }
);

module.exports = router;
