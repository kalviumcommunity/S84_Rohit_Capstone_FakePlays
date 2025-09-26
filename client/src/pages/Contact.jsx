import React, { useState } from "react";
import Navbar from "../components/Navbar";
import "../styles/style.css";

function Contact() {
  // Known profile links (kept)
  const CONTACT = {
    email: "rmehta1836@gmail.com",
    instagram: "https://instagram.com/rohitmehta__18",
    linkedin: "https://www.linkedin.com/in/rohit-mehta-ba4084355/",
    github: "https://github.com/rohitmehta18"
  };

  // Controlled inputs
  const [fromEmail, setFromEmail] = useState("");
  const [message, setMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const SuccessCheck = () => (
    <div className="success-check-container">
      <svg className="checkmark" viewBox="0 0 52 52">
        <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none" />
        <path className="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
      </svg>
      <div className="success-glow"></div>
    </div>
  );

  // Gmail compose submit (opens Gmail instead of system mail client)
  const handleSubmit = (e) => {
    e.preventDefault();
    const to = CONTACT.email;
    const su = encodeURIComponent("Feedback from website");
    const body = encodeURIComponent(`From: ${fromEmail}\n\n${message}`);
    // Open Gmail compose (u/0 = default signed-in account; will prompt login if needed)
    window.open(`https://mail.google.com/mail/u/0/?to=${to}&su=${su}&body=${body}&tf=cm`, "_blank");
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 1500);
  };

  return (
    <>
      <div className="background">
        <div className="circle circle1"></div>
        <div className="circle circle2"></div>
      </div>

      <Navbar isNavbarVisible={true} setIsHovering={() => {}} />

      <div className="container chat-container">
        <div className="login-box chat-box-wrapper">
          <div className="chat-header">
            <div className="bot-avatar placeholder">📬</div>
            <div className="bot-info">
              <h3>Contact</h3>
              <p>Reach out and share feedback</p>
            </div>
          </div>

          <div className="bot-form" style={{ padding: "12px 0" }}>
            <div className="form-group">
              <div className="character-desc" style={{ margin: 0 }}>
                <p style={{ margin: "0 0 10px" }}>
                  Profiles and links:
                </p>

                {/* Contact boxes grid */}
                <div className="contact-links">
                  <a
                    className="contact-card"
                    href={`mailto:${CONTACT.email}`}
                    aria-label="Email"
                  >
                    <span className="contact-icon">✉️</span>
                    <span className="contact-label">Email</span>
                  </a>

                  <a
                    className="contact-card"
                    href={CONTACT.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                  >
                    <span className="contact-icon">📸</span>
                    <span className="contact-label">Instagram</span>
                  </a>

                  <a
                    className="contact-card"
                    href={CONTACT.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn"
                  >
                    <span className="contact-icon">💼</span>
                    <span className="contact-label">LinkedIn</span>
                  </a>

                  <a
                    className="contact-card"
                    href={CONTACT.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="GitHub"
                  >
                    <span className="contact-icon">💻</span>
                    <span className="contact-label">GitHub</span>
                  </a>
                </div>
              </div>
            </div>

            <hr style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.1)", margin: "14px 0" }} />

            {/* Gmail-based feedback submit */}
            <form className="login-form" onSubmit={handleSubmit} style={{ marginTop: 0, gap: "0.75rem" }}>
              <input
                type="email"
                className="input-field"
                placeholder="Your email"
                value={fromEmail}
                onChange={(e) => setFromEmail(e.target.value)}
                required
              />
              <textarea
                className="input-field"
                placeholder="Your feedback..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                required
                style={{ resize: "vertical" }}
              />
              <button
                type="submit"
                className={`cta-button ${showSuccess ? "success" : ""}`}
              >
                {showSuccess ? (
                  <SuccessCheck />
                ) : (
                  "Submit Feedback"
                )}
              </button>
            </form>
          </div>

          <div className="input-area" style={{ justifyContent: "flex-end" }}>
            {/* Optional CTA area */}
          </div>
        </div>
      </div>
    </>
  );
}

export default Contact;
