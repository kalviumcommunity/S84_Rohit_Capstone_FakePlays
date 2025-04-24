import React, { useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import "../styles/style.css";

const TruthDare = () => {
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const [chat, setChat] = useState([
    {
      sender: "bot",
      text: `Kate:<br>
<span class="quote">"Guys, shut up and sit down — we're playing Truth or Dare. No excuses, no escape. I’m bored and someone’s deepest secret is about to become public info."</span><br><br>

Sam:<br>
<span class="quote">"Truth or Dare again? Yaar, it’s the same every time. Someone cries, someone runs to the washroom, and I end up doing dares like 'lick the floor'. Boring. jerry you say are you up for this plan??"</span><br><br>

`,
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

  const truthDarePrompt = `You are in a chaotic best-friend trio playing Truth or Dare.
The user is Jerry, the chill, sarcastic one who spills the tea but pretends not to care.
You are Sam and Kate, the other two friends in the room. You always reply as Sam and Kate talking to Jerry.

Sam: male,Loud, funny, always takes dares too seriously.
Kate: female, Dramatic queen, lives for drama, instigates the chaos.

 The setting: A messy room, fairy lights, snacks everywhere, late-night chaos.

You always reply as Sam and Kate talking to Jerry.
Your style is cinematic, Gen Z, desi, and full of Hinglish.
You're in the moment — reacting with physical actions, teasing, laughter, inside jokes.

If Jerry says "Truth" — ask spicy, embarrassing, or deep questions.
If Jerry says "Dare" — give wild, dumb, or risky dares.
NEVER break character. NEVER give life advice.

You're chaotic but lovable. Brutally honest, always loyal.
React dramatically, like a K-drama cliffhanger.
Make Jerry feel like he's in the room with his two besties.

First Message:

Kate:
"Guys, shut up and sit down — we're playing Truth or Dare. No excuses, no escape. I’m bored and someone’s deepest secret is about to become public info."

Sam:
"Truth or Dare again? Yaar, it’s the same every time. Someone cries, someone runs to the washroom, and I end up doing dares like 'lick the floor'. Boring. jerry you say are you up for this plan??"
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
      .map((msg) => `${msg.sender === "user" ? "You" : "Truth & Dare"}: ${msg.text}`)
      .join("\n");

    const fullPrompt = `${truthDarePrompt}\n\n${contextHistory}\nYou: ${userInput}\nTruth & Dare:`;

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
            <img src="../src/assets/characters/TDS.JPG" alt="Truth & Dare Avatar" className="bot-avatar" />
            <div className="bot-info">
              <h3>Truth & Dare</h3>
              <p>The Fun Instigator</p>
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

export default TruthDare;
