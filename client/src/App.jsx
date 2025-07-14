import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Main from "./pages/Main";
import Chat from "./pages/Chat";
import TruthDare from "./pages/TruthDare";
import SavannaChat from "./pages/SavannaChat";
import SarahChat from "./pages/SarahChat";
import UnknownBusGirl from "./pages/UnknownBusGirl";
import ChatNoah from "./pages/NoahChat";
import Serena from "./pages/Serena";
import Maria from "./pages/Maria";
import NivaanChat from "./pages/NivaanChat";
import CreateBot from "./pages/CreateBot";
import CustomChat from "./pages/CustomChat";
import BotChat from "./pages/BotChat";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/main" element={<Main />} />
        <Route path="/chat/:botName" element={<Chat />} />
        <Route path="/chat/truth-dare-chat" element={<TruthDare />} />
        <Route path="/chat/savanna-chat" element={<SavannaChat />} />
        <Route path="/chat/sarah-chat" element={<SarahChat />} />
        <Route path="/chat/unknown-bus-girl-chat" element={<UnknownBusGirl />} />
        <Route path="/chat/noah-chat" element={<ChatNoah />} />
        <Route path="/chat/serena-chat" element={<Serena />} />
        <Route path="/chat/maria-chat" element={<Maria />} />
        <Route path="/chat/nivaan-chat" element={<NivaanChat />} />
        <Route path="/chat/create-bot" element={<CreateBot />} />
        <Route path="/chat/:botnew" element={<CustomChat />} /> 
        <Route path="/chat/:botPath" element={<BotChat />} />
      </Routes>
    </Router>
  );
}

export default App;