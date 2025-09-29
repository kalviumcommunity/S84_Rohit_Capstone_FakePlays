const express = require("express");
const router = express.Router();
const SavedChat = require("../models/SavedChat");
const authMiddleware = require("../middleware/authMiddleware");

// Upsert a saved chat for a bot
router.post("/upsert", authMiddleware, async (req, res) => {
  try {
    const { botPath, botName, messages } = req.body;
    if (!botPath || !botName || !Array.isArray(messages)) {
      return res.status(400).json({ error: "botPath, botName, and messages are required" });
    }

    const updatedChat = await SavedChat.findOneAndUpdate(
      { user: req.user.id, botPath },
      { botName, messages },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ success: true, chat: updatedChat });
  } catch (err) {
    console.error("Error in /upsert:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// List all saved chats for the authenticated user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const chats = await SavedChat.find({ user: req.user.id })
      .select("botPath botName messages updatedAt")
      .sort({ updatedAt: -1 });
    res.json({ success: true, chats });
  } catch (err) {
    console.error("Error in GET /:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get a specific saved chat by botPath
router.get("/:botPath", authMiddleware, async (req, res) => {
  try {
    const chat = await SavedChat.findOne({
      user: req.user.id,
      botPath: req.params.botPath
    });
    if (!chat) return res.status(404).json({ error: "Not found" });
    res.json({ success: true, chat });
  } catch (err) {
    console.error(`Error in GET /${req.params.botPath}:`, err);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete a saved chat by botPath
router.delete("/:botPath", authMiddleware, async (req, res) => {
  try {
    const deletedChat = await SavedChat.findOneAndDelete({
      user: req.user.id,
      botPath: req.params.botPath
    });
    if (!deletedChat) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  } catch (err) {
    console.error(`Error in DELETE /${req.params.botPath}:`, err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
