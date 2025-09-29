import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useSpring } from "framer-motion";
import Navbar from "../components/Navbar";
import { botsData as predefinedBots } from "../botsData";
import "../styles/style.css";

const TiltableCard = ({ children, onClick }) => {
  const ref = useRef(null);
  const rotateX = useSpring(0, { stiffness: 300, damping: 30, mass: 0.5 });
  const rotateY = useSpring(0, { stiffness: 300, damping: 30, mass: 0.5 });

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - rect.width / 2;
    const offsetY = e.clientY - rect.top - rect.height / 2;
    const rotateAmplitude = 15;
    rotateY.set((offsetX / (rect.width / 2)) * rotateAmplitude);
    rotateX.set((offsetY / (rect.height / 2)) * -rotateAmplitude);
  };

  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className="glass-box character-box"
      style={{ transformStyle: "preserve-3d", rotateX, rotateY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};

function Main() {
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const navigate = useNavigate();
  const [allCharacters, setAllCharacters] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const API_BASE =
    import.meta.env.VITE_API_BASE || "https://s84-rohit-capstone-fakeplays.onrender.com";
  const authToken = localStorage.getItem("token");

  const createBotCharacter = {
    name: "✨ Create Your Own Bot",
    img: "/characters/AI.jpg",
    desc:
      "Craft a custom character: choose a name, upload an image, and set the scenario. Make it yours.",
    path: "create-bot",
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      localStorage.setItem("token", token);
      const url = new URL(window.location.href);
      url.searchParams.delete("token");
      window.history.replaceState({}, "", url.toString());
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      const base = [createBotCharacter, ...predefinedBots];

      if (authToken) {
        try {
          const res = await fetch(`${API_BASE.replace(/\/$/, "")}/api/custom-bots`, {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          });

          if (res.ok) {
            const data = await res.json();
            const remoteBots = (data?.bots || []).map((b) => ({
              path: b.path,
              name: b.name,
              subtitle: b.subtitle || "Custom Bot",
              img: b.img,
              desc: b.desc || "",
              initialMessage: b.initialMessage,
              prompt: "",
              isCustom: true,
            }));
            setAllCharacters([...base, ...remoteBots]);
            return;
          } else {
            console.error("Failed to fetch bots, status:", res.status);
          }
        } catch (err) {
          console.error("Error fetching bots:", err);
        }
      }

      const localBots = JSON.parse(localStorage.getItem("customBots") || "[]");
      setAllCharacters([...base, ...localBots]);
    };

    load();
  }, [authToken]);

  const handleDeleteBot = async (botPathToDelete) => {
    if (authToken) {
      try {
        const res = await fetch(
          `${API_BASE.replace(/\/$/, "")}/api/custom-bots/${encodeURIComponent(botPathToDelete)}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${authToken}` },
          }
        );
        if (res.ok) {
          setAllCharacters((prev) =>
            prev.filter((b) => b.path !== botPathToDelete || b.path === "create-bot")
          );
          return;
        }
      } catch {
        // fallback to local
      }
    }

    if (window.confirm("Are you sure you want to delete this bot?")) {
      const customBots = JSON.parse(localStorage.getItem("customBots") || "[]");
      const updatedBots = customBots.filter((bot) => bot.path !== botPathToDelete);
      localStorage.setItem("customBots", JSON.stringify(updatedBots));
      setAllCharacters([createBotCharacter, ...predefinedBots, ...updatedBots]);
    }
  };

  const visibleCharacters = React.useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return allCharacters;
    return allCharacters.filter((c) =>
      [c.name, c.desc, c.subtitle, c.path].some((f) => (f || "").toLowerCase().includes(q))
    );
  }, [allCharacters, searchTerm]);

  return (
    <>
      <div className="background">
        <div className="circle circle1"></div>
        <div className="circle circle2"></div>
      </div>
      <Navbar isNavbarVisible={isNavbarVisible} setIsHovering={setIsHovering} />
      <div className="main-content">
        <input
          type="text"
          className="search-bar"
          placeholder="Search characters..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="boxes-container">
          {visibleCharacters.map((char) => (
            <div className="card-perspective-wrapper" key={char.path}>
              <TiltableCard
                onClick={() =>
                  navigate(
                    char.path === "create-bot" ? "/create-bot" : `/chat/${char.path}`
                  )
                }
              >
                <img src={char.img} alt={char.name} className="character-img" />
                <h3 className="character-name">{char.name}</h3>
                <p className="character-desc">{char.desc}</p>
                {char.isCustom && char.path !== "create-bot" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteBot(char.path);
                    }}
                    className="delete-bot-button"
                    title="Delete Bot"
                  >
                    ×
                  </button>
                )}
              </TiltableCard>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Main;
