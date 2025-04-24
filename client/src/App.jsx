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

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/main" element={<Main />} /> 
        <Route path="/chat" element={<Chat />} />
        <Route path="/chat/:character" element={<Chat />} />
        <Route path="/truth-dare" element={<TruthDare />} />
        <Route path="/savannachat" element={<SavannaChat />} />
        <Route path="/sarahchat" element={<SarahChat />} />
        <Route path="/unknownbusgirl" element={<UnknownBusGirl />} />
        <Route path="/noah" element={<ChatNoah />} />
        <Route path="/serena" element={<Serena />} />
        <Route path="/maria" element={<Maria />} />
        <Route path="/nivaanchat" element={<NivaanChat />} />


        
        

      </Routes>
    </Router>
  );
}

export default App;
