import React from "react";
import Navbar from "../components/Navbar";
import "../styles/style.css";

function About() {
  return (
    <>
      <div className="background">
        <div className="circle circle1"></div>
        <div className="circle circle2"></div>
      </div>

      <Navbar isNavbarVisible={true} setIsHovering={() => {}} />

      <div className="container chat-container">
        <div className="login-box chat-box-wrapper">
          <div className="chat-header">
            <div className="bot-avatar placeholder">ℹ️</div>
            <div className="bot-info">
              <h3>About</h3>
              <p>Project overview</p>
            </div>
          </div>

          <div className="bot-form" style={{ padding: "12px 0" }}>
            <div className="form-group">
              <p className="character-desc" style={{ margin: 0 }}>
                This project is an AI character chat platform with customizable bots, saved
                conversations, and voice input. It supports secure auth, per-user saved chats
                in the backend, and a clean, responsive UI. Edit this text anytime to describe
                goals, tech stack, or release notes.
              </p>
            </div>
          </div>

          <div className="input-area" style={{ justifyContent: "flex-end" }}>
            {/* Optional CTA area; leave empty for now */}
          </div>
        </div>
      </div>
    </>
  );
}

export default About;
