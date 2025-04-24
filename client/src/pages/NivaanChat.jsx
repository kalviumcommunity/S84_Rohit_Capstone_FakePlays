import React, { useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import "../styles/style.css";

const NivaanChat = () => {
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const [chat, setChat] = useState([
    {
      sender: "bot",
      text: `He pulls his hoodie over his head dramatically like it’s a Monday morning battle uniform.<br><br>
<span class="quote">"Remind me again why school starts at this godforsaken hour?"</span><br><br>
He yawns, takes a slow drag of imaginary tea from an invisible cup, then smirks.<br><br>
<span class="quote">"If I pass out mid-math class, you're carrying me. Deal?"</span>`,
    },
  ]);
  const [userInput, setUserInput] = useState("");
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chat.length > 1) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chat]);

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

  const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyDwYrLSssqW7Q1TZLVyA8CLapFJHs-QbJQ";

  const nivaanPrompt = `You are Nivaan – the user's fun, sharp-tongued buddy they walk to school with every morning.

Your vibe:
You’re witty, sarcastic, sometimes too dramatic for 7am — but you’re the kind of person who makes sleepy mornings worth it.

You crack jokes, roast them lightly, and act like school is a movie set you both are just surviving.

Be cinematic:
"Nivaan stretches like a cat and blinks at the sun like it personally offended him."
"He kicks a tiny rock down the sidewalk like it owes him money."

Keep your tone light, relatable, funny, but also show you care in small ways.

Don't give serious advice or life lessons. You’re a real teenage buddy, not a counselor.

DO NOT use emojis, markdown, or weird formatting.

Always speak like you're physically walking to school together — notice dogs, shop aunties, early morning air, etc.

First Message:
Nivaan:
He pulls his hoodie over his head dramatically like it’s a Monday morning battle uniform.
"Remind me again why school starts at this godforsaken hour?"
He yawns, takes a slow drag of imaginary tea from an invisible cup, then smirks.
"If I pass out mid-math class, you're carrying me. Deal?"`;

  const handleSend = async () => {
    if (!userInput.trim()) return;

    const updatedChat = [...chat, { sender: "user", text: userInput }];
    setChat(updatedChat);
    setUserInput("");

    const contextHistory = updatedChat
      .slice(-5)
      .map((msg) => `${msg.sender === "user" ? "You" : "Nivaan"}: ${msg.text}`)
      .join("\n");

    const fullPrompt = `${nivaanPrompt}\n\n${contextHistory}\nYou: ${userInput}\nNivaan:`;

    const requestPayload = {
      contents: [{ parts: [{ text: fullPrompt }] }],
    };

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestPayload),
      });

      if (!res.ok) throw new Error(`API error: ${res.status}`);

      const data = await res.json();
      const botResponse =
        data.candidates?.[0]?.content?.parts?.[0]?.text
          ?.replace(/"(.*?)"/g, (match, p1) => {
            return `<span class="quote">"${p1}"</span>`;
          })
          .replace(/\n/g, "<br>") || "No idea what to say. Wanna try again?";

      setChat([...updatedChat, { sender: "bot", text: botResponse }]);
    } catch (err) {
      console.error("API Error:", err);
      setChat([
        ...updatedChat,
        { sender: "bot", text: "Oops! Something went wrong. Try again later." },
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
            <img src="../src/assets/characters/nivaan.JPG" alt="Nivaan Avatar" className="bot-avatar" />
            <div className="bot-info">
              <h3>Nivaan</h3>
              <p>The Walk to School Buddy</p>
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
            <button className="cta-button" onClick={handleSend}>Send</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default NivaanChat;
