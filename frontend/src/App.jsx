import { ToastContainer } from "react-toastify";
import Signup from "./components/signup";

function App() {
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <Signup />
    </>
  );
}

export default App;
