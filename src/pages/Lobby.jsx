import { useEffect, useState } from "react";
import { get } from "../api";
import { useNavigate } from "react-router-dom";

export default function Lobby() {
  const [me, setMe] = useState(null);
  const [balance, setBalance] = useState(null);
  const nav = useNavigate();
  const token = localStorage.getItem("token") || "";
  const API_BASE = (import.meta.env.VITE_API_BASE || "").replace(/\/$/, "");

  useEffect(() => {
    (async () => {
      const u = await get("/me", token);
      setMe(u);
      const b = await get("/balance", token);
      setBalance(b.balance);
    })().catch(() => {
      localStorage.removeItem("token");
      nav("/auth");
    });
  }, []);

  function logout() {
    localStorage.removeItem("token");
    nav("/auth");
  }

  return (
    <main style={page}>
      <header style={header}>
        <div>
          <h1 style={{ margin: 0 }}>遊戲大廳</h1>
          <div style={{ color: "#666", fontSize: 12 }}>API：{API_BASE || "(same origin)"}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 14, marginBottom: 4 }}>玩家：{me?.username}</div>
          <div style={{ fontSize: 14, marginBottom: 8 }}>餘額：{balance ?? "—"}</div>
          <button onClick={logout} style={btnOutline}>登出</button>
        </div>
      </header>

      <section style={grid}>
        <div style={gameCard} onClick={() => nav("/baccarat")}>
          <div style={badge}>熱門</div>
          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 6 }}>百家樂</div>
          <div style={{ color: "#666" }}>經典莊閒和投注，立即進桌</div>
        </div>

        {/* 之後可以加其他遊戲卡片 */}
      </section>
    </main>
  );
}

const page   = { padding: 24, fontFamily: "system-ui", maxWidth: 980, margin: "0 auto" };
const header = { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 };
const grid   = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px,1fr))", gap: 16 };
const gameCard = { cursor: "pointer", border: "1px solid #eee", borderRadius: 14, padding: 18, background: "#fff", position: "relative" };
const badge  = { position: "absolute", right: 12, top: 12, background: "#ff4d4f", color: "#fff", fontSize: 12, padding: "2px 8px", borderRadius: 999 };
const btnOutline = { padding: "8px 12px", background: "transparent", color: "#111", border: "1px solid #ccc", borderRadius: 10, cursor: "pointer" };
