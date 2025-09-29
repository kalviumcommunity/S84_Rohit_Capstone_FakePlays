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
const Message = require("./models/Message");

const savedChatRoutes = require("./routes/savedChatRoutes");
const customBotRoutes = require("./routes/customBotRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// ----------- CORS Setup -----------
const allowedOrigins = [
  "http://localhost:5173",         // Local Vite frontend
  "https://fake-plays.netlify.app/",  // Example deployed frontend
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like Postman or mobile apps)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = "CORS policy does not allow access from this origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true, // Allow cookies / auth headers
  })
);

// ----------- Middleware -----------
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));
app.use(passport.initialize());

// ----------- Routes -----------
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/auth", authRoutes);

// Protected routes
app.use("/api/saved-chats", authMiddleware, savedChatRoutes);
app.use("/api/custom-bots", authMiddleware, customBotRoutes);

// ----------- Message CRUD -----------
app.post("/api/message", authMiddleware, async (req, res) => {
  try {
    const { message } = req.body;
    if (!req.user || !message) {
      return res.status(400).json({ error: "User and message are required" });
    }
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
    if (!updatedMessage) {
      return res.status(404).json({ error: "Message not found" });
    }
    res.json({ success: true, message: updatedMessage });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

app.delete("/api/message/:id", authMiddleware, async (req, res) => {
  try {
    const deletedMessage = await Message.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });
    if (!deletedMessage) {
      return res.status(404).json({ error: "Message not found" });
    }
    res.json({ success: true, response: "Message deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
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
