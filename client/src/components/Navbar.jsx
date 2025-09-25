import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/style.css";
import logo from "../assets/Group 1 (1).jpg";

const Navbar = ({ isNavbarVisible, setIsHovering }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav
      className={`navbar ${!isNavbarVisible ? "hide-navbar" : ""}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="logo">
        <img src={logo} alt="FakePlays Logo" className="logo-img" />
      </div>
      <ul className="nav-menu">
        <li><Link to="/main">Home</Link></li>
        <li className="dropdown">
          <a href="#">Features</a>
          <ul className="dropdown-menu">
            <li><Link to="/saved-chats">Saved Chats</Link></li>
            <li><a href="#">AI Avatars</a></li>
            <li><a href="#">Voice Mode</a></li>
          </ul>
        </li>
        <li><a href="#">Contact</a></li>
        {/* Replaced About with Logout */}
        <li>
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
