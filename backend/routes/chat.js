const express = require("express");
const axios = require("axios");  // Make sure axios is installed
const router = express.Router();

// Sample POST route for /api/chat/ask
router.post("/ask", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/completions.create",
      {
        model: "shisa-ai/shisa-v2-llama3.3-70b:free",
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    
    res.json({ reply: response.data.choices[0].message.content });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "AI response failed" });
  }
});

module.exports = router;
