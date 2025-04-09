
import React, { useEffect, useState } from "react";
import "./Home.css"; // Make sure to include styles here

function App() {
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

      <nav
        className={`navbar ${!isNavbarVisible ? "hide-navbar" : ""}`}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div className="logo">
          <img src="./src/assets/Group 1 (1).jpg" alt="FakePlays Logo" className="logo-img" />
        </div>
        <ul className="nav-menu">
          <li><a href="#">Home</a></li>
          <li className="dropdown">
            <a href="#">Features</a>
            <ul className="dropdown-menu">
              <li><a href="#">Anonymous Chat</a></li>
              <li><a href="#">AI Avatars</a></li>
              <li><a href="#">Voice Mode</a></li>
            </ul>
          </li>
          <li><a href="#">Contact</a></li>
          <li><a href="#">About</a></li>
        </ul>
      </nav>

      <div className="container">
        <div className="left-section">
          <h1 className="heading">Your Safe Space Powered By AI</h1>
          <p className="subtext">A fun, Situational AI chat experience designed for you</p>
          <button className="cta-button">Get Started</button>
          <p className="disclaimer">100% private and secure</p>
        </div>
        <div className="right-section">
          <div className="ai-avatar"></div>
          <div className="pulse"></div>
        </div>
      </div>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h2>About FakePlays</h2>
            <p>
              FakePlays is your private AI-powered chat companion. Connect anonymously,
              get real-time advice, and enjoy smart conversations in a safe digital space.
            </p>
          </div>
          <div className="footer-section">
            <h2>Contact Us</h2>
            <p>Email: support@fakeplays.ai</p>
            <p>Instagram: @fakeplays.ai</p>
            <p>Location: Kalvium Campus, India</p>
          </div>
        </div>
        <div className="footer-bottom">
          © 2025 FakePlays. All rights reserved.
        </div>
      </footer>
    </>
  );
}

export default App;
