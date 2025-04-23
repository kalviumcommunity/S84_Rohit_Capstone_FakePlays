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

  const navigate = useNavigate();

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

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        alert("Login successful!");
        navigate("/Main");
      } else {
        alert(data.error || "Login failed");
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      alert("Network error");
      setLoading(false);
    }
  };

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
          <h2 className="heading">Welcome Back</h2>
          <p className="subtext">Login to continue your AI chat experience</p>
          <form className="login-form" onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Username"
              className="input-field"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button type="submit" className="cta-button" disabled={loading}>
              {loading ? (
                <div className="dot-loader">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              ) : (
                "Login"
              )}
            </button>
          </form>
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
          <p className="disclaimer">Your login is encrypted and secure.</p>
        </div>
      </div>
    </>
  );
}

export default Login;
