import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../styles/style.css";

function CreateBot() {
  const [botName, setBotName] = useState("");
  const [situation, setSituation] = useState("");
  const [initialMessage, setInitialMessage] = useState("");
  const [botImage, setBotImage] = useState(null);
  const [botImagePreview, setBotImagePreview] = useState(null);

  const navigate = useNavigate();
  const API_BASE =  "https://s84-rohit-capstone-fakeplays.onrender.com";
  const authToken = localStorage.getItem("token");

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBotImage(file);
      setBotImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = () => {
    if (!botName || !situation || !botImage || !initialMessage) {
      alert("Please fill in all fields and upload an image.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const imageDataUrl = reader.result;

      const botPath =
        botName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "") + "-" + Date.now();

      const newBot = {
        path: botPath,
        name: botName,
        subtitle: "Custom Bot",
        img: imageDataUrl,
        desc: situation.length > 150 ? situation.substring(0, 150) + "..." : situation,
        initialMessage: initialMessage.replace(/\n/g, "<br>"),
        prompt: situation,
        isCustom: true
      };

      if (authToken) {
        try {
          const res = await fetch(`${API_BASE}/api/custom-bots/upsert`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`
            },
            body: JSON.stringify(newBot)
          });

          if (!res.ok) {
            const msg = await res.json().catch(() => ({}));
            alert(msg?.error || "Failed to save bot to server.");
            return;
          }

          navigate("/main");
          return;
        } catch (err) {
          console.error("Server error:", err);
        }
      }

      // Fallback: Save locally if not logged in
      const existingBots = JSON.parse(localStorage.getItem("customBots") || "[]");
      existingBots.push(newBot);
      localStorage.setItem("customBots", JSON.stringify(existingBots));
      navigate("/main");
    };

    reader.readAsDataURL(botImage);
  };

  return (
    <>
      <div className="background">
        <div className="circle circle1"></div>
        <div className="circle circle2"></div>
      </div>
      <Navbar isNavbarVisible={true} setIsHovering={() => {}} />
      <div className="container chat-container">
        <div className="login-box chat-box-wrapper create-bot-box">
          <div className="chat-header">
            {botImagePreview ? (
              <img src={botImagePreview} alt="Bot Preview" className="bot-avatar" />
            ) : (
              <div className="bot-avatar placeholder" />
            )}
            <div className="bot-info">
              <h3>Create a New Bot</h3>
              <p>Design your own AI character</p>
            </div>
          </div>

          <div className="bot-form">
            <div className="form-group">
              <label>Bot Name</label>
              <input
                type="text"
                className="input-field"
                value={botName}
                onChange={(e) => setBotName(e.target.value)}
                placeholder="e.g., Alex, the Midnight DJ"
              />
            </div>

            <div className="form-group">
              <label>Situation (AI Prompt)</label>
              <textarea
                className="input-field"
                rows="4"
                value={situation}
                onChange={(e) => setSituation(e.target.value)}
                placeholder="Describe the bot's personality, setting, and role."
              />
            </div>

            <div className="form-group">
              <label>First Message</label>
              <textarea
                className="input-field"
                rows="3"
                value={initialMessage}
                onChange={(e) => setInitialMessage(e.target.value)}
                placeholder="What does your bot say to start the conversation?"
              />
            </div>

            <div className="form-group">
              <label>Upload Bot Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="file-input"
              />
            </div>
          </div>

          <div className="input-area">
            <button className="cta-button" onClick={handleSubmit}>
              Create Bot
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default CreateBot;
