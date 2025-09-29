const express = require("express");
const router = express.Router();
const CustomBot = require("../models/CustomBot");

// Create or update a custom bot (upsert)
router.post("/upsert", async (req, res) => {
  try {
    const {
      path,
      name,
      subtitle,
      img,
      desc,
      initialMessage,
      prompt,
      isCustom = true
    } = req.body;

    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!path || !name || !img || !initialMessage || !prompt) {
      return res.status(400).json({
        error: "path, name, img, initialMessage, and prompt are required"
      });
    }

    const bot = await CustomBot.findOneAndUpdate(
      { user: req.user.id, path },
      { name, subtitle, img, desc, initialMessage, prompt, isCustom: !!isCustom },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ success: true, bot });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "Bot path already exists" });
    }
    res.status(500).json({ error: "Server error" });
  }
});

// List all custom bots for the user
router.get("/", async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const bots = await CustomBot.find({ user: req.user.id })
      .select("path name subtitle img desc isCustom updatedAt")
      .sort({ updatedAt: -1 });

    res.json({ success: true, bots });
  } catch (_err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get a single custom bot by path
router.get("/:path", async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const bot = await CustomBot.findOne({
      user: req.user.id,
      path: req.params.path
    });
    if (!bot) return res.status(404).json({ error: "Not found" });
    res.json({ success: true, bot });
  } catch (_err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Delete a custom bot by path
router.delete("/:path", async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const deleted = await CustomBot.findOneAndDelete({
      user: req.user.id,
      path: req.params.path
    });
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  } catch (_err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
