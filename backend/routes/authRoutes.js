  const express = require("express");
  const bcrypt = require("bcryptjs");
  const jwt = require("jsonwebtoken");
  const passport = require("passport");
  const User = require("../models/User");

  const router = express.Router();

  // Register
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

  // Login
  router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h"
    });

    res.json({ message: "Login successful", token });
  });

  // Google OAuth Route
  router.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
  );

  router.get(
    "/google/callback",
    passport.authenticate("google", { session: false, failureRedirect: "/" }),
    (req, res) => {
      const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
        expiresIn: "1h"
      });
     
      console.log(`Redirecting to: https://s84-rohit-capstone-fakeplays.onrender.com/main?token=${token}`);
      res.redirect(`https://s84-rohit-capstone-fakeplays.onrender.com/main?token=${token}`);
    }
  );
  module.exports = router;
