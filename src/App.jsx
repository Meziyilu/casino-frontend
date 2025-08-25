import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./pages/AuthPage.jsx";
import Lobby from "./pages/Lobby.jsx";      // 你的大廳頁
import Baccarat from "./pages/Baccarat.jsx";

function RequireAuth({ children }) {
  const t = localStorage.getItem("token");
  return t ? children : <Navigate to="/auth" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/" element={<RequireAuth><Lobby /></RequireAuth>} />
        <Route path="/game/baccarat" element={<RequireAuth><Baccarat /></RequireAuth>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
