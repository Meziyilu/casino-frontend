// src/pages/AdminPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import "../styles/ui.css";

export default function AdminPage() {
  const nav = useNavigate();
  const [adminToken, setAdminToken] = useState(localStorage.getItem("ADMIN_TOKEN") || "");
  const [u, setU] = useState("");
  const [amt, setAmt] = useState(100);
  const [log, setLog] = useState("");

  function saveToken() {
    localStorage.setItem("ADMIN_TOKEN", adminToken);
    setLog("Admin Token 已儲存於瀏覽器。");
  }

  async function grant() {
    setLog("");
    try {
      const r = await api.adminGrant({ username: u, amount: Number(amt) || 1, adminToken });
      setLog(JSON.stringify(r));
    } catch (e) {
      setLog(e?.message || "發幣失敗");
    }
  }

  async function cleanup(mode) {
    setLog("");
    try {
      const r = await api.adminCleanup({ mode, adminToken });
      setLog(JSON.stringify(r));
    } catch (e) {
      setLog(e?.message || "清理失敗");
    }
  }

  return (
    <div className="lobby-bg">
      <div className="lobby-shell">
        <div className="lobby-header">
          <div className="brand">
            <div className="logo">🛠️</div>
            <div className="brand-name">管理面板</div>
          </div>
          <div className="userbar">
            <button className="auth-btn" onClick={() => nav("/lobby")}>回大廳</button>
          </div>
        </div>

        <section className="panel">
          <div className="panel-title">Admin Token</div>
          <input
            className="auth-input"
            placeholder="X-ADMIN-TOKEN"
            value={adminToken}
            onChange={(e) => setAdminToken(e.target.value)}
          />
          <button className="auth-btn" style={{ marginTop: 8 }} onClick={saveToken}>儲存 Token</button>
        </section>

        <section className="panel">
          <div className="panel-title">發幣給使用者</div>
          <input className="auth-input" placeholder="username" value={u} onChange={(e) => setU(e.target.value)} />
          <input className="auth-input" type="number" min="1" placeholder="amount" value={amt} onChange={(e) => setAmt(e.target.value)} />
          <button className="auth-btn primary" style={{ marginTop: 8 }} onClick={grant}>發幣</button>
        </section>

        <section className="panel">
          <div className="panel-title">清理資料</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="auth-btn" onClick={() => cleanup("today_or_older")}>刪除「今天以前」歷史</button>
            <button className="auth-btn" onClick={() => cleanup("all")}>刪除全部</button>
          </div>
        </section>

        {log && (
          <section className="panel">
            <div className="panel-title">結果</div>
            <pre style={{ whiteSpace: "pre-wrap", color: "#a9f" }}>{log}</pre>
          </section>
        )}
      </div>
    </div>
  );
}
