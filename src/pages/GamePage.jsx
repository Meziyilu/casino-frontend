// src/pages/GamePage.jsx
import { useEffect, useState } from "react";
import { get } from "../api";

export default function GamePage() {
  const [me, setMe] = useState(null);
  const [balance, setBalance] = useState(null);
  const [grant, setGrant] = useState({ username: "", amount: 1000 });
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token") || "";
  const API_BASE = (import.meta.env.VITE_API_BASE || "").replace(/\/$/, "");

  useEffect(() => {
    (async () => {
      try {
        const u = await get("/me", token);      // 需要 Bearer token
        setMe(u);
        const b = await get("/balance", token); // 需要 Bearer token
        setBalance(b.balance);
      } catch (e) {
        // token 無效或逾期 → 回登入
        localStorage.removeItem("token");
        location.href = "/auth";
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function refreshBalance() {
    try {
      const b = await get("/balance", token);
      setBalance(b.balance);
    } catch (e) {
      alert("刷新餘額失敗：" + (e.message || e));
    }
  }

  function logout() {
    localStorage.removeItem("token");
    location.href = "/auth";
  }

  // 管理者加點（後端用 JWT + ADMIN_USERS 白名單判斷權限）
  async function doGrant() {
    if (!grant.username) return alert("請輸入要加點的 username");
    try {
      const res = await fetch(`${API_BASE}/admin/grant`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // 只靠登入者身分，不再用 X-Admin-Token
        },
        body: JSON.stringify({
          username: grant.username,
          amount: Number(grant.amount || 0),
        }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `HTTP ${res.status}`);
      }
      await refreshBalance();
      alert("已加點完成");
    } catch (e) {
      alert("加點失敗：" + (e.message || e));
    }
  }

  if (loading) {
    return (
      <main style={pageStyle}>
        <h1>載入中…</h1>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <header style={headerStyle}>
        <div>
          <h1 style={{ margin: 0 }}>遊戲大廳</h1>
          <div style={{ color: "#666", fontSize: 12 }}>API_BASE：{API_BASE || "(same origin)"}</div>
        </div>
        <div>
          <button onClick={logout} style={btnOutline}>登出</button>
        </div>
      </header>

      <section style={card}>
        <h2 style={h2}>玩家資訊</h2>
        <div style={grid2}>
          <div>
            <div style={label}>使用者</div>
            <div style={value}>{me?.username}</div>
          </div>
          <div>
            <div style={label}>餘額</div>
            <div style={value}>{balance ?? "—"}</div>
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <button onClick={refreshBalance} style={btnPrimary}>刷新餘額</button>
        </div>
      </section>

      <section style={card}>
        <h2 style={h2}>（測試用）管理者加點</h2>
        <p style={{ marginTop: -6, color: "#666" }}>
          只有在後端 <code>ADMIN_USERS</code> 白名單裡的帳號才能成功。
        </p>
        <div style={formGrid}>
          <div>
            <div style={label}>目標 username</div>
            <input
              style={input}
              value={grant.username}
              onChange={(e) => setGrant({ ...grant, username: e.target.value })}
              placeholder="例如：test01"
            />
          </div>
          <div>
            <div style={label}>加點數量（負數=扣點）</div>
            <input
              style={input}
              type="number"
              value={grant.amount}
              onChange={(e) =>
                setGrant({ ...grant, amount: Number(e.target.value || 0) })
              }
              placeholder="1000"
            />
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <button onClick={doGrant} style={btnPrimary}>送出加點</button>
        </div>
      </section>

      <section style={cardMuted}>
        <h2 style={h2}>下一步</h2>
        <ul style={{ marginTop: 6 }}>
          <li>新增下注 API（/bet）、歷史（/rounds/last10）</li>
          <li>在此頁加入下注表單與歷史表格</li>
          <li>將 CORS 白名單收斂成正式網域</li>
        </ul>
      </section>
    </main>
  );
}

/* ======= styles (簡易行內樣式) ======= */
const pageStyle = { padding: 24, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Noto Sans, Arial, sans-serif", maxWidth: 900, margin: "0 auto" };
const headerStyle = { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 };
const card = { border: "1px solid #eee", borderRadius: 12, padding: 16, marginBottom: 16, background: "#fff" };
const cardMuted = { ...card, background: "#fafafa" };
const h2 = { margin: "0 0 12px 0", fontSize: 18 };
const grid2 = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 };
const formGrid = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 };
const label = { fontSize: 12, color: "#666", marginBottom: 6 };
const value = { fontSize: 20, fontWeight: 600 };
const input = { width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd", outline: "none" };
const btnPrimary = { padding: "10px 14px", background: "#111", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer" };
const btnOutline = { padding: "8px 12px", background: "transparent", color: "#111", border: "1px solid #ccc", borderRadius: 10, cursor: "pointer" };
