// src/pages/Baccarat.jsx
import { useEffect, useState } from "react";
import { get, post, apiBase } from "../api";
import { useNavigate } from "react-router-dom";
import BaccaratReveal from "../components/BaccaratReveal";

const CHIPS = [10, 50, 100, 500, 1000];
const SIDES = [
  { key: "player", label: "閒", sub: "1:1", color: "#2b6cb0" },
  { key: "tie",    label: "和", sub: "8:1", color: "#16a34a" },
  { key: "banker", label: "莊", sub: "0.95:1", color: "#dc2626" },
];
const EXTRA = [
  { key:"player_pair",  label:"閒對",   odds:"11:1" },
  { key:"banker_pair",  label:"莊對",   odds:"11:1" },
  { key:"any_pair",     label:"任意對", odds:"5:1"  },
  { key:"perfect_pair", label:"完美對", odds:"25:1" },
];

export default function Baccarat() {
  const nav = useNavigate();
  const token = localStorage.getItem("token") || "";

  const [me, setMe] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [balance, setBalance] = useState(null);

  const [chip, setChip] = useState(100);
  const [selectSide, setSelectSide] = useState("player");
  const [extraSide, setExtraSide] = useState(null);
  const [betAmount, setBetAmount] = useState(0);

  const [history, setHistory] = useState([]);
  const [current, setCurrent] = useState({ status: "idle", round_no: null, remain_sec: 0 });
  const [remain, setRemain] = useState(0);
  const [msg, setMsg] = useState("");

  // 動畫設定
  const defaultTiming = { p1b1:800, p2b2:1800, p3:2800, b3:3200, glow:3800 };
  const [revealMs, setRevealMs] = useState(() => Number(localStorage.getItem("revealMs") || 15000));
  const [timing, setTiming] = useState(() => {
    try { return JSON.parse(localStorage.getItem("revealTiming") || "null") || defaultTiming; }
    catch { return defaultTiming; }
  });
  const [soundOn, setSoundOn] = useState(() => localStorage.getItem("revealSoundOn") !== "0");

  const [revealData, setRevealData] = useState({ show:false, winner:null, pt:0, bt:0, p3:false, b3:false });

  // 初始化 /me
  useEffect(() => {
    (async () => {
      try {
        const u = await get("/me", token);
        setMe(u); setIsAdmin(!!u.is_admin);
      } catch (e) {
        if (e.status === 401) { localStorage.removeItem("token"); nav("/auth"); }
        else { setMsg("載入使用者失敗：" + (e.message || e)); }
        return;
      }
      try { await refreshBalance(); } catch (e) { setMsg("讀取餘額失敗：" + (e.message || e)); }
      try { await loadHistory(); }   catch (e) { setMsg("讀取歷史失敗：" + (e.message || e)); }
    })();
  }, []);

  // 每秒輪詢桌況，偵測 open→closed 觸發開獎
  useEffect(() => {
    let last = { round_no: null, status: null };
    const t = setInterval(async () => {
      try {
        const c = await get("/rounds/current");
        setCurrent(c);
        setRemain(c.remain_sec ?? 0);

        const justClosed = last.status === "open" && c.status === "closed";
        const roundChanged = last.round_no !== null && c.round_no !== last.round_no;

        if (justClosed || roundChanged || (c.status === "closed" && last.status !== "closed")) {
          const hist = await get("/rounds/last10");
          const top = hist.rows?.[0];
          if (top && top.outcome) {
            setRevealData({
              show: true,
              winner: top.outcome,
              pt: top.player_total ?? 0,
              bt: top.banker_total ?? 0,
              p3: !!top.player_draw3,
              b3: !!top.banker_draw3,
            });
          }
        }
        last = { round_no: c.round_no, status: c.status };
      } catch (e) {
        // 靜默（偶發輪詢失敗）
      }
    }, 1000);
    return () => clearInterval(t);
  }, []);

  async function refreshBalance() {
    const b = await get("/balance", token);
    setBalance(b.balance);
  }
  async function loadHistory() {
    const res = await get("/rounds/last10");
    setHistory(res.rows || []);
  }

  function addChip(v) { setBetAmount((x) => Math.max(0, x + v)); }
  function clearBet() { setBetAmount(0); setExtraSide(null); }

  async function confirmBet() {
    setMsg("");
    if (current.status !== "open" || (remain ?? 0) <= 0) { setMsg("本局已鎖單或尚未開局"); return; }
    if (betAmount <= 0) { setMsg("請選取籌碼與押注金額"); return; }
    const targetSide = extraSide || selectSide;
    try {
      await post("/bet", { side: targetSide, amount: betAmount }, token);
      await refreshBalance();
      setMsg("下注成功！"); setBetAmount(0); setExtraSide(null);
    } catch (e) {
      if (e.status === 401) { localStorage.removeItem("token"); nav("/auth"); return; }
      setMsg("下注失敗：" + (e.message || e));
    } finally {
      try { await loadHistory(); } catch {}
    }
  }

  function logout() { localStorage.removeItem("token"); nav("/auth"); }

  return (
    <main style={page}>
      <header style={header}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <button onClick={() => nav("/")} style={btnOutline}>← 回大廳</button>
          <h1 style={{ margin:0, fontSize:20 }}>百家樂</h1>
        </div>
        <div style={{ textAlign:"right" }}>
          <div style={{ fontSize: 14 }}>玩家：{me?.username ?? "—"} {isAdmin && <span style={tag}>ADMIN</span>}</div>
          <div style={{ fontSize: 14 }}>餘額：{balance ?? "—"}</div>
          <button onClick={logout} style={{ ...btnOutline, marginTop: 8 }}>登出</button>
        </div>
      </header>

      {/* 桌況 / 倒數 */}
      <section style={board}>
        <div style={boardTop}>
          <div>局號：<b>{current.round_no ?? "-"}</b></div>
          <div>狀態：<b>{current.status}</b></div>
          {current.status === "open" && <div>倒數：<b>{remain}s</b></div>}
        </div>

        {/* 主注 */}
        <div style={sideGrid}>
          {SIDES.map((s) => (
            <button key={s.key}
              onClick={() => setSelectSide(s.key)}
              style={{
                ...sideBtn, borderColor:s.color,
                background: selectSide === s.key ? s.color : "#fff",
                color: selectSide === s.key ? "#fff" : s.color,
              }}>
              <div style={{ fontSize: 28, fontWeight: 800 }}>{s.label}</div>
              <div style={{ fontSize: 12, opacity: 0.85 }}>{s.sub}</div>
            </button>
          ))}
        </div>

        {/* 副注 */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap: 8, marginTop: 10 }}>
          {EXTRA.map(x => (
            <button key={x.key}
              onClick={() => setExtraSide(extraSide === x.key ? null : x.key)}
              style={{
                ...sideBtn, padding:"12px 6px",
                background: extraSide===x.key ? "#111" : "#fff",
                color: extraSide===x.key ? "#fff" : "#111",
                borderColor: "#bbb"
              }}>
              <div style={{ fontSize:16, fontWeight:700 }}>{x.label}</div>
              <div style={{ fontSize:12, opacity:0.85 }}>{x.odds}</div>
            </button>
          ))}
        </div>

        {/* 籌碼列 */}
        <div style={chipRow}>
          {CHIPS.map((c) => (
            <div key={c} onClick={() => addChip(c)} onMouseEnter={() => setChip(c)}
                 style={{ ...chipItem, boxShadow: chip === c ? "0 0 0 3px #111 inset" : "none" }}
                 title={`+${c}`}>
              {c >= 1000 ? `${c/1000}K` : c}
            </div>
          ))}
          <div style={{ marginLeft: "auto", fontWeight: 700 }}>下注金額：{betAmount}</div>
          <button onClick={clearBet} style={btnGhost}>取消</button>
          <button onClick={confirmBet} style={btnPrimary}>確定下注</button>
        </div>

        {msg && <div style={{ marginTop: 8, color: /成功/.test(msg) ? "#16a34a" : "#dc2626" }}>{msg}</div>}
      </section>

      {/* 路紙 + 近十局 */}
      <section style={card}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <h2 style={{ margin: 0, fontSize: 18 }}>近十局</h2>
          <button onClick={loadHistory} style={btnOutline}>重新整理</button>
        </div>
        <Roadmap rows={history} />
        <table style={table}>
          <thead>
            <tr>
              <th style={cell}>局號</th>
              <th style={cell}>時間</th>
              <th style={cell}>閒</th>
              <th style={cell}>莊</th>
              <th style={cell}>結果</th>
            </tr>
          </thead>
          <tbody>
            {history.map((r) => (
              <tr key={r.round_no}>
                <td style={cell}>{r.round_no}</td>
                <td style={cell}>{r.opened_at?.replace("T", " ").slice(0, 19) || ""}</td>
                <td style={cell}>{r.player_total ?? "-"}</td>
                <td style={cell}>{r.banker_total ?? "-"}</td>
                <td style={cell}>{r.outcome ?? "進行中"}</td>
              </tr>
            ))}
            {history.length === 0 && <tr><td style={cell} colSpan={5}>尚無資料</td></tr>}
          </tbody>
        </table>
      </section>

      {/* 開獎動畫（疊在下注面板上方） */}
      <BaccaratReveal
        visible={revealData.show}
        winner={revealData.winner}
        playerTotal={revealData.pt}
        bankerTotal={revealData.bt}
        playerDraw3={revealData.p3}
        bankerDraw3={revealData.b3}
        durationMs={revealMs}
        bellSrc={soundOn ? "/sounds/bell.mp3" : undefined}
        timings={timing}
        onFinish={async () => {
          setRevealData({ show:false, winner:null, pt:0, bt:0, p3:false, b3:false });
          try { await loadHistory(); } catch {}
          try { await refreshBalance(); } catch {}
        }}
      />
    </main>
  );
}

