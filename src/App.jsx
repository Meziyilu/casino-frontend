// src/App.jsx
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import AuthPage from "./pages/AuthPage.jsx";
import Lobby from "./pages/Lobby.jsx";
import Baccarat from "./pages/Baccarat.jsx";
import AdminPage from "./pages/Admin.jsx";

function RequireAuth({ children }) {
  const token = localStorage.getItem("token");
  const loc = useLocation();
  if (!token) return <Navigate to="/auth" state={{ from: loc }} replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/" element={<RequireAuth><Lobby /></RequireAuth>} />
      <Route path="/game/baccarat" element={<RequireAuth><Baccarat /></RequireAuth>} />
      <Route path="/admin" element={<RequireAuth><AdminPage /></RequireAuth>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
