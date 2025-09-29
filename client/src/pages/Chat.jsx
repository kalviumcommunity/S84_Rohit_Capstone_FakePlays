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

  const API_BASE = import.meta.env.VITE_API_BASE?.replace(/\/$/, "") || "https://s84-rohit-capstone-fakeplays.onrender.com";
  const authToken = localStorage.getItem("token");

  // Load bot (predefined -> backend -> local fallback)
  useEffect(() => {
    const resolveBot = async () => {
      const pre = predefinedBots.find((b) => b.path === botPath);
      if (pre) {
        setBot(pre);
        return pre;
      }

      if (authToken) {
        try {
          const res = await fetch(`${API_BASE}/api/custom-bots/${encodeURIComponent(botPath)}`, {
            headers: { Authorization: `Bearer ${authToken}` },
          });
          if (res.ok) {
            const data = await res.json();
            if (data?.bot) {
              const b = {
                path: data.bot.path,
                name: data.bot.name,
                subtitle: data.bot.subtitle || "Custom Bot",
                img: data.bot.img,
                desc: data.bot.desc || "",
                initialMessage: data.bot.initialMessage,
                prompt: data.bot.prompt || "",
                isCustom: true,
              };
              setBot(b);
              return b;
            }
          }
        } catch {
          // fallback to local
        }
      }

      const localBots = JSON.parse(localStorage.getItem("customBots") || "[]");
      const local = localBots.find((b) => b.path === botPath);
      if (local) {
        setBot(local);
        return local;
      }

      return null;
    };

    const init = async () => {
      const currentBot = await resolveBot();
      if (!currentBot) {
        navigate("/main");
        return;
      }

      if (authToken) {
        try {
          const res = await fetch(`${API_BASE}/api/saved-chats/${encodeURIComponent(currentBot.path)}`, {
            headers: { Authorization: `Bearer ${authToken}` },
          });
          if (res.ok) {
            const data = await res.json();
            const saved = data?.chat?.messages;
            if (Array.isArray(saved) && saved.length) {
              setChat(saved.map((m) => ({ sender: m.sender, text: m.text })));
              return;
            }
          }
        } catch {
          // fallback to initial message
        }
      }

      setChat([{ sender: "bot", text: currentBot.initialMessage || `You are now chatting with ${currentBot.name}.` }]);
    };

    init();
  }, [botPath, navigate, authToken, API_BASE]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chat]);

  const saveChat = async (currentChat) => {
    if (!authToken || !bot) return;
    try {
      await fetch(`${API_BASE}/api/saved-chats/upsert`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          botPath: bot.path,
          botName: bot.name,
          messages: currentChat.map((m) => ({ sender: m.sender, text: m.text })),
        }),
      });
    } catch {
      // best-effort save
    }
  };

  const handleSend = async () => {
    if (!userInput.trim() || isLoading) return;

    const updatedChat = editIndex !== null
      ? (() => {
          const copy = [...chat];
          copy[editIndex].text = userInput;
          if (copy[editIndex + 1]?.sender === "bot") copy.splice(editIndex + 1, 1);
          return copy;
        })()
      : [...chat, { sender: "user", text: userInput }];

    setChat(updatedChat);
    setUserInput("");
    setEditIndex(null);
    saveChat(updatedChat);

    if (!bot) return;

    setIsLoading(true);

    try {
      const contextHistory = updatedChat.slice(-6)
        .map(m => `${m.sender === "user" ? "You" : bot.name}: ${m.text.replace(/<[^>]+>/g, "")}`)
        .join("\n");

      const prompt = `${bot.prompt || ""}\n\n${contextHistory}\n${bot.name}:`;

      // Replace with your real bot API call
      const res = await fetch(`/api/fake-bot-response`, { // placeholder for Gemini API call
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      const botResponse = data?.text || "I couldn't respond.";

      const newChat = [...updatedChat, { sender: "bot", text: botResponse }];
      setChat(newChat);
      saveChat(newChat);
    } catch {
      const newChat = [...updatedChat, { sender: "bot", text: "Error responding." }];
      setChat(newChat);
      saveChat(newChat);
    } finally {
      setIsLoading(false);
    }
  };

  if (!bot) return <div>Loading...</div>;

  return (
    <>
      <div className="background">
        <div className="circle circle1"></div>
        <div className="circle circle2"></div>
      </div>
      <Navbar isNavbarVisible={isNavbarVisible} setIsHovering={setIsHovering} />
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
            {chat.map((msg, idx) => (
              <div key={idx} className={`message ${msg.sender === "user" ? "user-message" : "bot-message"}`}>
                <div dangerouslySetInnerHTML={{ __html: msg.text }} />
              </div>
            ))}
            {isLoading && <div className="message bot-message">Typing...</div>}
            <div ref={chatEndRef} />
          </div>
          <div className="input-area">
            <input
              type="text"
              placeholder={isLoading ? "Bot is typing..." : "Type your message..."}
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              disabled={isLoading}
            />
            <button onClick={handleSend} disabled={isLoading}>{editIndex !== null ? "Update" : "Send"}</button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Chat;
