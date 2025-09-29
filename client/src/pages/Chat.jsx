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

  // TTS: voices, speaking state, and guards (APPEND-ONLY)
  const [voices, setVoices] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const initialBotSkippedRef = useRef(false);

  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${import.meta.env.VITE_APP_API_KEY}`;
 const API_BASE = (import.meta.env.VITE_API_BASE || "https://s84-rohit-capstone-fakeplays.onrender.com").replace(/\/$/, "");
  const authToken = localStorage.getItem("token");

  // Load bot (predefined -> backend -> local fallback) and then attempt to restore saved chat
  useEffect(() => {
  const resolveBot = async () => {
    // 1) Predefined bots first
    const pre = predefinedBots.find((b) => b.path === botPath);
    if (pre) {
      setBot(pre);
      return pre;
    }

    // 2) Backend fetch if logged in
    if (authToken) {
      try {
        // Ensure single slash and proper URL encoding
  const res = await fetch(`${API_BASE}/api/custom-bots/${encodeURIComponent(botPath)}`, {
  headers: { Authorization: authToken }
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
              prompt: data.bot.prompt,
              isCustom: true
            };
            setBot(b);
            return b;
          }
        } else if (res.status === 404) {
          console.warn("Bot not found on backend");
        }
      } catch (err) {
        console.error("Error fetching custom bot:", err);
      }
    }

    // 3) LocalStorage fallback
    const localBots = JSON.parse(localStorage.getItem("customBots") || "[]");
    const local = localBots.find((b) => b.path === botPath);
    if (local) {
      setBot(local);
      return local;
    }

    return null; // Bot not found
  };

  const init = async () => {
    const currentBot = await resolveBot();
    if (!currentBot) {
      navigate("/main");
      return;
    }

    // Load saved chat if authenticated
    if (authToken) {
      try {
    const res = await fetch(`${API_BASE}/api/saved-chats/${encodeURIComponent(currentBot.path)}`, {
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
      } catch {
        // silently ignore
      }
    }

    // Default initial message
    setChat([{
      sender: "bot",
      text: currentBot.initialMessage || `You are now chatting with ${currentBot.name}.`
    }]);
  };

  init();
}, [botPath, navigate]);


  useEffect(() => {
    if (chat.length > 1) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chat]);

  // ====== APPEND-ONLY: TTS helpers and effects ======

  // Pick a female/English voice if possible, else fall back deterministically
  const pickVoice = () => {
    if (!voices || !voices.length) return null;
    const preferredNames = [
      "Google UK English Female",
      "Microsoft Zira - English (United States)",
      "Samantha",
      "Google US English"
    ];
    let v = voices.find(vo => preferredNames.includes(vo.name));
    if (!v) v = voices.find(vo => /female/i.test(vo.name));
    if (!v) v = voices.find(vo => vo.lang && vo.lang.toLowerCase().startsWith('en'));
    return v || voices[0] || null;
  };

  // Strip HTML, then speak using Web Speech API
  const speakText = (html) => {
    if (!("speechSynthesis" in window)) {
      alert("Text-to-speech not supported in this browser.");
      return;
    }
    const synth = window.speechSynthesis;
    synth.cancel(); // stop any previous utterance

    // Convert HTML to plain text (quotes, <br>, etc.)
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    const text = (tmp.textContent || tmp.innerText || "").trim();
    if (!text) return;

    const utter = new SpeechSynthesisUtterance(text);
    const v = pickVoice();
    if (v) utter.voice = v;
    utter.rate = 1.0;
    utter.pitch = 1.0;
    utter.volume = 1.0;

    utter.onstart = () => setIsSpeaking(true);
    utter.onend = () => setIsSpeaking(false);
    utter.onerror = () => setIsSpeaking(false);

    synth.speak(utter);
  };

  // Load available voices and refresh when voices list changes
  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    const synth = window.speechSynthesis;

    const loadVoices = () => setVoices(synth.getVoices());
    loadVoices(); // some browsers populate immediately, others later
    synth.addEventListener("voiceschanged", loadVoices);

    return () => synth.removeEventListener("voiceschanged", loadVoices);
  }, []);

  // Cancel any ongoing speech on unmount (safety)
  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }
    };
  }, []);

  // REMOVED auto-speak effect so speech only happens on button click
  // useEffect(() => {
  //   if (!chat.length) return;
  //   const last = chat[chat.length - 1];
  //   if (last.sender === "bot") {
  //     if (!initialBotSkippedRef.current) {
  //       initialBotSkippedRef.current = true;
  //       return;
  //     }
  //     speakText(last.text);
  //   }
  // }, [chat]);

  // ====== END TTS additions ======

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
  } catch {}
};


  const generateBotReply = async (currentChat) => {
  if (!bot) return;
  setIsLoading(true);

  const contextHistory = currentChat
    .slice(-6)
    .map((msg) =>
      `${msg.sender === "user" ? "You" : bot.name}: ${msg.text.replace(/<[^>]+>/g,"")}`
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

    if (!res.ok) throw new Error("API request failed");

    const data = await res.json();
    const botResponse = data.candidates?.[0]?.content?.parts?.[0]?.text
      ?.replace(/\"(.*?)\"/g, '<span class="quote">"$1"</span>')
      ?.replace(/\n/g, "<br>") || "I'm not sure what to say...";

    setChat((prev) => {
      const updated = [...prev, { sender: "bot", text: botResponse }];
      saveChat(updated);
      return updated;
    });
  } catch (err) {
    setChat((prev) => {
      const updated = [...prev, { sender: "bot", text: "Sorry, I couldn’t respond. There was a network or API issue." }];
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
                {/* APPEND-ONLY: Speaker button for bot messages, bottom-right */}
                {msg.sender !== "user" && (
                  <button
                    className="speak-btn"
                    onClick={() => {
                      if (isSpeaking) {
                        if ("speechSynthesis" in window) {
                          window.speechSynthesis.cancel();
                        }
                        setIsSpeaking(false);
                      } else {
                        speakText(msg.text);
                      }
                    }}
                    title={isSpeaking ? "Stop speaking" : "Speak"}
                    aria-label={isSpeaking ? "Stop speaking" : "Speak"}
                  >
                    {isSpeaking ? "⏹️" : "🔊"}
                  </button>
                )}
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
