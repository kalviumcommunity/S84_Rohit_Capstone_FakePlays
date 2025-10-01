const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User"); // Adjust path based on your project structure

const router = express.Router();

// ----------- Local Authentication -----------

// @route   POST /api/auth/register
// @desc    Register a new user
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: "User with this email already exists" });
    }
    user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ error: "Username is already taken" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    user = new User({ username, email, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Server error during registration" });
  }
});

// @route   POST /api/auth/login
// @desc    Login user and return JWT
router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user || !user.password) { // Check for password existence for OAuth users
            return res.status(400).json({ error: "Invalid credentials or use social login" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        const payload = { id: user.id };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });

        res.json({ token });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Server error during login" });
    }
});


// ----------- Google OAuth2 -----------

// @route   GET /api/auth/google
// @desc    Initiate Google OAuth flow
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// @route   GET /api/auth/google/callback
// @desc    Google OAuth callback URL
router.get(
  "/google/callback",
  passport.authenticate("google", {
    // We use JWTs, so session support is not needed.
    session: false,
    // Redirect to frontend login page on failure
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=google-auth-failed`,
  }),
  (req, res) => {
    // Passport attaches the authenticated user to `req.user`
    if (!req.user) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=authentication-failed`);
    }

    // Create a JWT for the authenticated user
    const payload = { id: req.user._id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // Redirect the user back to the frontend with the token in the query params
    res.redirect(`${process.env.FRONTEND_URL}/login?token=${token}`);
  }
);

module.exports = router;