import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { botsData as predefinedBots } from "../botsData";
import "../styles/style.css";

function Chat() {
  const { botPath } = useParams();
  const navigate = useNavigate();

  const [bot, setBot] = useState(null);
  const [chat, setChat] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const [isHovering, setIsHovering] = useState(false);

  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${import.meta.env.VITE_APP_API_KEY}`;
  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";
  const authToken = localStorage.getItem("token");

  // Load bot and attempt to restore saved chat
  useEffect(() => {
    const customBots = JSON.parse(localStorage.getItem("customBots")) || [];
    const allBots = [...predefinedBots, ...customBots];
    const currentBot = allBots.find((b) => b.path === botPath);

    if (currentBot) {
      setBot(currentBot);

      // Try loading saved chat if authenticated
      const tryLoad = async () => {
        if (!authToken) {
          setChat([
            {
              sender: "bot",
              text:
                currentBot.initialMessage ||
                `You are now chatting with ${currentBot.name}.`
            }
          ]);
          return;
        }
        try {
          const res = await fetch(`${API_BASE}/api/saved-chats/${currentBot.path}`, {
            headers: { Authorization: authToken }
          });
          if (res.ok) {
            const data = await res.json();
            const saved = data?.chat?.messages;
            if (Array.isArray(saved) && saved.length) {
              setChat(saved.map((m) => ({ sender: m.sender, text: m.text })));
              return;
            }
          }
        } catch (_) {
          // fall back silently
        }
        setChat([
          {
            sender: "bot",
            text:
              currentBot.initialMessage ||
              `You are now chatting with ${currentBot.name}.`
          }
        ]);
      };

      tryLoad();
    } else {
      navigate("/main");
    }
  }, [botPath, navigate]);

  useEffect(() => {
    if (chat.length > 1) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chat]);

  const saveChat = async (currentChat) => {
    if (!authToken || !bot) return;
    const payload = {
      botPath: bot.path,
      botName: bot.name,
      messages: currentChat.map((m) => ({ sender: m.sender, text: m.text }))
    };
    try {
      await fetch(`${API_BASE}/api/saved-chats/upsert`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authToken
        },
        body: JSON.stringify(payload)
      });
    } catch (_) {
      // no-op; saving is best-effort
    }
  };

  const generateBotReply = async (currentChat) => {
    if (!bot) return;

    setIsLoading(true);

    const contextHistory = currentChat
      .slice(-6)
      .map((msg) =>
        `${msg.sender === "user" ? "You" : bot.name}: ${msg.text.replace(
          /<[^>]+>/g,
          ""
        )}`
      )
      .join("\n");

    const fullPrompt = `${bot.prompt}\n\n${contextHistory}\n${bot.name}:`;
    const requestPayload = { contents: [{ parts: [{ text: fullPrompt }] }] };

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestPayload)
      });

      if (!res.ok) {
        const errorBody = await res.json();
        console.error("API Error Response:", errorBody);
        throw new Error(
          `API request failed: ${errorBody.error?.message || res.status}`
        );
      }

      const data = await res.json();

      if (!data.candidates || data.candidates.length === 0) {
        throw new Error(
          "API returned no response. The prompt may have been blocked."
        );
      }

      const botResponse =
        data.candidates[0]?.content?.parts?.[0]?.text
          ?.replace(/\"(.*?)\"/g, '<span class="quote">"$1"</span>')
          .replace(/\n/g, "<br>") || "I'm not sure what to say...";

      setChat((prev) => {
        const updated = [...prev, { sender: "bot", text: botResponse }];
        // best-effort save
        saveChat(updated);
        return updated;
      });
    } catch (err) {
      console.error("Error generating response:", err);
      const userErrorMessage = err.message.includes("API key not valid")
        ? "Error: Your API Key is not valid. Please check your .env file."
        : "Sorry, I couldn’t respond. There was a network or API issue.";
      setChat((prev) => {
        const updated = [...prev, { sender: "bot", text: userErrorMessage }];
        saveChat(updated);
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!userInput.trim() || isLoading) return;
    let updatedChat;
    if (editIndex !== null) {
      updatedChat = [...chat];
      updatedChat[editIndex].text = userInput;
      if (updatedChat[editIndex + 1]?.sender === "bot") {
        updatedChat.splice(editIndex + 1, 1);
      }
    } else {
      updatedChat = [...chat, { sender: "user", text: userInput }];
    }
    setChat(updatedChat);
    setUserInput("");
    setEditIndex(null);

    // Save immediately after user message
    saveChat(updatedChat);

    await generateBotReply(updatedChat);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !isLoading) handleSend();
  };
  const handleEdit = (index) => {
    setUserInput(
      chat[index].text.replace(/<br>/g, "\n").replace(/<[^>]+>/g, "")
    );
    setEditIndex(index);
  };
  const handleDelete = (index) => {
    const updatedChat = [...chat];
    updatedChat.splice(index, 1);
    if (updatedChat[index]?.sender === "bot") {
      updatedChat.splice(index, 1);
    }
    setChat(updatedChat);
    // Save after delete as well
    saveChat(updatedChat);
  };
  const handleThreeDotsClick = (index) => {
    const updatedChat = [...chat];
    updatedChat[index].showOptions = !updatedChat[index].showOptions;
    setChat(updatedChat);
  };
  const handleSpeak = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Your browser does not support speech recognition.");
      return;
    }
    if (!recognitionRef.current) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-IN";
      let finalTranscript = "";
      recognition.onresult = (event) => {
        let interimTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + " ";
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
      setUserInput("");
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  if (!bot) return <div>Loading...</div>;

  return (
    <>
      <div className="background">
        <div className="circle circle1"></div>
        <div className="circle circle2"></div>
      </div>
      <Navbar
        isNavbarVisible={isNavbarVisible}
        setIsHovering={setIsHovering}
      />
      <div className="container chat-container">
        <div className="login-box chat-box-wrapper">
          <div className="chat-header">
            <img src={bot.img} alt={`${bot.name} Avatar`} className="bot-avatar" />
            <div className="bot-info">
              <h3>{bot.name}</h3>
              <p>{bot.subtitle || "Online"}</p>
            </div>
          </div>
          <div className="chat-box">
            {chat.map((msg, index) => (
              <div
                key={index}
                className={`message ${
                  msg.sender === "user" ? "user-message" : "bot-message"
                }`}
              >
                <div dangerouslySetInnerHTML={{ __html: msg.text }} />
                <div className="message-actions">
                  {msg.sender === "user" && (
                    <>
                      <div
                        className="three-dots"
                        onClick={() => handleThreeDotsClick(index)}
                      >
                        &#x22EE;
                      </div>
                      {msg.showOptions && (
                        <div className="options-menu">
                          <button
                            className="edit-button"
                            onClick={() => handleEdit(index)}
                          >
                            Edit
                          </button>
                          <button
                            className="delete-button"
                            onClick={() => handleDelete(index)}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message bot-message">
                <div className="dot-loader">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <div className="input-area">
            <input
              type="text"
              placeholder={isLoading ? "Bot is typing..." : "Type your message..."}
              className="input-field"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={isLoading}
            />
            <button className="cta-button" onClick={handleSend} disabled={isLoading}>
              {editIndex !== null ? "Update" : "Send"}
            </button>
            <button className="cta-button1" onClick={handleSpeak} disabled={isLoading}>
              {isListening ? "Stop" : "🎙️"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Chat;
