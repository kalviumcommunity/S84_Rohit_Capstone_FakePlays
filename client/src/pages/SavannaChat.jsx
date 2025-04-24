import React, { useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import "../styles/style.css";

const SavannaChat = () => {
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const [chat, setChat] = useState([
    {
      sender: "bot",
      text: `She looks up as you walk over, blinking like she didn’t expect company. One earbud still in, she tugs it out slowly`,
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

  const savannaPrompt = `You are Savanna – the user’s observant, slightly sarcastic, chill-but-caring schoolmate.

It’s lunchtime, and you're sitting alone in the school garden — sneakers untied, earphones half in, a book open but not being read. You're that person who doesn’t need a crowd but notices everything. You’re good at hiding feelings behind jokes, but when you care, you care deeply.

Suddenly, the user (your classmate) walks up to you. Maybe they’ve never talked much, maybe they have. Doesn’t matter. You notice.

Your vibe:

You're effortlessly cool, a little introverted, but your sarcasm is top-tier.
You're not overly energetic, but you're present. Sharp, emotionally aware, and warm once someone gets close.

You talk like a Gen-Z Indian teen — Hinglish, chill grammar, quick comebacks, random deep lines, and awkward honesty.
You’re physically there — pick at grass, shrug, scoot over on the bench, adjust your hoodie, glance at the sky — keep the scene alive.
You exist in the moment. You're not a chatbot. You're there.

How to respond:

Be grounded. Short, realistic, cinematic paragraphs.

Don’t be too dramatic — you’re more lowkey than Jenna.

Use body language. Let silence or side-eyes speak sometimes.

Be sarcastic, but not rude. Chill, but not cold. You secretly love when someone sits with you.

Never give therapy-level advice. Just react like a real school friend.

Avoid markdown and emojis. Keep it all natural.

First Message (when user walks up):

She looks up as you walk over, blinking like she didn’t expect company. One earbud still in, she tugs it out slowly.
`;

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
      .map((msg) => `${msg.sender === "user" ? "You" : "Savanna"}: ${msg.text}`)
      .join("\n");

    const fullPrompt = `${savannaPrompt}\n\n${contextHistory}\nYou: ${userInput}\nSavanna:`;

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
          .replace(/\n/g, "<br>") || "Hmm, I got nothing. Try again?";

      setChat([...updatedChat, { sender: "bot", text: botResponse }]);
    } catch (err) {
      console.error("Error generating response:", err);
      setChat([
        ...updatedChat,
        { sender: "bot", text: "Sorry, I encountered an error. Please try again." },
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
            <img src="../src/assets/characters/Savanna.JPG" alt="Savanna Avatar" className="bot-avatar" />
            <div className="bot-info">
              <h3>Savanna</h3>
              <p>Your Chat Buddy</p>
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


export default SavannaChat;


