// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./pages/AuthPage.jsx";
import Lobby from "./pages/Lobby.jsx";
import BaccaratRooms from "./pages/BaccaratRooms.jsx";
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

        {/* 先選房間 */}
        <Route path="/game/baccarat" element={<RequireAuth><BaccaratRooms /></RequireAuth>} />
        {/* 進入指定房間（roomId = 1/2/3） */}
        <Route path="/game/baccarat/room/:roomId" element={<RequireAuth><Baccarat /></RequireAuth>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
