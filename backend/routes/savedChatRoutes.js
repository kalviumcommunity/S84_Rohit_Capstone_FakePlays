// server/routes/savedChatRoutes.js
const express = require("express");
const router = express.Router();
const SavedChat = require("../models/SavedChat");

// Upsert saved chat for a bot
router.post("/upsert", async (req, res) => {
  try {
    const { botPath, botName, messages } = req.body;
    if (!botPath || !botName || !Array.isArray(messages)) {
      return res.status(400).json({ error: "botPath, botName, messages required" });
    }

    const updated = await SavedChat.findOneAndUpdate(
      { user: req.user.id, botPath },
      { botName, messages },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ success: true, chat: updated });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// List all saved chats for current user
router.get("/", async (req, res) => {
  try {
    const chats = await SavedChat.find({ user: req.user.id })
      .select("botPath botName updatedAt messages")
      .sort({ updatedAt: -1 });
    res.json({ success: true, chats });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get saved chat by botPath
router.get("/:botPath", async (req, res) => {
  try {
    const chat = await SavedChat.findOne({
      user: req.user.id,
      botPath: req.params.botPath
    });
    if (!chat) return res.status(404).json({ error: "Not found" });
    res.json({ success: true, chat });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// NEW: Delete saved chat by botPath
router.delete("/:botPath", async (req, res) => {
  try {
    const deleted = await SavedChat.findOneAndDelete({
      user: req.user.id,
      botPath: req.params.botPath
    });
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
