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
  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";
  const authToken = localStorage.getItem("token");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/saved-chats`, {
          headers: { Authorization: authToken || "" }
        });
        if (res.ok) {
          const data = await res.json();
          setChats(data?.chats || []);
        } else {
          setChats([]);
        }
      } catch (_) {
        setChats([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

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
                <div className="card-perspective-wrapper" key={c._id || c.botPath}>
                  <div
                    className="glass-box character-box"
                    onClick={() => navigate(`/chat/${c.botPath}`)}
                    style={{ cursor: "pointer" }}
                  >
                    <h3 className="character-name">{c.botName}</h3>
                    <p className="character-desc">{preview}</p>
                    <p className="character-desc">
                      Last updated: {new Date(c.updatedAt).toLocaleString()}
                    </p>
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
