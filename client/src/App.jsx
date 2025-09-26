import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Main from "./pages/Main";
import Chat from "./pages/Chat";
import CreateBot from "./pages/CreateBot";
import SavedChats from "./pages/SavedChats";
import About from "./pages/About";

// Redirect unauthenticated users to /signup for protected routes
const RequireAuth = ({ children }) => {
  const isAuthed = Boolean(localStorage.getItem("token"));
  return isAuthed ? children : <Navigate to="/signup" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public landing */}
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />

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
    </Router>
  );
}

export default App;
