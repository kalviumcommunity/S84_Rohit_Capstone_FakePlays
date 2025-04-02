const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/api/message", (req, res) => {
  res.json({ message: "Hello from the backend..." });
});

app.post("/api/message", (req, res) => {
  const { user, message } = req.body;
  
  if (!user || !message) {
    return res.status(400).json({ error: "User and message are required" });
  }

  res.status(201).json({ success: true, response: `Message from ${user}: ${message}` });
});


// Starting server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
