// src/pages/Baccarat.jsx
import { useEffect, useState } from "react";
import { get, post } from "../api";
import { useNavigate } from "react-router-dom";
import BaccaratReveal from "../components/BaccaratReveal";

export default function Baccarat() {
  const nav = useNavigate();
  const token = localStorage.getItem("token") || "";

  const [balance, setBalance] = useState(0);
  const [bets, setBets] = useState({ player: 0, banker: 0, tie: 0 });
  const [remain, setRemain] = useState(0);
  const [history, setHistory] = useState([]);
  const [msg, setMsg] = useState("");
  const [soundOn] = useState(true);

  // 開牌動畫控制
  const [revealData, setRevealData] = useState({
    show: false,
    winner: null,
    pt: 0,
    bt: 0,
    p3: false,
    b3: false,
  });
  const revealMs = 15000; // 15 秒動畫

  async function refreshBalance() {
    try {
      const b = await get("/balance", token);
      setBalance(b.balance);
    } catch {}
  }

  async function loadHistory() {
    try {
      const h = await get("/rounds/history", token);
      setHistory(h);
    } catch {}
  }

  async function loadRemain() {
    try {
      const r = await get("/rounds/remain", token);
      setRemain(r.remain_sec);
    } catch {}
  }

  useEffect(() => {
    refreshBalance();
    loadHistory();
    loadRemain();
    const id = setInterval(() => loadRemain(), 5000);
    return () => clearInterval(id);
  }, []);

  async function bet(side, amt) {
    setMsg("");
    try {
      const r = await post("/bet", { side, amount: amt }, token);
      setBets(r.bets);
      refreshBalance();
      setMsg("下注成功");
    } catch (e) {
      setMsg(e.message || "下注失敗");
    }
  }

  return (
    <main style={page}>
      <header style={header}>
        <div>
          <b>百家樂</b>　餘額：{balance}
        </div>
        <button onClick={() => nav("/")} style={btn}>← 回大廳</button>
      </header>

      {/* ✅ 開獎動畫固定在下注面板上方 */}
      <BaccaratReveal
        visible={revealData.show}
        winner={revealData.winner}
        playerTotal={revealData.pt}
        bankerTotal={revealData.bt}
        playerDraw3={revealData.p3}
        bankerDraw3={revealData.b3}
        durationMs={revealMs}
        bellSrc={soundOn ? "/sounds/bell.mp3" : undefined}
        timings={{ p1b1: 800, p2b2: 1700, p3: 2600, b3: 3200, glow: 3700 }}
        onFinish={async () => {
          setRevealData({
            show: false,
            winner: null,
            pt: 0,
            bt: 0,
            p3: false,
            b3: false,
          });
          try { await loadHistory(); } catch {}
          try { await refreshBalance(); } catch {}
        }}
      />

      {/* 下注面板 */}
      <section style={board}>
        <div style={{ marginBottom: 8 }}>下注倒數：{remain}s</div>
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={() => bet("player", 100)} style={btnPrimary}>閒 +100</button>
          <button onClick={() => bet("banker", 100)} style={btnDanger}>莊 +100</button>
          <button onClick={() => bet("tie", 100)} style={btnOutline}>和 +100</button>
        </div>
        {msg && <div style={{ marginTop: 6 }}>{msg}</div>}
      </section>

      {/* 歷史區 */}
      <section style={card}>
        <h3>近十局</h3>
        <ul>
          {history.map((r, i) => (
            <li key={i}>
              {r.round_no}：{r.outcome}　P {r.player_total} / B {r.banker_total}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

/* ====== 樣式 ====== */
const page = { padding: 20, fontFamily: "ui-sans-serif, system-ui" };
const header = { display: "flex", justifyContent: "space-between", marginBottom: 16 };
const board = { border: "1px solid #ddd", borderRadius: 12, padding: 16, marginBottom: 16, background: "#fff" };
const card = { border: "1px solid #ddd", borderRadius: 12, padding: 16, background: "#fafafa" };

const btn = { padding: "8px 12px", border: "1px solid #ddd", background: "transparent", borderRadius: 10, cursor: "pointer" };
const btnPrimary = { padding: "10px 14px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer" };
const btnDanger = { padding: "10px 14px", background: "#dc2626", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer" };
const btnOutline = { padding: "10px 14px", border: "1px solid #999", background: "transparent", borderRadius: 10, cursor: "pointer" };
