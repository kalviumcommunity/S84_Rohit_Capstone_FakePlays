import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import "../styles/style.css";

const Chat = () => {
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const [chat, setChat] = useState([
    { sender: "bot", text: "Hey! You looked a bit alone so I came over. What's up?" },
    { sender: "user", text: "Just spacing out... thanks for coming over 🖤" }
  ]);
  const [userInput, setUserInput] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsNavbarVisible(false);
    }, 5000);

    const handleMouseMove = (e) => {
      if (isHovering) return;
      if (e.clientY < 30) {
        setIsNavbarVisible(true);
      } else {
        setIsNavbarVisible(false);
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => {
      clearTimeout(timeout);
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isHovering]);

  const handleSend = async () => {
    if (!userInput.trim()) return;

    const updatedChat = [...chat, { sender: "user", text: userInput }];
    setChat(updatedChat);
    setUserInput("");

    try {
      const res = await fetch("http://localhost:5000/api/chat/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userInput }),  // Ensure the key is `prompt` to match the backend
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Server error:", data);
        setChat([...updatedChat, { sender: "bot", text: data.reply || "Oops, server error!" }]);
        return;
      }

      if (!data.reply) {
        console.warn("No reply from AI");
        setChat([...updatedChat, { sender: "bot", text: "Hmm... I couldn't think of a reply!" }]);
        return;
      }

      setChat([...updatedChat, { sender: "bot", text: data.reply }]);
    } catch (err) {
      console.error("Fetch failed:", err);
      setChat([...updatedChat, { sender: "bot", text: "Sorry, I couldn't respond. 😢" }]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSend();
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
        <div className="login-box chat-box-wrapper">
          <div className="chat-header">
            <img src="./src/assets/characters/jenna.JPG" alt="Jenna Avatar" className="bot-avatar" />
            <div className="bot-info">
              <h3>Jenna</h3>
              <p>Friendly College Buddy</p>
            </div>
          </div>

          <div className="chat-box">
            {chat.map((msg, index) => (
              <div key={index} className={`message ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
          </div>

          <div className="input-area">
            <input
              type="text"
              placeholder="Type your message..."
              className="input-field"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <button className="cta-button" onClick={handleSend}>Send</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Chat;
