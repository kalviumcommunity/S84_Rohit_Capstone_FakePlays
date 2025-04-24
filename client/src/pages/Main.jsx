import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../styles/style.css";

function Main() {
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {

    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");
    if (token) {
      localStorage.setItem("token", token);
      navigate("/main", { replace: true });
    }
    
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

  const characters = [
    {
      name: "Jenna – Your Best Friend in the Mountains",
      img: "./src/assets/characters/jenna.JPG",
      desc: "You're on a spontaneous mountain trip with Jenna, your female bestie. She's the chaos to your calm, your safe space when things get wild. The vibe is unmatched.",
      path: "jenna-chat",
    },
    {
      name: "Truth & Dare – The Fun Instigator",
      img: "./src/assets/characters/TDS.JPG",
      desc: "It’s a friend get-together and the energy is high. This bot jumps in to spice things up with fun, flirty, or deep truth and dare prompts. Are you ready to play?",
      path: "truth-dare-chat",
    },
    {
      name: "Nivaan – The Walk to School Buddy",
      img: "./src/assets/characters/nivaan.JPG",
      desc: "Every school morning feels lighter with Nivaan beside you. He’s witty, unpredictable, and always knows what to say to make you laugh when you're half-asleep.",
      path: "nivaan-chat",
    },
    {
      name: "Savanna – The Friendly Classmate",
      img: "./src/assets/characters/savanna.JPG",
      desc: "You’re sitting alone when Savanna walks over, no hesitation. She’s curious, kind, and suddenly you’re in a surprisingly deep conversation you didn’t know you needed.",
      path: "savanna-chat",
    },
    {
      name: "Sarah – Your Crush After the Game",
      img: "./src/assets/characters/sarah.JPG",
      desc: "You finally gather the courage to approach Sarah, your longtime crush, just after her thrilling basketball match. She’s radiant, a little sweaty, and surprised—but smiling. This could be your moment.",
      path: "sarah-chat",
    },
    {
      name: "Unknown Bus Girl – The Mystery Co-Passenger",
      img: "./src/assets/characters/Unknown Bus Girl.JPG",
      desc: "She sat beside you on the bus, headphones in, quietly reading a book. There was something about her. Now, you have a chance to break the ice and learn her story.",
      path: "unknown-bus-girl-chat",
    },
    {
      name: "Serena – The Silent Admirer",
      img: "./src/assets/characters/serena.JPG",
      desc: "Serena has been harboring feelings for you for a while now. She’s kind, warm, and always around, but too shy to confess. Today, she’s more nervous than usual—will she open up?",
      path: "serena-chat",
    },
    {
      name: "Noah – Your Girlfriend Going Through a Rough Patch",
      img: "./src/assets/characters/noah.JPG",
      desc: "Things haven’t been great between you two lately. Noah reaches out—she needs to talk, heart-to-heart. It’s serious, emotional, and maybe a turning point in your relationship.",
      path: "noah-chat",
    },
    {
      name: "Maria – A Good Friend in Trouble",
      img: "./src/assets/characters/maria.JPG",
      desc: "Maria’s always been there for you. Today, she messages you asking for help—her voice sounds different, maybe even a little scared. She trusts you. Will you be there for her?",
      path: "maria-chat",
    },
  ];

  return (
    <>
      <div className="background">
        <div className="circle circle1"></div>
        <div className="circle circle2"></div>
        <div className="circle circle3"></div>
      </div>

      <Navbar isNavbarVisible={isNavbarVisible} setIsHovering={setIsHovering} />

      <div className="main-content">
        <input type="text" className="search-bar" placeholder="Search chats or topics..." />

        <div className="boxes-container">
          {characters.map((char, index) => (
            <div
              key={index}
              className="glass-box character-box"
              onClick={() => navigate(`/chat/${char.path}`)}
              style={{ cursor: "pointer" }}
            >
              <img src={char.img} alt={char.name} className="character-img" />
              <h3 className="character-name">{char.name}</h3>
              <p className="character-desc">{char.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Main;
