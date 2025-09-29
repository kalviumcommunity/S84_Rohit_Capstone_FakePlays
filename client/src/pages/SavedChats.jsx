import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../styles/style.css";

function SavedChats() {
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const API_BASE =
    import.meta.env.VITE_API_BASE?.replace(/\/$/, "") ||
    "https://s84-rohit-capstone-fakeplays.onrender.com";
  const authToken = localStorage.getItem("token");

  const loadSavedChats = async () => {
    setLoading(true);
    if (!authToken) {
      setChats([]);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/saved-chats`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (res.ok) {
        const data = await res.json();
        setChats(data?.chats || []);
      } else if (res.status === 404) {
        setChats([]); // No saved chats yet
      } else {
        console.error("Failed to fetch saved chats:", res.status);
        setChats([]);
      }
    } catch (err) {
      console.error("Error fetching saved chats:", err);
      setChats([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSavedChats();
  }, []);

  const handleDelete = async (botPath) => {
    if (!authToken) {
      alert("Please sign in to delete saved chats.");
      return;
    }
    if (!window.confirm("Delete this saved chat? This cannot be undone.")) return;

    try {
      const res = await fetch(
        `${API_BASE}/api/saved-chats/${encodeURIComponent(botPath)}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      if (res.ok) {
        setChats((prev) => prev.filter((c) => c.botPath !== botPath));
      } else {
        const msg = await res.json().catch(() => ({}));
        alert(msg?.error || "Failed to delete saved chat.");
      }
    } catch (err) {
      console.error("Error deleting chat:", err);
      alert("Network error while deleting saved chat.");
    }
  };

  return (
    <>
      <div className="background">
        <div className="circle circle1"></div>
        <div className="circle circle2"></div>
      </div>
      <Navbar isNavbarVisible={isNavbarVisible} setIsHovering={setIsHovering} />
      <div className="main-content">
        <h2 style={{ color: "white", marginBottom: "12px" }}>Saved Chats</h2>

        {loading ? (
          <div className="login-box chat-box-wrapper">Loading...</div>
        ) : !authToken ? (
          <div className="login-box chat-box-wrapper">
            Sign in is required to view saved chats.
          </div>
        ) : chats.length === 0 ? (
          <div className="login-box chat-box-wrapper">No saved chats yet.</div>
        ) : (
          <div className="boxes-container">
            {chats.map((c) => {
              const preview =
                c.messages?.[c.messages.length - 1]?.text
                  ?.replace(/<[^>]+>/g, "")
                  ?.slice(0, 150) || "";
              return (
                <div className="card-perspective-wrapper" key={c.botPath}>
                  <div
                    className="glass-box character-box"
                    onClick={() => navigate(`/chat/${c.botPath}`)}
                    style={{ cursor: "pointer", position: "relative" }}
                  >
                    <h3 className="character-name">{c.botName}</h3>
                    <p className="character-desc">{preview}</p>
                    <p className="character-desc">
                      Last updated: {new Date(c.updatedAt).toLocaleString()}
                    </p>
                    <button
                      className="delete-bot-button"
                      title="Delete Saved Chat"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(c.botPath);
                      }}
                      style={{ position: "absolute", top: 8, right: 8 }}
                    >
                      ×
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

export default SavedChats;
