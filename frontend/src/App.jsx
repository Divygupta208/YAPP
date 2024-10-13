import Signup from "./components/signup";
import { Route, Router, Routes } from "react-router-dom";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Signup />} />
      </Routes>
    </>
  );
}

export default App;
