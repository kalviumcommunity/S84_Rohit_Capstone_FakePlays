const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const cookieParser = require("cookie-parser");
const axios = require('axios');
const User = require("../models/User");

const router = express.Router();

// ----------------- Middleware -----------------
router.use(cookieParser());
const JWT_SECRET = process.env.JWT_SECRET || "default_secret_key";
const GA_MEASUREMENT_ID = 'G-74C02FEQVM';
const GA_API_SECRET = 'YOUR_API_SECRET'; // Replace with your actual API Secret from GA4

// ----------------- Helper: generate token -----------------
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "1h" });
};

// Function to send GA event from server
const sendGAEvent = async (eventName, params = {}) => {
  try {
    await axios.post(
      `https://www.google-analytics.com/mp/collect?measurement_id=${GA_MEASUREMENT_ID}&api_secret=${GA_API_SECRET}`,
      {
        client_id: 'server-client', // Use a fixed or dynamic client ID
        events: [{
          name: eventName,
          params,
        }],
      }
    );
  } catch (err) {
    console.error('GA tracking error:', err);
  }
};

// ----------------- Register -----------------
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password)
    return res.status(400).json({ error: "All fields are required" });

  const existingUser = await User.findOne({ username });
  if (existingUser) return res.status(400).json({ error: "User already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ username, email, password: hashedPassword });
  await newUser.save();

  // Track signup event
  sendGAEvent('sign_up', { method: 'email' });

  res.status(201).json({ message: "User registered successfully" });
});

// ----------------- Login -----------------
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ error: "Invalid credentials" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

  const token = generateToken(user._id);

  // Track login event
  sendGAEvent('login', { method: 'email' });

  res
    .cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 60 * 60 * 1000, // 1 hour
    })
    .json({ message: "Login successful", token });
});

// ----------------- Logout -----------------
router.post("/logout", (req, res) => {
  res.clearCookie("token").json({ message: "Logged out successfully" });
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
    const token = generateToken(req.user._id);

    // Track login event for Google
    sendGAEvent('login', { method: 'google' });

    // Dynamically detect redirect URL
    const host = req.headers.host; // e.g., localhost:5173 or fakeplays.netlify.app
    let redirectURL = "";

    if (host.includes("localhost")) {
      redirectURL = "http://localhost:5173/main"; // your local frontend
    } else {
      redirectURL = "https://fake-plays.netlify.app/main"; // deployed frontend
    }

    res.redirect(`${redirectURL}?token=${token}`);
  }
);

// ----------------- Verify Token -----------------
router.get("/verify", (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "Not authenticated" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ id: decoded.id });
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
});

module.exports = router;