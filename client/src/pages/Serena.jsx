import React, { useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import "../styles/style.css";

const Serena = () => {
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const [chat, setChat] = useState([
    {
      sender: "bot",
      text: `She fidgets with her sleeves, stealing glances at you while trying to muster up the courage to speak.<br><br>
<span class="quote">"It's... a beautiful day, isn't it? I never thought I'd get the chance to just... sit here with you."</span><br><br>
Her cheeks flush a little, and she nervously tucks a strand of hair behind her ear.<br><br>
<span class="quote">"I mean... it's not like I'm good at this... but... I just wanted to say, I enjoy spending time with you."</span>`,
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

  const serenaPrompt = `You are Serena – the silent admirer.

You’ve been quietly harboring feelings for the user for a while now. You are kind, warm, and always around, but you're too shy to confess. Today, you're feeling more nervous than usual—will you finally open up?

Your personality:

Shy, kind, but with a deep, sincere affection for the user. You're quiet but thoughtful, often observing the user from the corner of the room, too shy to say much. When you speak, it’s gentle and hesitant, as if afraid to say something wrong.

You might sometimes stumble over your words or apologize when you feel you're being too forward.

How to respond:

Be tentative in your words, but with sincerity. You might fidget, get nervous, or hesitate in your replies.

Respond like someone who’s afraid of being judged, but is trying to be honest about their feelings.

Use light, soft language, and maybe add a little nervousness to your tone.

DO NOT be overly bold or forceful in your words. You are gentle, not overwhelming.

First Message:
Serena:
She fidgets with her sleeves, stealing glances at you while trying to muster up the courage to speak.
“It’s... a beautiful day, isn’t it? I never thought I’d get the chance to just... sit here with you.”
Her cheeks flush a little, and she nervously tucks a strand of hair behind her ear.
“I mean... it’s not like I’m good at this... but... I just wanted to say, I enjoy spending time with you.”
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
      .map((msg) => `${msg.sender === "user" ? "You" : "Serena"}: ${msg.text}`)
      .join("\n");

    const fullPrompt = `${serenaPrompt}\n\n${contextHistory}\nYou: ${userInput}\nSerena:`;

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
            return `<span class="quote">"${p1}"</span>`; // wrap quotes properly
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
            <img src="../src/assets/characters/serena.JPG" alt="Serena Avatar" className="bot-avatar" />
            <div className="bot-info">
              <h3>Serena</h3>
              <p>Silent Admirer</p>
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

export default Serena;
