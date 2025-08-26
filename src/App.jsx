import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import Lobby from "./pages/Lobby";

function RequireLogin({ children }) {
  const u = localStorage.getItem("username");
  if (!u) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route
          path="/lobby"
          element={
            <RequireLogin>
              <Lobby />
            </RequireLogin>
          }
        />
        {/* SPA catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
