import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../styles/style.css"; // optional styling
import Navbar from "../components/Navbar";

const CustomChat = () => {
  const { botNew } = useParams(); // Use botNew from URL params
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [bot, setBot] = useState(null);

  useEffect(() => {
    // Retrieve the list of custom bots from localStorage
    const bots = JSON.parse(localStorage.getItem("customBots")) || [];
    
    // Find the bot using botNew (used as the key in URL)
    const foundBot = bots.find(b => b.newPath === botNew); // Assuming `newPath` is the URL-safe key for each bot
    
    // If bot is not found, set bot to null and handle appropriately
    if (!foundBot) {
      console.error("Bot not found");
      setBot(null);
    } else {
      setBot(foundBot);
    }
  }, [botNew]);  // Run effect when botNew changes

  const handleSend = () => {
    if (!input.trim()) return; // Don't send empty messages

    const newMessages = [...messages, { sender: "user", text: input }];
    setMessages(newMessages);

    // Simulate bot response (you could make this more dynamic with more logic)
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { sender: "bot", text: `${bot?.prompt || "Hello! I'm here to chat."} (Echo): ${input}` },
      ]);
    }, 500);

    setInput(""); // Clear input field after sending message
  };

  // Show a loading message if bot is not yet loaded
  if (bot === null) return <p>Loading bot or bot not found...</p>;

  return (
    <div className="chat-container">
      <Navbar />
      <div className="chat-header">
        <img
          src={bot.image || "/default-bot.png"} // Default bot image if none is provided
          alt={bot.name}
          className="chat-avatar"
        />
        <h2>{bot.name}</h2>
        <p>{bot.description}</p>
      </div>

      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.sender}`}>
            <strong>{msg.sender === "user" ? "You" : bot.name}:</strong> {msg.text}
          </div>
        ))}
      </div>

      <div className="chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Say something..."
          className="input-field"
        />
        <button onClick={handleSend} className="send-button">
          Send
        </button>
      </div>
    </div>
  );
};

export default CustomChat;
