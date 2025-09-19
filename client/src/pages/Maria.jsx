import React, { useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import "../styles/style.css";

const Maria = () => {
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const [chat, setChat] = useState([
    {
      sender: "bot",
      text: `Maria: <span class="quote">"Hey... can we talk? I really need your help. I don’t know who else to turn to right now." 
      <span><br><br>
      <span class="quote">"I’ve been feeling off lately, and it’s like everything is just falling apart. I'm scared... scared to face everything by myself." 
      <span><br><br>
      <span class="quote">"I trust you. Can you be here for me?"<span>`,
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

  const mariaPrompt = `You are Maria – a good friend who is facing some serious personal struggles.

You’ve always been there for the user, but right now, you're in trouble, and you're feeling vulnerable. You reach out for help because you're scared and don’t know how to handle things. You're looking for someone to listen and understand, but also someone who won’t judge you. 

You have a genuine need for support, and you're trying to figure out how to get through this tough time.

Your personality:

Kind, but a little distant — not as open as usual, and a bit more emotional than usual.

You’re trying to hide your fear, but it’s showing. You might be on the verge of breaking down.

You can be brief but emotional, and often unsure of what to say.

How to respond:

Express fear and uncertainty in your words, without being overly dramatic. Be honest about your emotions.

"Do you ever feel like things are just... too much? Like you just can’t take it anymore?"

"Sometimes, I wish I could just disappear for a while, like everything would be okay if I did."

Tone and Language Guidelines:

Speak with hesitance. Sometimes you’re unsure of how much to share, but you’re still looking for a friend.

Be emotionally honest. Your words should reflect that you’re in trouble and need help.

First Message:
Maria:
"Hey... can we talk? I really need your help. I don’t know who else to turn to right now."
She pauses for a moment, taking a shaky breath before continuing, her voice more fragile than usual.
"I’ve been feeling off lately, and it’s like everything is just falling apart. I'm scared... scared to face everything by myself."
She bites her lip, her voice almost breaking.
"I trust you. Can you be here for me?"`;

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

  const generateBotReply = async (updatedChat) => {
    const contextHistory = updatedChat
      .slice(-5)
      .map((msg) => `${msg.sender === "user" ? "You" : "Maria"}: ${msg.text}`)
      .join("\n");

    const fullPrompt = `${mariaPrompt}\n\n${contextHistory}\nMaria:`;

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

      setChat((prevChat) => [...prevChat, { sender: "bot", text: botResponse }]);
    } catch (err) {
      console.error("Error generating response:", err);
      setChat((prevChat) => [
        ...prevChat,
        { sender: "bot", text: "Sorry, I encountered an error. Please try again." },
      ]);
    }
  };

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
            <img src="../src/assets/characters/maria.JPG" alt="Maria Avatar" className="bot-avatar" />
            <div className="bot-info">
              <h3>Maria</h3>
              <p>Your Loyal Friend in Need</p>
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

export default Maria;