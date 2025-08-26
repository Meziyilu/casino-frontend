// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import Lobby from "./pages/Lobby";
import BaccaratRoom from "./pages/BaccaratRoom";
import AdminPage from "./pages/AdminPage";

// 簡單的私有頁守衛
function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/auth" replace />;
  return children;
}

export default function App() {
  // 若已登入，導去大廳；未登入導去 /auth
  const token = localStorage.getItem("token");
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={token ? "/lobby" : "/auth"} replace />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route
          path="/lobby"
          element={
            <PrivateRoute>
              <Lobby />
            </PrivateRoute>
          }
        />
        <Route
          path="/baccarat/room/:roomId"
          element={
            <PrivateRoute>
              <BaccaratRoom />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <AdminPage />
            </PrivateRoute>
          }
        />
        {/* 404 fallback */}
        <Route path="*" element={<Navigate to={token ? "/lobby" : "/auth"} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
