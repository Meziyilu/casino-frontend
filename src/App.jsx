import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import AuthPage from "./pages/AuthPage.jsx";
import Lobby from "./pages/Lobby.jsx";
import Baccarat from "./pages/Baccarat.jsx";

function RequireAuth({ children }) {
  const t = localStorage.getItem("token");
  return t ? children : <Navigate to="/auth" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/" element={<RequireAuth><Lobby /></RequireAuth>} />
          <Route path="/game/baccarat" element={<RequireAuth><Baccarat /></RequireAuth>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