/* ===== 路紙 ===== */
function Roadmap({ rows }) {
  const seq = rows.slice().reverse().map(r => r.outcome).filter(Boolean);
  const grid = Array.from({ length: 6 }, () => Array(12).fill(null));
  let col=0, row=0, prev=seq[0];
  for (let i=0;i<seq.length;i++){
    const cur=seq[i];
    if (i===0){ grid[row][col]=cur; continue; }
    if (cur===prev && row<5){ row++; }
    else { prev=cur; col++; row=0; if (col>11) break; }
    grid[row][col]=cur;
  }
  const color = (o)=> o==="player"?"#2b6cb0":o==="banker"?"#dc2626":"#16a34a";
  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(12,14px)", gap:2, padding:8, background:"#fafafa", borderRadius:8, margin:"8px 0" }}>
      {grid.map((r,ri)=> r.map((cell,ci)=>(
        <div key={ri+"-"+ci} style={{ width:14, height:14, border:"1px solid #eee", borderRadius:"50%", background: cell?color(cell):"transparent" }} />
      )))}
    </div>
  );
}

/* ===== styles ===== */
const page   = { padding: 20, fontFamily: "ui-sans-serif, system-ui", background:"#f6f7fb", minHeight:"100vh" };
const header = { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 };
const board  = { border: "1px solid #eee", borderRadius: 12, padding: 16, background: "#fff", marginBottom: 16, boxShadow:"0 2px 10px rgba(0,0,0,0.03)" };
const boardTop = { display:"flex", gap:16, alignItems:"center", marginBottom: 10 };
const sideGrid = { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 };
const sideBtn  = { border: "2px solid #ccc", borderRadius: 12, padding: "18px 8px", cursor: "pointer", background: "#fff" };
const chipRow  = { display: "flex", gap: 10, alignItems: "center", marginTop: 12, flexWrap: "wrap" };
const chipItem = { width: 56, height: 56, borderRadius: "50%", background: "#fff", border: "1px solid #ddd", display: "grid", placeItems: "center", cursor: "pointer", fontWeight: 700 };
const card   = { border: "1px solid #eee", borderRadius: 12, padding: 16, background: "#fff", marginBottom: 16, boxShadow:"0 2px 10px rgba(0,0,0,0.03)" };
const table  = { width: "100%", borderCollapse: "collapse", marginTop: 8 };
const cell   = { borderBottom: "1px solid #eee", padding: "8px 6px", textAlign: "left", fontSize: 14 };
const btnPrimary = { padding: "10px 14px", background: "#111", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer" };
const btnOutline = { padding: "8px 12px", background: "transparent", color: "#111", border: "1px solid #ccc", borderRadius: 10, cursor: "pointer" };
const btnGhost   = { padding: "10px 14px", background: "transparent", color: "#111", border: "1px solid #ddd", borderRadius: 10, cursor: "pointer" };
const tag = { marginLeft: 6, fontSize: 10, background:"#111", color:"#fff", borderRadius: 6, padding:"2px 6px" };
