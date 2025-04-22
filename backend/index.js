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

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes for authentication and chat
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes); 
app.use("/api/auth", authRoutes); 

// Protected message routes
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
      user: req.user.id
    });

    if (!deletedMessage) {
      return res.status(404).json({ error: "Message not found" });
    }

    res.json({ success: true, response: "Message deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
