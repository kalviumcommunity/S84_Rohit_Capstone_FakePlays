// server/index.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const passport = require("passport");
require("./passportSetup");

const chatRoutes = require("./routes/chat");
const authRoutes = require("./routes/authRoutes");
const authMiddleware = require("./middleware/authMiddleware");
const savedChatRoutes = require("./routes/savedChatRoutes");
const customBotRoutes = require("./routes/customBotRoutes");
const Message = require("./models/Message");

const app = express();
const PORT = process.env.PORT || 5000;

// ----------- CORS Setup -----------
const allowedOrigins = [
  "http://localhost:5173",
  "https://fakeplays.netlify.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        return callback(new Error("CORS policy does not allow access from this origin."), false);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

// ----------- Middleware -----------
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));
app.use(passport.initialize());

// ----------- Routes -----------
// Authentication routes
app.use("/api/auth", authRoutes);

// Chat routes
app.use("/api/chat", chatRoutes);

// Protected routes
app.use("/api/saved-chats", authMiddleware, savedChatRoutes);
app.use("/api/custom-bots", authMiddleware, customBotRoutes);

// ----------- Message CRUD -----------
app.post("/api/message", authMiddleware, async (req, res) => {
  try {
    const { message } = req.body;
    if (!req.user || !message) return res.status(400).json({ error: "User and message are required" });
    const newMessage = new Message({ user: req.user.id, message });
    await newMessage.save();
    res.status(201).json({ success: true, message: newMessage });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/message", authMiddleware, async (req, res) => {
  try {
    const messages = await Message.find({ user: req.user.id });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

app.put("/api/message/:id", authMiddleware, async (req, res) => {
  try {
    const { message } = req.body;
    const updatedMessage = await Message.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { message },
      { new: true }
    );
    if (!updatedMessage) return res.status(404).json({ error: "Message not found" });
    res.json({ success: true, message: updatedMessage });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

app.delete("/api/message/:id", authMiddleware, async (req, res) => {
  try {
    const deletedMessage = await Message.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!deletedMessage) return res.status(404).json({ error: "Message not found" });
    res.json({ success: true, response: "Message deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// ----------- Fake Bot Response Endpoint -----------
app.post("/api/fake-bot-response", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

    // TODO: Replace with Gemini/Shisa API integration
    // For now, just echo the prompt
    const botReply = `Bot says: ${prompt.substring(0, 200)}`;
    res.json({ text: botReply });
  } catch (err) {
    res.status(500).json({ text: "Error generating response" });
  }
});

// ----------- MongoDB Connection -----------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ----------- Start Server -----------
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
