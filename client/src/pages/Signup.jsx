import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../styles/style.css";

function Signup() {
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

      <div className="container login-container">
        <div className="login-box">
          <h2 className="heading">Create an Account</h2>
          <p className="subtext">Sign up to start your AI chat experience</p>
          <form className="login-form">
            <input type="text" placeholder="Username" className="input-field" />
            <input type="email" placeholder="Email" className="input-field" />
            <input type="password" placeholder="Password" className="input-field" />
            <button type="submit" className="cta-button">Sign Up</button>
          </form>
          
          <p className="login-link">
            Already have an account? <Link to="/login">Log in here</Link>
          </p>

          <p className="disclaimer">We value your privacy and data security.</p>
        </div>
      </div>
    </>
  );
}

export default Signup;
