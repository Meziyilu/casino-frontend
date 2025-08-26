// src/pages/AuthPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, authStore } from "../api";
import "../styles/ui.css";

export default function AuthPage() {
  const nav = useNavigate();
  const [mode, setMode] = useState("login"); // 'login' | 'register'
  const [username, setU] = useState("");
  const [password, setP] = useState("");
  const [nickname, setN] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      if (mode === "login") {
        await api.login({ username, password });
      } else {
        await api.register({ username, password, nickname: nickname || username });
      }
      // 驗證成功再取一次 /auth/me（可選）
      await api.me();
      nav("/lobby", { replace: true });
    } catch (e) {
      setErr(e?.message || "登入失敗");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-bg">
      <div className="glow g1" />
      <div className="glow g2" />
      <div className="glow g3" />

      <div className="auth-wrap">
        <div className="auth-card animate-pop">
          <div className="auth-brand">
            <div className="brand-logo">🎰</div>
            <div className="brand-name">TOPZ Casino</div>
          </div>

          <h2 className="auth-title">{mode === "login" ? "登入" : "建立帳號"}</h2>
          <p className="auth-subtitle">
            {mode === "login" ? "歡迎回來！請輸入你的帳號密碼。" : "只需幾秒鐘，就能開始遊戲！"}
          </p>

          <form onSubmit={onSubmit}>
            <label className="auth-label" htmlFor="u">帳號</label>
            <div className="input-group">
              <span className="input-icon">👤</span>
              <input
                id="u"
                className="auth-input"
                placeholder="username"
                value={username}
                onChange={(e) => setU(e.target.value)}
              />
            </div>

            <label className="auth-label" htmlFor="p">密碼</label>
            <div className="input-group">
              <span className="input-icon">🔒</span>
              <input
                id="p"
                type="password"
                className="auth-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setP(e.target.value)}
              />
            </div>

            {mode === "register" && (
              <>
                <label className="auth-label" htmlFor="n">暱稱（可留白）</label>
                <div className="input-group">
                  <span className="input-icon">✨</span>
                  <input
                    id="n"
                    className="auth-input"
                    placeholder="你的暱稱"
                    value={nickname}
                    onChange={(e) => setN(e.target.value)}
                  />
                </div>
              </>
            )}

            {err && <div className="auth-error animate-shake">{err}</div>}

            <button className="auth-btn primary" disabled={loading}>
              {loading ? "處理中…" : mode === "login" ? "登入" : "建立帳號"}
            </button>

            <button
              type="button"
              className="auth-btn ghost"
              onClick={() => {
                setErr("");
                setMode(mode === "login" ? "register" : "login");
              }}
            >
              {mode === "login" ? "沒有帳號？建立帳號" : "已有帳號？前往登入"}
            </button>
          </form>

          <div className="auth-footer">若遇到問題，請稍後再試或聯繫管理員。</div>
        </div>
      </div>
    </div>
  );
}
