import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Add useNavigate
import Navbar from "../components/Navbar";
import "../styles/style.css";

const CreateBot = () => {
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const [botName, setBotName] = useState("");
  const [situation, setSituation] = useState("");
  const [botImage, setBotImage] = useState(null);
  const [botImagePreview, setBotImagePreview] = useState(null);
  const navigate = useNavigate(); // Initialize navigate

  useEffect(() => {
    const timeout = setTimeout(() => setIsNavbarVisible(false), 5000);

    const handleMouseMove = (e) => {
      if (isHovering) return;
      setIsNavbarVisible(e.clientY < 30);
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => {
      clearTimeout(timeout);
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isHovering]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBotImage(file);
      setBotImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = () => {
    if (!botName || !situation || !botImage) {
      alert("Please fill in all fields and upload an image.");
      return;
    }

    // Convert image file to Data URL
    const reader = new FileReader();
    reader.onload = () => {
      const imageDataUrl = reader.result;

      // Generate a unique path for the bot (this will be used in the URL)
      const botPath = botName
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "") + "-chat"; // Ensure it's URL-safe

      // Create bot object
      const newBot = {
        name: botName,
        img: imageDataUrl, // Store Data URL
        desc: situation,
        path: botPath,
      };

      // Load existing bots from localStorage
      const existingBots = JSON.parse(localStorage.getItem("customBots")) || [];
      // Add new bot
      existingBots.push(newBot);
      // Save back to localStorage
      localStorage.setItem("customBots", JSON.stringify(existingBots));

      // Redirect to the newly created bot's chat page using botPath
      navigate(`/chat/${botPath}`); // Navigate to the bot's page directly
    };
    reader.readAsDataURL(botImage);
  };

  return (
    <>
      <div className="background">
        <div className="circle circle1"></div>
        <div className="circle circle2"></div>
        <div className="circle circle3"></div>
      </div>

      <Navbar isNavbarVisible={isNavbarVisible} setIsHovering={setIsHovering} />

      <div className="container chat-container">
        <div className="login-box chat-box-wrapper create-bot-box">
          <div className="chat-header">
            {botImagePreview ? (
              <img src={botImagePreview} alt="Bot Preview" className="bot-avatar" />
            ) : (
              <div className="bot-avatar placeholder">🤖</div>
            )}
            <div className="bot-info">
              <h3>Create a New Bot</h3>
              <p>Customize a virtual character with a personality</p>
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
                placeholder="e.g. Luna, Alex, Maria..."
              />
            </div>

            <div className="form-group">
              <label>Situation / Personality Description</label>
              <textarea
                className="input-field"
                rows="4"
                value={situation}
                onChange={(e) => setSituation(e.target.value)}
                placeholder="Describe their emotional state, background, or role"
              ></textarea>
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
};

export default CreateBot;
