import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api"; // ← 具名匯入

export default function AuthPage() {
  const nav = useNavigate();
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      if (mode === "login") {
        const r = await api.login({ username, password });
        sessionStorage.setItem("me", JSON.stringify(r.user));
        nav("/lobby");
      } else {
        const r = await api.register({ username, password, nickname: nickname || username });
        sessionStorage.setItem("me", JSON.stringify(r.user));
        nav("/lobby");
      }
    } catch (e) {
      setErr(e.message || "ERROR");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-bg">
      <div className="glow g1"></div><div className="glow g2"></div><div className="glow g3"></div>

      <div className="auth-wrap">
        <div className="auth-card">
          <div className="auth-brand">
            <div className="brand-logo">🎰</div>
            <div className="brand-name">TOPZ Casino</div>
          </div>
          <h2 className="auth-title">{mode === "login" ? "會員登入" : "註冊新帳號"}</h2>
          <p className="auth-subtitle">
            {mode === "login" ? "輸入帳密進入大廳" : "建立您的帳號以開始遊戲"}
          </p>

          <form onSubmit={submit}>
            <label className="auth-label">帳號</label>
            <div className="input-group">
              <span className="input-icon">👤</span>
              <input
                className="auth-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                required
              />
            </div>

            <label className="auth-label">密碼</label>
            <div className="input-group">
              <span className="input-icon">🔒</span>
              <input
                className="auth-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                minLength={6}
                required
              />
            </div>

            {mode === "register" && (
              <>
                <label className="auth-label">暱稱（可空白）</label>
                <div className="input-group">
                  <span className="input-icon">🏷️</span>
                  <input
                    className="auth-input"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="暱稱"
                  />
                </div>
              </>
            )}

            {err && <div className="auth-error">{err}</div>}

            <button className="auth-btn primary" type="submit" disabled={loading}>
              {loading ? "處理中…" : mode === "login" ? "登入" : "註冊並登入"}
            </button>

            <button
              className="auth-btn ghost"
              type="button"
              onClick={() => setMode(mode === "login" ? "register" : "login")}
            >
              {mode === "login" ? "沒有帳號？去註冊" : "已有帳號？去登入"}
            </button>
          </form>

          <div className="auth-footer">© 2025 TOPZ</div>
        </div>
      </div>
    </div>
  );
}
