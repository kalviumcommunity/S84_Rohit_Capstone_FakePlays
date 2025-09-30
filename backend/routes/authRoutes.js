const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const cookieParser = require("cookie-parser");
const User = require("../models/User");

const router = express.Router();

// ----------------- Middleware -----------------
router.use(cookieParser());
const JWT_SECRET = process.env.JWT_SECRET || "default_secret_key";

// ----------------- Helper: generate token -----------------
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "1h" });
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

  res
    .cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 60 * 60 * 1000, // 1 hour
    })
    .json({ message: "Login successful" });
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

    // Dynamically detect redirect URL
    const host = req.headers.host; // e.g., localhost:5173 or fakeplays.netlify.app
    let redirectURL = "";

    if (host.includes("localhost")) {
      redirectURL = "http://localhost:5173/main"; // your local frontend
    } else {
      redirectURL = "https://fake-plays.netlify.app/main"; // deployed frontend
    }

    res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 60 * 60 * 1000,
      })
      .redirect(redirectURL);
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
