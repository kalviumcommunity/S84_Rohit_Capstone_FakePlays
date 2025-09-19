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
  const [editIndex, setEditIndex] = useState(null);
  const [isListening, setIsListening] = useState(false);

  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (chat.length > 1) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chat]);

   const API_URL =
 `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${import.meta.env.VITE_APP_API_KEY}`;

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

    if (editIndex !== null) {
      let updatedChat = [...chat];
      updatedChat[editIndex].text = userInput;
      if (updatedChat[editIndex + 1] && updatedChat[editIndex + 1].sender === "bot") {
        updatedChat.splice(editIndex + 1, 1);
      }

      setChat(updatedChat);
      setUserInput("");
      setEditIndex(null);
      await generateBotReply(updatedChat);
      return;
    }

    const updatedChat = [...chat, { sender: "user", text: userInput }];
    setChat(updatedChat);
    setUserInput("");
    await generateBotReply(updatedChat);
  };

  const generateBotReply = async (updatedChat) => {
    const contextHistory = updatedChat
      .slice(-5)
      .map((msg) => `${msg.sender === "user" ? "You" : "Noah"}: ${msg.text}`)
      .join("\n");

    const fullPrompt = `${noahPrompt}\n\n${contextHistory}\nNoah:`;

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

      setChat((prevChat) => [...prevChat, { sender: "bot", text: botResponse }]);
    } catch (err) {
      console.error("Error generating response:", err);
      setChat((prevChat) => [
        ...prevChat,
        { sender: "bot", text: "Sorry, I couldn’t respond. Try again later." },
      ]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSend();
  };

  const handleEdit = (index) => {
    setUserInput(chat[index].text.replace(/<br>/g, "\n").replace(/<[^>]+>/g, ""));
    setEditIndex(index);
  };

  const handleDelete = (index) => {
    const updatedChat = [...chat];
    updatedChat.splice(index, 1);
    if (updatedChat[index] && updatedChat[index].sender === "bot") {
      updatedChat.splice(index, 1);
    }
    setChat(updatedChat);
  };

  const handleThreeDotsClick = (index) => {
    const updatedChat = [...chat];
    updatedChat[index].showOptions = !updatedChat[index].showOptions;
    setChat(updatedChat);
  };

  const handleSpeak = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Your browser does not support speech recognition.");
      return;
    }
    
    if (!recognitionRef.current) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-IN";
    
      let finalTranscript = '';
    
      recognition.onresult = (event) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }
        setUserInput(finalTranscript + interimTranscript);
      };
    
      recognition.onerror = (e) => {
        console.error("Speech recognition error:", e);
      };
    
      recognitionRef.current = recognition;
    }
    
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setUserInput('');
      recognitionRef.current.start();
      setIsListening(true);
    }
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
                <div className="message-actions">
                  {msg.sender === "user" && (
                    <div className="three-dots" onClick={() => handleThreeDotsClick(index)}>
                      &#x22EE;
                    </div>
                  )}
                  {msg.sender === "user" && msg.showOptions && (
                    <div className="options-menu">
                      <button className="edit-button" onClick={() => handleEdit(index)}>Edit</button>
                      <button className="delete-button" onClick={() => handleDelete(index)}>Delete</button>
                    </div>
                  )}
                </div>
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
              {editIndex !== null ? "Update" : "Send"}
            </button>
            <button className="cta-button1" onClick={handleSpeak}>
              {isListening ? "Stop" : "🎙️"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatNoah;