// src/pages/Admin.jsx
import { useEffect, useState } from "react";
import { api } from "../api";
import "../styles/ui.css";

export default function Admin() {
  const [adminToken, setAdminToken] = useState(localStorage.getItem("ADMIN_TOKEN") || "");
  const [uname, setUname] = useState("");
  const [amount, setAmount] = useState(1000);
  const [balance, setBalance] = useState(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    localStorage.setItem("ADMIN_TOKEN", adminToken || "");
  }, [adminToken]);

  const grant = async () => {
    try {
      setMsg("");
      await api.grant({ username: uname, amount: Number(amount), adminToken });
      setMsg("✔ 發幣成功");
    } catch (e) {
      setMsg(`✖ ${e.message}`);
    }
  };

  const cleanup = async (mode) => {
    try {
      setMsg("");
      await api.cleanup({ mode, adminToken });
      setMsg(`✔ 清理完成（${mode}）`);
    } catch (e) {
      setMsg(`✖ ${e.message}`);
    }
  };

  const query = async () => {
    try {
      setMsg("");
      const r = await api.queryBalance({ username: uname, adminToken });
      setBalance(r?.balance ?? null);
      setMsg("✔ 查詢成功");
    } catch (e) {
      setMsg(`✖ ${e.message}`);
    }
  };

  return (
    <div className="lobby-bg">
      <div className="glow g1" />
      <div className="glow g2" />
      <div className="lobby-shell">
        <div className="hero">
          <div className="hero-title">管理面板（最小）</div>
          <div className="hero-sub">需提供 X-ADMIN-TOKEN</div>

          <label className="auth-label">ADMIN TOKEN</label>
          <input
            className="auth-input"
            value={adminToken}
            onChange={(e) => setAdminToken(e.target.value)}
            placeholder="請輸入管理 token"
          />

          <div className="grid" style={{ marginTop: 12 }}>
            <div className="tile">
              <div className="tile-title">發幣給使用者</div>
              <label className="auth-label">Username</label>
              <input className="auth-input" value={uname} onChange={(e) => setUname(e.target.value)} />
              <label className="auth-label">Amount</label>
              <input className="auth-input" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
              <button className="auth-btn primary" style={{ marginTop: 10 }} onClick={grant}>發幣</button>
            </div>

            <div className="tile">
              <div className="tile-title">查詢餘額</div>
              <label className="auth-label">Username</label>
              <input className="auth-input" value={uname} onChange={(e) => setUname(e.target.value)} />
              <button className="auth-btn ghost" style={{ marginTop: 10 }} onClick={query}>查詢</button>
              <div className="auth-footer">餘額：{balance ?? "-"}</div>
            </div>

            <div className="tile">
              <div className="tile-title">清理資料</div>
              <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                <button className="auth-btn ghost" onClick={() => cleanup("today")}>刪除今天以前</button>
                <button className="auth-btn ghost" onClick={() => cleanup("all")}>刪除全部</button>
              </div>
            </div>
          </div>

          {msg && <div className="notice" style={{ marginTop: 12 }}>{msg}</div>}
        </div>
      </div>
    </div>
  );
}
