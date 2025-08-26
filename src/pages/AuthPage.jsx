// src/pages/AuthPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, authStore } from "../api";
import "../styles/ui.css";

export default function AuthPage() {
  const nav = useNavigate();
  const [mode, setMode] = useState("login"); // 'login' | 'register'
  const [username, setUsername] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setPending(true);
    try {
      if (mode === "login") {
        const r = await api.login(username.trim(), password);
        authStore.set(r.token);
      } else {
        const r = await api.register(
          username.trim(),
          password,
          nickname.trim() || username.trim()
        );
        authStore.set(r.token);
      }
      nav("/"); // 進入大廳
    } catch (e) {
      setErr(String(e.message || e));
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="auth-bg">
      {/* 背景光暈 */}
      <div className="glow g1" />
      <div className="glow g2" />
      <div className="glow g3" />

      <div className="auth-wrap">
        <div className="auth-card animate-pop">
          <div className="auth-brand">
            <div className="brand-logo">🎰</div>
            <div className="brand-name">TOPZ Casino</div>
          </div>

          <h2 className="auth-title">
            {mode === "login" ? "登入帳號" : "建立新帳號"}
          </h2>
          <p className="auth-subtitle">
            {mode === "login"
              ? "輸入您的帳號密碼以登入"
              : "註冊後立即進入大廳開始遊戲"}
          </p>

          <form onSubmit={submit} noValidate>
            <label className="auth-label">帳號</label>
            <div className="input-group">
              <span className="input-icon">👤</span>
              <input
                className="auth-input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="例如 topz0705"
                required
              />
            </div>

            {mode === "register" && (
              <>
                <label className="auth-label">暱稱（可留空）</label>
                <div className="input-group">
                  <span className="input-icon">🏷️</span>
                  <input
                    className="auth-input"
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="顯示名稱"
                  />
                </div>
              </>
            )}

            <label className="auth-label">密碼</label>
            <div className="input-group">
              <span className="input-icon">🔒</span>
              <input
                className="auth-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="至少 6 碼"
                required
              />
            </div>

            {err && <div className="auth-error animate-shake">{err}</div>}

            <button className="auth-btn primary" disabled={pending}>
              {pending ? "處理中…" : mode === "login" ? "登入" : "註冊"}
            </button>

            <div className="auth-footer">
              {mode === "login" ? (
                <>
                  沒有帳號？{" "}
                  <button
                    type="button"
                    className="link-btn"
                    onClick={() => setMode("register")}
                  >
                    建立帳號
                  </button>
                </>
              ) : (
                <>
                  已有帳號？{" "}
                  <button
                    type="button"
                    className="link-btn"
                    onClick={() => setMode("login")}
                  >
                    立即登入
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
