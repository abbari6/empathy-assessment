import {
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import { LoginSuccess } from "./pages/LoginSuccess";
import { useEffect } from "react";

function App() {
  
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("instagram_token");
    if (token) {
      navigate("/profile");
    } else {
      navigate("");
    }
  }, [navigate]);

  return (
      <Routes>
        <Route path="" index element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/login-success" element={<LoginSuccess />} />
      </Routes>
  );
}

export default App;
