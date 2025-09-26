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

  const isAuthed = Boolean(localStorage.getItem("token"));

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
        {isAuthed && <li><Link to="/main">Home</Link></li>}
        <li className="dropdown">
          <a href="#">Settings</a>
          <ul className="dropdown-menu">
            {isAuthed && <li><Link to="/saved-chats">Saved Chats</Link></li>}
            <li><Link to="/contact">Contact</Link></li>
            <li>
              <button className="logout-button" onClick={handleLogout}>
                Logout
              </button>
            </li>
          </ul>
        </li>
        <li><Link to="/about">About</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;
