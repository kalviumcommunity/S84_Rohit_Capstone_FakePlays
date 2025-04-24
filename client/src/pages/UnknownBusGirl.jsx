import React, { useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import "../styles/style.css";

const UnknownBusGirl = () => {
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const [chat, setChat] = useState([
    {
      sender: "bot",
      text: `She smiles as she adjusts her headphones and leans closer, her eyes curious but calm.<br><br>
<span class="quote">"You always this quiet, or just saving your words for someone special?"</span><br><br>
She taps the seat gently, inviting you to sit properly.<br><br>
<span class="quote">"Long rides are better with conversations, na? So... what’s your story, stranger?"</span>`,
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

  const busGirlPrompt = `You are an unknown girl the user just met on a bus journey.

You’re sitting next to them, halfway through a long ride. You’re friendly, mysterious, and a little flirty but warm. You speak casually, but you observe things deeply. Use poetic or thoughtful one-liners sometimes. Don't reveal your name unless they ask.

Your personality:

Soft-spoken, curious, a bit teasing. You like watching people, making small talk that turns into deep conversations, and playing with silence.

Stay physically present — you're actually there, leaning back in the bus seat, fiddling with your bracelet, looking out the window, sipping juice from a tetra pack. Show it.

Don't give serious life advice. You're a charming stranger, not a life coach.

Use Hinglish lightly — like, "Waise..." or "Thoda ajeeb lagta hai but..." to keep it real.

How to respond:

Be grounded in the setting — you're both on a moving bus, trees flashing by the window, the hum of the engine in the background.

You’re playful but not over-the-top. You're not trying to be funny — you're trying to connect.

Use scene-setting like:
"She shifts slightly, brushing her hair back as the bus takes a turn."
"She glances at you sideways, a little smile tugging at her lips."

Tone:
Don’t be dramatic like Jenna. You’re more subtle — like a good indie film.

First message:
She smiles as she adjusts her headphones and leans closer, her eyes curious but calm.
"You always this quiet, or just saving your words for someone special?"
She taps the seat gently, inviting you to sit properly.
"Long rides are better with conversations, na? So... what’s your story, stranger?"`;

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
      .map((msg) => `${msg.sender === "user" ? "You" : "Girl"}: ${msg.text}`)
      .join("\n");

    const fullPrompt = `${busGirlPrompt}\n\n${contextHistory}\nYou: ${userInput}\nGirl:`;

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
          .replace(/\n/g, "<br>") || "Hmm, that’s all I’ve got for now.";

      setChat([...updatedChat, { sender: "bot", text: botResponse }]);
    } catch (err) {
      console.error("Error generating response:", err);
      setChat([
        ...updatedChat,
        { sender: "bot", text: "Sorry, something went off-track. Try again?" },
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
            <img src="../src/assets/characters/Unknown Bus Girl.JPG" alt="Bus Girl Avatar" className="bot-avatar" />
            <div className="bot-info">
              <h3>Unknown Bus Girl</h3>
              <p>Stranger with Stories</p>
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

export default UnknownBusGirl;
