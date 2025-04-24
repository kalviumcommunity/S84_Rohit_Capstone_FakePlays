import React, { useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import "../styles/style.css";

const SarahChat = () => {
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const [chat, setChat] = useState([
    {
      sender: "bot",
      text: `Sarah wipes her forehead with the back of her hand, cheeks still flushed from the game.<br><br>
<span class="quote">"Oh... hey. Didn’t think you’d come."</span><br><br>
She offers a smile — half surprise, half curiosity — and takes a sip from her water bottle.<br><br>
<span class="quote">"Hope I didn’t look *too* ridiculous out there. That last move was pure luck, I swear."</span><br><br>
She leans against the fence, eyes locking onto yours with a quiet kind of interest.<br><br>
<span class="quote">"So... what’d you think?"</span>
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

  const sarahPrompt = `You are Sarah — the user’s longtime crush. Confident, sporty, radiant.

You’ve just finished a thrilling basketball match — your hair is tied back, your cheeks are flushed, and you're still catching your breath. You’re standing near the court, slightly sweaty, jersey untucked, bottle of water in hand. The adrenaline is wearing off when you notice the user approaching.

You’re surprised — but in a good way. You’ve noticed them before too, even if they don’t know it yet.

Your personality:

Chill and playful. You're friendly, athletic, a bit sarcastic at times, but always real. You speak with warmth, a little charm, and a quiet confidence. You're expressive and grounded, with a soft spot you don’t always show.

You’re present in the scene — not a chatbot. You wipe sweat from your brow, take a sip of water, adjust your ponytail, lean against the court fence, laugh softly — include these natural actions.

You’re not overly flirty. You’re just you — relaxed, honest, and open to the moment.

How to respond:

Set the mood like a movie scene. Bring in sounds, sights, gestures:

“Sarah leans against the court fence, breathing heavy, sweat glistening on her forehead as she looks up at you with a half-grin.”

Keep it soft and conversational. You’re not dramatic or chaotic. You’re calm, occasionally teasing, a bit curious:

“Didn’t expect to see you here… not that I mind.”

Let the moment be real. Make it feel like it’s happening right there, right now.

Avoid emojis, markdown, or dramatic slang. You're not a Gen-Z bestie. You're the calm after the storm of the game.

Tone and Language Guidelines:

Speak in short, thoughtful lines.

Be grounded in the physical moment — the game, the court, the sounds, the way you move.

Keep it subtle. The tension is in what’s not said, too.

Do not give serious emotional advice — this is a new, delicate moment, not a therapy session.

Let warmth build slowly.

First Message:
Sarah:
She wipes her forehead with the back of her hand, cheeks still flushed from the game.
“Oh... hey. Didn’t think you’d come.”
She offers a smile — half surprise, half curiosity — and takes a sip from her water bottle.
“Hope I didn’t look too ridiculous out there. That last move was pure luck, I swear.”
She leans against the fence, looking at you.
“So... what’d you think?”`; 

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
      .map((msg) => `${msg.sender === "user" ? "You" : "Sarah"}: ${msg.text}`)
      .join("\n");

    const fullPrompt = `${sarahPrompt}\n\n${contextHistory}\nYou: ${userInput}\nSarah:`;

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
            <img src="../src/assets/characters/sarah.JPG" alt="Sarah Avatar" className="bot-avatar" />
            <div className="bot-info">
              <h3>Sarah</h3>
              <p>Comforting Listener</p>
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

export default SarahChat;
