import { useEffect, useState } from "react";
import { get, post } from "../api";

export default function GamePage() {
  const [me, setMe] = useState(null);
  const [balance, setBalance] = useState(null);
  const [grant, setGrant] = useState({ username: "", amount: 1000 });
  const token = localStorage.getItem("token");

  useEffect(() => {
    (async () => {
      const u = await get("/me", token);
      setMe(u);
      const b = await get("/balance", token);
      setBalance(b.balance);
    })().catch(() => {
      localStorage.removeItem("token");
      location.href = "/auth";
    });
  }, []);

  async function refreshBalance() {
    const b = await get("/balance", token);
    setBalance(b.balance);
  }

  async function logout() {
    localStorage.removeItem("token");
    location.href = "/auth";
  }

  // 管理者加點（測試用）
  async function doGrant() {
    const adminToken = prompt("輸入管理者 X-Admin-Token（只在你本機測試用）");
    if (!adminToken) return;
    await fetch(`${import.meta.env.VITE_API_BASE.replace(/\/$/, "")}/admin/grant`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Admin-Token": adminToken,
      },
      body: JSON.stringify(grant),
    }).then(async (r) => {
      if (!r.ok) throw new Error(await r.text());
      return r.json();
    });
    await refreshBalance();
    alert("已加點完成");
  }

  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>遊戲大廳</h1>
      <p>玩家：{me?.username}</p>
      <p>餘額：{balance ?? "讀取中..."}</p>
      <button onClick={refreshBalance}>重新整理餘額</button>
      <button onClick={logout} style={{ marginLeft: 8 }}>登出</button>

      <hr />
      <h3>（測試用）管理者加點</h3>
      <div style={{ display: "grid", gap: 8, maxWidth: 360 }}>
        <input
          placeholder="username"
          value={grant.username}
          onChange={(e) => setGrant({ ...grant, username: e.target.value })}
        />
        <input
          placeholder="amount（正加負扣）"
          type="number"
          value={grant.amount}
          onChange={(e) => setGrant({ ...grant, amount: parseInt(e.target.value || 0, 10) })}
        />
        <button onClick={doGrant}>加點</button>
      </div>

      <hr />
      <p>下一步：下注/歷史 會放在這裡</p>
    </main>
  );
}
