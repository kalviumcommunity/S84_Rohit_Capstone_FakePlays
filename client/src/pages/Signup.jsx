import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../styles/style.css";

function Signup() {
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const [isHovering, setIsHovering] = useState(false);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // ----------------- Navbar visibility -----------------
  useEffect(() => {
    const timeout = setTimeout(() => setIsNavbarVisible(false), 5000);
    const handleMouseMove = (e) => {
      if (isHovering) return;
      setIsNavbarVisible(e.clientY < 30);
    };
    document.addEventListener("mousemove", handleMouseMove);
    return () => {
      clearTimeout(timeout);
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isHovering]);

  // ----------------- Handle Google OAuth Token -----------------
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      localStorage.setItem("token", token);
      window.history.replaceState({}, document.title, "/main"); // Remove token from URL
      navigate("/main");
    }
  }, []);

  // ----------------- Handle Username/Password Signup -----------------
  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(
        "https://s84-rohit-capstone-fakeplays.onrender.com/api/auth/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, email, password }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        setShowSuccess(true);
        setTimeout(() => navigate("/login"), 1500);
      } else {
        alert(data.error || "Signup failed");
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      alert("Network error");
      setLoading(false);
    }
  };

  const SuccessCheck = () => (
    <div className="success-check-container">
      <svg className="checkmark" viewBox="0 0 52 52">
        <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none" />
        <path
          className="checkmark__check"
          fill="none"
          d="M14.1 27.2l7.1 7.2 16.7-16.8"
        />
      </svg>
      <div className="success-glow"></div>
    </div>
  );

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

          <form className="login-form" onSubmit={handleSignup}>
            <input
              type="text"
              placeholder="Username"
              className="input-field"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Email"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              className={`cta-button ${showSuccess ? "success" : ""}`}
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
                "Sign Up"
              )}
            </button>
          </form>

          {/* Google OAuth */}
          <div className="google-login-wrapper">
            <p className="or-text">or</p>
            <a
              href="https://s84-rohit-capstone-fakeplays.onrender.com/api/auth/google"
              className="google-button"
            >
              <img
                src="https://img.icons8.com/color/16/000000/google-logo.png"
                alt="Google icon"
              />
              Sign up with Google
            </a>
          </div>

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
