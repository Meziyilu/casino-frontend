import { useState } from "react";
import { api } from "../api";
import "../styles/ui.css";

export default function AuthPage() {
  const [mode, setMode] = useState("login"); // login | register
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    if (!username.trim() || !password.trim()) {
      setErr("請輸入帳號與密碼");
      return;
    }
    setLoading(true);
    try {
      if (mode === "register") {
        await api.register({ username, password });
      }
      const r = await api.login({ username, password });

      // 儲存基本資訊供大廳使用（簡易方案）
      localStorage.setItem("uid", String(r.id || ""));
      localStorage.setItem("username", r.username || username);

      window.location.href = "/lobby";
    } catch (e) {
      setErr(e.message || "發生錯誤，請稍後再試");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-bg">
      <div className="glow g1" />
      <div className="glow g2" />
      <div className="glow g3" />

      <main className="auth-wrap">
        <form className="auth-card" onSubmit={onSubmit}>
          <h1 className="auth-title">{mode === "login" ? "登入" : "建立帳號"}</h1>
          <p className="auth-subtitle">
            {mode === "login" ? "歡迎回來，請登入您的帳號" : "填寫以下資訊以建立帳號"}
          </p>

          <label className="auth-label">帳號</label>
          <input
            className="auth-input"
            placeholder="輸入帳號"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            maxLength={30}
            autoComplete="username"
          />

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
          <input
            className="auth-input"
            placeholder="輸入密碼"
            type={showPass ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            maxLength={50}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
          />

          {err && <div className="auth-error">{err}</div>}

          <button className="auth-btn primary" disabled={loading}>
            {loading ? "處理中…" : mode === "login" ? "登入" : "建立帳號"}
          </button>

          <button
            type="button"
            className="auth-btn ghost"
            onClick={() => { setErr(""); setMode(mode === "login" ? "register" : "login"); }}
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
