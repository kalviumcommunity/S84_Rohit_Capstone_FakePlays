const express = require("express");
const router = express.Router();
const axios = require("axios");

// Hardcode Gemini API key (replace with your valid key)
const GEMINI_API_KEY = "your_gemini_api_key_here"; // TODO: Replace with actual key from Google AI Studio

router.post("/ask", async (req, res) => {
  const { prompt } = req.body;

  // Validate prompt
  if (!prompt || typeof prompt !== "string" || prompt.trim() === "") {
    return res.status(400).json({ reply: "Invalid or missing prompt." });
  }

  // Validate API key
  if (!GEMINI_API_KEY || GEMINI_API_KEY === "your_gemini_api_key_here") {
    console.error("GEMINI_API_KEY is not set or invalid");
    return res.status(500).json({ reply: "Server configuration error: Missing or invalid API key." });
  }

  console.log("Received prompt:", prompt);
  console.log("Using API key (partial):", GEMINI_API_KEY.slice(0, 5) + "...");

  try {
    const geminiRes = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt.trim() }] }],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const reply = geminiRes.data.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't think of a reply!";
    res.json({ reply });
  } catch (err) {
    console.error("Gemini API Error:", {
      message: err.message,
      status: err.response?.status,
      data: err.response?.data,
    });
    res.status(500).json({
      reply: "Error connecting to AI service.",
      error: err.response?.data?.error?.message || err.message,
    });
  }
});

module.exports = router;