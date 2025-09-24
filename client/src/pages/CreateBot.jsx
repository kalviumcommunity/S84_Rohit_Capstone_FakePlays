import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../styles/style.css";

function CreateBot() {
  const [botName, setBotName] = useState("");
  const [situation, setSituation] = useState("");
  const [initialMessage, setInitialMessage] = useState(""); // <-- New state for the first message
  const [botImage, setBotImage] = useState(null);
  const [botImagePreview, setBotImagePreview] = useState(null);
  const navigate = useNavigate();

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBotImage(file);
      setBotImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = () => {
    // Updated validation to include the new field
    if (!botName || !situation || !botImage || !initialMessage) {
      alert("Please fill in all fields and upload an image.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const imageDataUrl = reader.result;
      const botPath = `${botName.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Date.now()}`;

      const newBot = {
        path: botPath,
        name: botName,
        subtitle: "Custom Bot",
        img: imageDataUrl,
        // The card description is a short snippet of the situation
        desc: situation.substring(0, 150) + (situation.length > 150 ? "..." : ""),
        // The new initial message is saved directly
        initialMessage: initialMessage.replace(/\n/g, "<br>"), // Allow line breaks
        // The situation is saved as the main AI prompt
        prompt: situation,
        isCustom: true,
      };

      const existingBots = JSON.parse(localStorage.getItem("customBots")) || [];
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
      <Navbar isNavbarVisible={true} />
      <div className="container chat-container">
        <div className="login-box chat-box-wrapper create-bot-box">
          <div className="chat-header">
            {botImagePreview ? ( <img src={botImagePreview} alt="Bot Preview" className="bot-avatar" /> ) : ( <div className="bot-avatar placeholder">🤖</div> )}
            <div className="bot-info">
              <h3>Create a New Bot</h3>
              <p>Design your own AI character</p>
            </div>
          </div>
          <div className="bot-form">
            <div className="form-group">
              <label>Bot Name</label>
              <input type="text" className="input-field" value={botName} onChange={(e) => setBotName(e.target.value)} placeholder="e.g., Alex, the Midnight DJ" />
            </div>
            {/* Field for the AI's core instructions */}
            <div className="form-group">
              <label>Situation (AI Prompt)</label>
              <textarea className="input-field" rows="4" value={situation} onChange={(e) => setSituation(e.target.value)} placeholder="Describe the bot's personality, setting, and role. This is the main instruction for the AI."></textarea>
            </div>
            {/* New field for the bot's opening line */}
            <div className="form-group">
              <label>First Message</label>
              <textarea className="input-field" rows="3" value={initialMessage} onChange={(e) => setInitialMessage(e.target.value)} placeholder="What does your bot say to start the conversation?"></textarea>
            </div>
            <div className="form-group">
              <label>Upload Bot Image</label>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="file-input" />
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
};

export default CreateBot;
