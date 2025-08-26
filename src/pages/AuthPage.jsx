import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "../styles/ui.css";

export default function AuthPage() {
  const [mode, setMode] = useState("login"); // login | register
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password.trim()) {
      setError("請輸入帳號與密碼");
      return;
    }
    setLoading(true);
    try {
      if (mode === "register") {
        await api.register({ username, password });
      }
      const r = await api.login({ username, password });
      localStorage.setItem("username", r.username || username);
      localStorage.setItem("uid", String(r.id || ""));
      navigate("/lobby"); // 客端切頁，避免 404
    } catch (err) {
      setError("登入/註冊失敗，請確認帳號密碼或稍後再試");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-bg">
      {/* 背景光暈 */}
      <div className="glow g1" />
      <div className="glow g2" />
      <div className="glow g3" />

      <main className="auth-wrap">
        <form className="auth-card animate-pop" onSubmit={onSubmit}>
          <div className="auth-brand">
            <div className="brand-logo">🎰</div>
            <div className="brand-name">TOPZ</div>
          </div>

          <h1 className="auth-title">{mode === "login" ? "歡迎回來" : "建立帳號"}</h1>
          <p className="auth-subtitle">
            {mode === "login" ? "請登入以進入大廳" : "填寫以下資訊以建立你的帳號"}
          </p>

          <label className="auth-label">帳號</label>
          <div className="input-group">
            <span className="input-icon">👤</span>
            <input
              className="auth-input"
              placeholder="輸入帳號"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={30}
              autoComplete="username"
            />
          </div>

          <label className="auth-label auth-label-row">
            <span>密碼</span>
            <button
              type="button"
              className="link-btn"
              onClick={() => setShowPass((s) => !s)}
              aria-label="顯示/隱藏密碼"
            >
              {showPass ? "隱藏" : "顯示"}
            </button>
          </label>
          <div className="input-group">
            <span className="input-icon">🔒</span>
            <input
              className="auth-input"
              placeholder="輸入密碼"
              type={showPass ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              maxLength={50}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
          </div>

          {error && <div className="auth-error animate-shake">{error}</div>}

          <button className="auth-btn primary" disabled={loading}>
            {loading ? "處理中…" : mode === "login" ? "登入" : "建立帳號"}
          </button>

          <button
            type="button"
            className="auth-btn ghost"
            onClick={() => {
              setError("");
              setMode((m) => (m === "login" ? "register" : "login"));
            }}
            disabled={loading}
          >
            {mode === "login" ? "切換到註冊" : "已有帳號？前往登入"}
          </button>

          <footer className="auth-footer">
            <span>© {new Date().getFullYear()} TOPZ</span>
          </footer>
        </form>
      </main>
    </div>
  );
}
