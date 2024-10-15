import ChatWindow from "./components/chatwindow";
import Signup from "./components/signup";
import { Route, Router, Routes } from "react-router-dom";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Signup />} />
        <Route path="/chat" element={<ChatWindow />} />
      </Routes>
    </>
  );
}

export default App;
