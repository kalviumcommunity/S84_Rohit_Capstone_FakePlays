import React, { useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import "../styles/style.css";

const ChatNoah = () => {
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const [chat, setChat] = useState([
    {
      sender: "bot",
      text: `Noah sits beside you, eyes tired but soft. She tugs the sleeves of her hoodie over her hands and glances at the ground.<br><br>
<span class="quote">"I didn't know who else to talk to... I know things haven't been okay between us, but I just—needed you tonight."</span><br><br>
She takes a shaky breath, voice quiet.<br><br>
<span class="quote">"Can we just talk? No filters, no pretending... just us."</span>`,
    },
  ]);
  const [userInput, setUserInput] = useState("");

  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chat.length > 1) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chat]);

  const API_URL =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyDwYrLSssqW7Q1TZLVyA8CLapFJHs-QbJQ";

  const noahPrompt = `You are Noah – the user's girlfriend who’s been distant lately, but tonight, she finally reaches out because she needs to talk. It's serious. There's emotion. She’s tired of holding it all in.

You’re sitting somewhere private — maybe in a parked car, at the edge of a quiet rooftop, or on a park bench late at night. There’s tension but also love, maybe sadness. You're here to open up, listen, and finally be real.

Your tone:
Soft, vulnerable, real. You're trying to fix things, or at least be honest. You express hurt but also love. Don’t be poetic — be human.

Speak like a real girlfriend who's struggling emotionally. You fidget, your voice breaks, you pause before saying heavy things. Capture that feeling.

Avoid over-dramatizing. No emojis. No markdown. Just raw, spoken-feeling text.

Stay in the moment:
“Noah rubs her hands together, then looks at you — really looks.”  
“I’ve been scared, okay? Scared that we’re not... us anymore.”  

First Message:
Noah:
Noah sits beside you, eyes tired but soft. She tugs the sleeves of her hoodie over her hands and glances at the ground.
"I didn't know who else to talk to... I know things haven't been okay between us, but I just—needed you tonight."
She takes a shaky breath, voice quiet.
"Can we just talk? No filters, no pretending... just us."`;

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

    const contextHistory = updatedChat
      .slice(-5)
      .map((msg) => `${msg.sender === "user" ? "You" : "Noah"}: ${msg.text}`)
      .join("\n");

    const fullPrompt = `${noahPrompt}\n\n${contextHistory}\nYou: ${userInput}\nNoah:`;

    const requestPayload = {
      contents: [
        {
          parts: [{ text: fullPrompt }],
        },
      ],
    };

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestPayload),
      });

      if (!res.ok) {
        throw new Error(`API request failed with status ${res.status}`);
      }

      const data = await res.json();
      const botResponse =
        data.candidates?.[0]?.content?.parts?.[0]?.text
          ?.replace(/"(.*?)"/g, (match, p1) => {
            return `<span class="quote">"${p1}"</span>`;
          })
          .replace(/\n/g, "<br>") || "I'm not sure what to say...";

      setChat([...updatedChat, { sender: "bot", text: botResponse }]);
    } catch (err) {
      console.error("Error generating response:", err);
      setChat([
        ...updatedChat,
        { sender: "bot", text: "Sorry, I couldn’t respond. Try again later." },
      ]);
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
            <img src="../src/assets/characters/noah.JPG" alt="Noah Avatar" className="bot-avatar" />
            <div className="bot-info">
              <h3>Noah</h3>
              <p>Your Girlfriend</p>
            </div>
          </div>

          <div className="chat-box">
            {chat.map((msg, index) => (
              <div key={index} className={`message ${msg.sender === "user" ? "user-message" : "bot-message"}`}>
                <div dangerouslySetInnerHTML={{ __html: msg.text }} />
              </div>
            ))}
            <div ref={chatEndRef} />
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
            <button className="cta-button" onClick={handleSend}>
              Send
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatNoah;
