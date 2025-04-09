import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import "../styles/style.css";

function Main() {
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

      <div className="main-content">
        <input type="text" className="search-bar" placeholder="Search chats or topics..." />



<div className="boxes-container">
  {Array.from({ length: 12 }).map((_, index) => (
    <div className="glass-box character-box" key={index}>
      <img src="https://via.placeholder.com/250x200" alt="Character" className="character-img" />
      <h3 className="character-name">Character Name</h3>
      <p className="character-desc">
         sample character description.....edit this later.
      </p>
    </div>
  ))}
</div>


      </div>
    </>
  );
}

export default Main;
