import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../styles/style.css";

function Login() {
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorAnimation, setErrorAnimation] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const timeoutId = setTimeout(() => setIsNavbarVisible(false), 5000);

    const handleMouseMove = (e) => {
      if (!isHovering) {
        setIsNavbarVisible(e.clientY < 30);
      }
    };

    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isHovering]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(""); // Reset previous error

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        setShowSuccess(true);
        setTimeout(() => navigate("/Main"), 1500);
      } else {
        triggerErrorAnimation("Invalid username or password");
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      triggerErrorAnimation("Network error, try again!");
      setLoading(false);
    }
  };

  const triggerErrorAnimation = (message) => {
    setErrorAnimation(true);
    setErrorMessage(message);
    setTimeout(() => {
      setErrorAnimation(false);
    }, 800); // Matches CSS animation
  };

  const SuccessCheck = () => (
    <div className="success-check-container">
      <svg className="checkmark" viewBox="0 0 52 52">
        <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none" />
        <path className="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
      </svg>
      <div className="success-glow"></div>
    </div>
  );

  return (
    <>
      {/* Background animated circles */}
      <div className="background">
        <div className="circle circle1"></div>
        <div className="circle circle2"></div>
        <div className="circle circle3"></div>
      </div>

      {/* Navbar */}
      <Navbar isNavbarVisible={isNavbarVisible} setIsHovering={setIsHovering} />

      {/* Login Container */}
      <div className="container login-container">
        <div className="login-box">
          <h2 className="heading">Welcome Back</h2>
          <p className="subtext">Login to continue your AI chat experience</p>

          {/* Login Form */}
          <form className="login-form" onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Username"
              className="input-field"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button
              type="submit"
              className={`cta-button ${showSuccess ? "success" : ""} ${errorAnimation ? "error" : ""}`}
              disabled={loading || showSuccess}
            >
              {showSuccess ? (
                <SuccessCheck />
              ) : loading ? (
                <div className="dot-loader">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              ) : (
                "Login"
              )}
            </button>

            {/* Show Error Message if any */}
            {errorMessage && (
              <p className="error-message">{errorMessage}</p>
            )}
          </form>

          {/* Google OAuth */}
          <div className="google-login-wrapper">
            <p className="or-text">or</p>
            <a
              href="http://localhost:5000/api/auth/google"
              className="google-button"
            >
              <img
                src="https://img.icons8.com/color/16/000000/google-logo.png"
                alt="Google icon"
              />
              Sign up with Google
            </a>
          </div>

          {/* Disclaimer */}
          <p className="disclaimer">Your login is encrypted and secure.</p>
        </div>
      </div>
    </>
  );
}

export default Login;
