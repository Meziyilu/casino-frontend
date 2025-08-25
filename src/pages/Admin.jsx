// src/pages/Admin.jsx
import { useEffect, useState } from "react";
import { get, post } from "../api";
import { useNavigate } from "react-router-dom";

export default function AdminPage() {
  const nav = useNavigate();
  const token = localStorage.getItem("token") || "";
  const [me, setMe] = useState(null);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  // 發幣表單
  const [grantUser, setGrantUser] = useState("");
  const [grantAmt, setGrantAmt] = useState(1000);

  // 局況
  const [current, setCurrent] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const u = await get("/me", token);
        setMe(u);
        if (!u?.is_admin) {
          alert("你不是管理員");
          nav("/");
          return;
        }
        await refreshRound();
      } catch (e) {
        alert("讀取身份失敗，請重新登入");
        localStorage.removeItem("token");
        nav("/auth");
      }
    })();
  }, []);

  async function refreshRound() {
    try { setCurrent(await get("/rounds/current", token)); } catch {}
  }

  async function doGrant() {
    setErr(""); setOk("");
    try {
      const res = await post("/admin/grant", { username: grantUser.trim(), amount: Number(grantAmt) }, token);
      setOk(`已發給 ${res.username}，新餘額：${res.balance}`);
    } catch (e) { setErr(e.message || "發幣失敗"); }
  }

  async function openRound(seconds = 60) {
    setErr(""); setOk("");
    try {
      const r = await post("/admin/open-round", { duration_sec: seconds }, token);
      setOk(`開第 ${r.round_no} 局，截止：${r.betting_deadline}`);
      await refreshRound();
    } catch (e) { setErr(e.message || "開局失敗"); }
  }

  async function closeRound() {
    setErr(""); setOk("");
    try {
      const r = await post("/admin/close-round", {}, token);
      setOk(`第 ${r.round_no} 局已關單（等待結算或自動結算）`);
      await refreshRound();
    } catch (e) { setErr(e.message || "關單失敗"); }
  }

  return (
    <main style={{ padding: 24, fontFamily: "ui-sans-serif, system-ui" }}>
      <header style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
        <div><b>管理面板</b>　管理員：{me?.username}</div>
        <button onClick={()=>nav("/")} style={btn}>← 回大廳</button>
      </header>

      {/* 發幣 */}
      <section style={card}>
        <h2 style={{ marginTop:0, fontSize:18 }}>發幣（加/減金幣）</h2>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr auto", gap:10 }}>
          <input placeholder="用戶名（username）" value={grantUser} onChange={e=>setGrantUser(e.target.value)} style={inpt}/>
          <input type="number" placeholder="金額（正負皆可）" value={grantAmt} onChange={e=>setGrantAmt(e.target.value)} style={inpt}/>
          <button onClick={doGrant} style={btnPrimary}>送出</button>
        </div>
      </section>

      {/* 桌況 / 控制 */}
      <section style={card}>
        <h2 style={{ marginTop:0, fontSize:18 }}>桌況 / 控制</h2>
        <div style={{ marginBottom:10 }}>
          目前狀態：<b>{current?.status ?? "—"}</b>　
          局號：<b>{current?.round_no ?? "—"}</b>　
          倒數：<b>{current?.remain_sec ?? 0}s</b>
          <button onClick={refreshRound} style={{ ...btn, marginLeft:8 }}>重新整理</button>
        </div>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          <button onClick={()=>openRound(60)} style={btnPrimary}>開新局（60s）</button>
          <button onClick={()=>openRound(30)} style={btnPrimary}>開新局（30s）</button>
          <button onClick={closeRound} style={btnOutline}>關單</button>
        </div>
        <div style={{ marginTop:10, fontSize:12, opacity:.75 }}>
          ⚠️ 你已啟用自動開局（AUTO_DEAL=1），這些按鈕僅用於測試或手動介入。
        </div>
      </section>

      {ok && <div style={{ color:"#16a34a", marginTop:8 }}>{ok}</div>}
      {err && <div style={{ color:"#dc2626", marginTop:8 }}>{err}</div>}
    </main>
  );
}

const card = { border:"1px solid #eee", borderRadius:12, padding:16, background:"#fff", marginBottom:16, boxShadow:"0 2px 10px rgba(0,0,0,.03)" };
const btn = { padding:"8px 12px", border:"1px solid #ddd", background:"transparent", borderRadius:10, cursor:"pointer" };
const btnPrimary = { padding:"10px 14px", background:"#111", color:"#fff", border:"none", borderRadius:10, cursor:"pointer" };
const btnOutline = { padding:"10px 14px", background:"transparent", color:"#111", border:"1px solid #ccc", borderRadius:10, cursor:"pointer" };
const inpt={ padding:10, border:"1px solid #ddd", borderRadius:10 };
