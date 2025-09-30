import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Main from "./pages/Main";
import Chat from "./pages/Chat";
import CreateBot from "./pages/CreateBot";
import SavedChats from "./pages/SavedChats";
import About from "./pages/About";
import Contact from "./pages/Contact";

// Redirect unauthenticated users to /signup for protected routes
const RequireAuth = ({ children }) => {
  const isAuthed = Boolean(localStorage.getItem("token"));
  return isAuthed ? children : <Navigate to="/signup" replace />;
};

// Component to automatically handle Google OAuth token in URL
const AuthHandler = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    if (token) {
      localStorage.setItem("token", token);
      navigate("/main", { replace: true });
    }
  }, [location, navigate]);

  return children;
};

function App() {
  return (
    <Router>
      <AuthHandler>
        <Routes>
          {/* Public landing */}
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/contact" element={<Contact />} />

          {/* Protected pages: redirect to /signup if not authed */}
          <Route
            path="/main"
            element={
              <RequireAuth>
                <Main />
              </RequireAuth>
            }
          />
          <Route
            path="/saved-chats"
            element={
              <RequireAuth>
                <SavedChats />
              </RequireAuth>
            }
          />

          {/* Other routes left unchanged */}
          <Route path="/create-bot" element={<CreateBot />} />
          <Route path="/chat/:botPath" element={<Chat />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </AuthHandler>
    </Router>
  );
}

export default App;
