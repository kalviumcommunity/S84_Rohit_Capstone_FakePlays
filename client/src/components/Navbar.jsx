import React from "react";
import "../styles/style.css";
import logo from "../assets/Group 1 (1).jpg";

const Navbar = ({ isNavbarVisible, setIsHovering }) => {
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
  );
};

export default Navbar;
