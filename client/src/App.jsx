import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Main from "./pages/Main";
import Chat from "./pages/Chat";
import CreateBot from "./pages/CreateBot";

function App() {
  return (
    <Router>
      <Routes>
        {/* Core Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/main" element={<Main />} />
        
        {/* Bot-related Routes */}
        <Route path="/create-bot" element={<CreateBot />} />
        <Route path="/chat/:botPath" element={<Chat />} /> {/* This one route handles ALL bots! */}
      </Routes>
    </Router>
  );
}

export default App;
