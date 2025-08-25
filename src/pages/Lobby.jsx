import { useEffect, useState } from "react";
import { get } from "../api";
import { useNavigate } from "react-router-dom";

export default function Lobby() {
  const nav = useNavigate();
  const token = localStorage.getItem("token") || "";
  const [me, setMe] = useState(null);
  const [bal, setBal] = useState(null);

  useEffect(() => {
    (async () => {
      try { setMe(await get("/me", token)); } catch {}
      try { const b = await get("/balance", token); setBal(b.balance); } catch {}
    })();
  }, []);

  function logout() { localStorage.removeItem("token"); nav("/auth"); }

  return (
    <main style={{ padding: 24, fontFamily: "ui-sans-serif, system-ui" }}>
      <header style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom: 16 }}>
        <div><b>大廳</b>　玩家：{me?.username ?? "—"}　餘額：{bal ?? "—"}</div>
        <button onClick={logout} style={btn}>登出</button>
      </header>

      <section style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))", gap:16 }}>
        <div style={card}>
          <div style={{ fontSize:18, fontWeight:700, marginBottom:6 }}>百家樂</div>
          <div style={{ fontSize:13, opacity:0.8, marginBottom:10 }}>即時自動開局、倒數與開獎動畫</div>
          <button onClick={()=>nav("/game/baccarat")} style={btnPrimary}>進入</button>
        </div>
      </section>
    </main>
  );
}

const btn = { padding:"8px 12px", border:"1px solid #ddd", background:"transparent", borderRadius:10, cursor:"pointer" };
const btnPrimary = { padding:"10px 14px", background:"#111", color:"#fff", border:"none", borderRadius:10, cursor:"pointer" };
const card = { border:"1px solid #eee", borderRadius:12, padding:16, background:"#fff", boxShadow:"0 2px 8px rgba(0,0,0,.03)" };
