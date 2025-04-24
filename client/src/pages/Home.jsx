  import React, { useEffect, useState } from "react";
  import { Link } from "react-router-dom";
  import Navbar from "../components/Navbar";
  import "../styles/style.css";
  import avatar from "../assets/Group 1 (1).jpg";

  function Home() {
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

        <div className="container">
          <div className="left-section">
            <h1 className="heading">Your Safe Space Powered By AI</h1>
            <p className="subtext">A fun, Situational AI chat experience designed for you</p>
            {/* Button replaced with a Link to /login */}
            <Link to="/signup" className="cta-button">Get Started</Link>

            <Link to="/truth-dare">Truth & Dare</Link>
            <Link to="/savannachat">savanna</Link>
            <Link to="/sarahchat">sarah</Link>

         


            <p className="disclaimer">100% private and secure</p>
          </div>
          <div className="right-section">
            <div className="ai-avatar" style={{ backgroundImage: `url(${avatar})` }}></div>
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
              <p>Email: rmehta1836@gmail.com</p>
              <p>Instagram: @rohitmehta_18</p>
            </div>
          </div>
          <div className="footer-bottom">
            © 2025 FakePlays. All rights reserved.
          </div>
        </footer>
      </>
    );
  }

  export default Home;
