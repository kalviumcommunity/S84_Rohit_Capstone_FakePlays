import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import "../styles/style.css";

const Chat = () => {
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const [isHovering, setIsHovering] = useState(false);

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
  <img src="./src/assets/characters/jenna.JPG" alt="Jenna Avatar" className="bot-avatar" />
  <div className="bot-info">
    <h3>Jenna</h3>
    <p>Friendly College Buddy</p>
  </div>
</div>

          <div className="chat-box">
            <div className="message bot">
              Hey! You looked a bit alone so I came over. What's up?
            </div>
            <div className="message user">
              Just spacing out... thanks for coming over 🖤
            </div>
            
          </div>

          <div className="input-area">
            <input type="text" placeholder="Type your message..." className="input-field" />
            <button className="cta-button">Send</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Chat;
