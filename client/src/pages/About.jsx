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
              {/* Switched from className='character-desc' to id='about-text' */}
              <p id="about-text" style={{ margin: 0 }}>
                FakePlays is a private, judgment‑free AI chat space where anyone can talk openly,
                 feel heard, and get friendly, human‑like replies day or night. Build a personal 
                 support system by creating custom bots tailored to different moods, topics, or goals—no restrictions,
                  no pressure, and no complicated setup. Whether processing a breakup, navigating stress or low days, or just needing a calm place to vent, conversations stay secure and focused on gentle guidance, reflection, and small, helpful steps. The experience is designed to feel like chatting with a kind friend: approachable tone, clear options, and quick responses that respect boundaries and privacy. Everything essential is free, so support is always within reach, and there are no paywalls in the way of a good conversation. Share ideas, issues, or feature requests anytime through the Contact section—feedback directly shapes improvements, keeps vibes friendly and authentic, and helps the platform grow with the community.
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
