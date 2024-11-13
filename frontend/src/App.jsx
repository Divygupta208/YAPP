import ChatWindow from "./components/chatwindow";
import Signup from "./components/signup";
import { Route, Router, Routes } from "react-router-dom";
import Home from "./pages/home";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Signup />} />
        <Route path="/chat" element={<Home />} />
      </Routes>
    </>
  );
}

export default App;
