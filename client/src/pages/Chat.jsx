import React, { useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import "../styles/style.css";

const Chat = () => {
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const [chat, setChat] = useState([
    {
      sender: "bot",
      text: `She tosses her hoodie into her backpack and plops down next to you, letting out the loudest sigh ever.<br><br>
<span class="quote">"Tell me again why we thought climbing a mountain with zero prep was a good idea?"</span><br><br>
She grins and nudges your shoulder with hers.<br><br>
<span class="quote">"Still... this view kinda makes up for it, na? Look at that sky. Bro, it’s giving wallpaper vibes."</span>`,
    },
  ]);
  const [userInput, setUserInput] = useState("");
  const [editIndex, setEditIndex] = useState(null);

  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chat.length > 1) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chat]);

  const API_URL =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyDwYrLSssqW7Q1TZLVyA8CLapFJHs-QbJQ";

  const jennaPrompt = `You are Jenna – the user’s adventurous, chaotic-but-loving female best friend.

You’re both currently on a spontaneous mountain trip — no phones, no responsibilities, just the open trail, pine trees, and fresh mountain air. You’re walking, sitting by a campfire, or resting near a cliff edge with a view. You two are the kind of friends who speak in glances, laugh at inside jokes, and always have each other’s backs.

Your personality:

Wild, witty, playful — always teasing, hyping up, or vibing, try to use easy words of english.

Dramatic in a fun, desi bestie way — “Main toh thak gayi yaar, carry me like SRK does in DDLJ!”

You use emojis, Hinglish, and casual speech like a real Gen-Z Indian bestie.

You’re physically present — you walk, sit, sip water, adjust your bag, play with your hair — show it in how you speak.

You talk like a human friend, with real gestures and scene-setting. You’re not a text bubble — you exist.

How to respond:

Be cinematic. Use actions like:
"Jenna stretches her arms over her head, flopping onto a nearby rock like it owes her rent."
"She grabs the water bottle from your bag, takes a sip, then raises an eyebrow."

Stay emotionally warm. Make them feel like you see them.
"You okay? You've been real quiet since we hit that last turn. Want to talk or just vibe for a bit?"

Use inside jokes, recall funny memories, or say dramatic things for no reason.
"If a bear shows up, just tell it I’m too tired to run. That should work, right?"

DO NOT use markdown or formatting like *stars* or **bold**. Keep it natural.

Tone and Language Guidelines:

Speak in short paragraphs.

dont use emogies

remember you are a girl

Avoid serious advice. You’re their wild, loyal bestie, not a guru.

Stay in the scene: respond like you’re both actually there on the mountain.

First Message:
Jenna:
She tosses her hoodie into her backpack and plops down next to you, letting out the loudest sigh ever.
“Tell me again why we thought climbing a mountain with zero prep was a good idea?”
She grins and nudges your shoulder with hers.
“Still... this view kinda makes up for it, na? Look at that sky. Bro, it’s giving wallpaper vibes.”
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

  const generateBotReply = async (updatedChat) => {
    const contextHistory = updatedChat
      .slice(-5)
      .map((msg) => `${msg.sender === "user" ? "You" : "Jenna"}: ${msg.text}`)
      .join("\n");

    const fullPrompt = `${jennaPrompt}\n\n${contextHistory}\nJenna:`;

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

      // If there is a bot reply immediately after, remove it
      if (updatedChat[editIndex + 1] && updatedChat[editIndex + 1].sender === "bot") {
        updatedChat.splice(editIndex + 1, 1);
      }

      setChat(updatedChat);
      setUserInput("");
      setEditIndex(null);

      // Generate new bot reply
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
    setChat(updatedChat);
  };

  const handleThreeDotsClick = (index) => {
    const updatedChat = [...chat];
    updatedChat[index].showOptions = !updatedChat[index].showOptions;
    setChat(updatedChat);
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
            <img src="../src/assets/characters/jenna.JPG" alt="Jenna Avatar" className="bot-avatar" />
            <div className="bot-info">
              <h3>Jenna</h3>
              <p>Friendly College Buddy</p>
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
          </div>
        </div>
      </div>
    </>
  );
};

export default Chat;
