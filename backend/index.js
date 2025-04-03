const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const Message = require("./models/Message");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));


app.post("/api/message", async (req, res) => {
  try {
    const { user, message } = req.body;
    if (!user || !message) {
      return res.status(400).json({ error: "User and message are required" });
    }

    const newMessage = new Message({ user, message });
    await newMessage.save();

    res.status(201).json({ success: true, message: newMessage });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});


app.get("/api/message", async (req, res) => {
  try {
    const messages = await Message.find(); // Fetch all messages
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});


app.put("/api/message/:id", async (req, res) => {
  try {
    const { message } = req.body;
    const updatedMessage = await Message.findByIdAndUpdate(req.params.id, { message }, { new: true });

    if (!updatedMessage) {
      return res.status(404).json({ error: "Message not found" });
    }

    res.json({ success: true, message: updatedMessage });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});


app.delete("/api/message/:id", async (req, res) => {
  try {
    const deletedMessage = await Message.findByIdAndDelete(req.params.id);
    if (!deletedMessage) {
      return res.status(404).json({ error: "Message not found" });
    }

    res.json({ success: true, response: "Message deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Starting Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
