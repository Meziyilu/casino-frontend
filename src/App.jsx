import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import Lobby from "./pages/Lobby";
// 之後你會放的百家樂房間頁（先留著路由，尚未實作也不會報錯）
import BaccaratRoom from "./pages/BaccaratRoom";

// 最簡保護路由：沒 token 就退回登入
function Private({ children }) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 登入 / 註冊頁 */}
        <Route path="/" element={<AuthPage />} />

        {/* 大廳（保護） */}
        <Route
          path="/lobby"
          element={
            <Private>
              <Lobby />
            </Private>
          }
        />

        {/* 百家樂三房（保護） */}
        <Route
          path="/baccarat/room/:roomId"
          element={
            <Private>
              <BaccaratRoom />
            </Private>
          }
        />

        {/* 兜底：未知路徑導回大廳（若未登入會被 Private 擋回 /） */}
        <Route path="*" element={<Navigate to="/lobby" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
