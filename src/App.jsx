import { Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import Lobby from "./pages/Lobby";
import Baccarat from "./pages/Baccarat";

export default function App() {
  const token = localStorage.getItem("token");
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/" element={token ? <Lobby /> : <Navigate to="/auth" />} />
      <Route path="/game/baccarat" element={token ? <Baccarat /> : <Navigate to="/auth" />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
