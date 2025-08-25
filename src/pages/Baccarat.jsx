// src/pages/Baccarat.jsx
import { useEffect, useState } from "react";
import { get, post, apiBase } from "../api";
import { useNavigate } from "react-router-dom";

const CHIPS = [10, 50, 100, 500, 1000];
const SIDES = [
  { key: "player", label: "閒", sub: "1:1", color: "#2b6cb0" },
  { key: "tie",    label: "和", sub: "1:1(暫)", color: "#16a34a" }, // 之後可改 8:1
  { key: "banker", label: "莊", sub: "1:1(暫)", color: "#dc2626" }, // 之後可改 0.95
];

export default function Baccarat() {
  const nav = useNavigate();
  const token = localStorage.getItem("token") || "";

  const [me, setMe] = useState(null);
  const [balance, setBalance] = useState(null);
  const [chip, setChip] = useState(100);
  const [selectSide, setSelectSide] = useState("player");
  const [betAmount, setBetAmount] = useState(0);
  const [history, setHistory] = useState([]);
  const [msg, setMsg] = useState("");
  const [hasOpenRound, setHasOpenRound] = useState(true);

  useEffect(() => {
    (async () => {
      // 只在 /me 401 時登出
      try {
        const u = await get("/me", token);
        setMe(u);
      } catch (e) {
        if (e.status === 401) {
          localStorage.removeItem("token");
          nav("/auth");
        } else {
          setMsg("載入使用者失敗：" + e.message);
        }
        return;
      }

      try {
        await refreshBalance();
      } catch (e) {
        setMsg("讀取餘額失敗：" + e.message);
      }
      try {
        await loadHistory();
      } catch (e) {
        setMsg("讀取歷史失敗：" + e.message);
      }
    })();
  }, []);

  async function refreshBalance() {
    const b = await get("/balance", token);
    setBalance(b.balance);
  }

  async function loadHistory() {
    const res = await get("/rounds/last10");
    setHistory(res.rows || []);
    const open = res.rows?.length && res.rows[0]?.outcome == null;
    setHasOpenRound(!!open);
  }

  function addChip(v) {
    setBetAmount((x) => Math.max(0, x + v));
  }
  function clearBet() {
    setBetAmount(0);
  }

  async function confirmBet() {
    setMsg("");
    if (!hasOpenRound) {
      setMsg("目前沒有開局，請稍後或由管理端開局");
      return;
    }
    if (betAmount <= 0) {
      setMsg("請選取籌碼與押注金額");
      return;
    }
    try {
      await post("/bet", { side: selectSide, amount: betAmount }, token);
      await refreshBalance();
      setMsg("下注成功！");
      setBetAmount(0);
    } catch (e) {
      if (e.status === 401) {
        localStorage.removeItem("token");
        nav("/auth");
        return;
      }
      setMsg("下注失敗：" + (e.message || e));
    } finally {
      try { await loadHistory(); } catch {}
    }
  }

  return (
    <main style={page}>
      <header style={header}>
        <button onClick={() => nav("/")} style={btnOutline}>← 回大廳</button>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 14 }}>玩家：{me?.username ?? "—"}</div>
          <div style={{ fontSize: 14 }}>餘額：{balance ?? "—"}</div>
          <div style={{ color: "#666", fontSize: 12, marginTop: 4 }}>API：{apiBase() || "(same origin)"}</div>
        </div>
      </header>

      {/* 押注面板 */}
      <section style={board}>
        <div style={sideGrid}>
          {SIDES.map((s) => (
            <button
              key={s.key}
              onClick={() => setSelectSide(s.key)}
              style={{
                ...sideBtn,
                borderColor: s.color,
                background: selectSide === s.key ? s.color : "#fff",
                color: selectSide === s.key ? "#fff" : s.color,
              }}
            >
              <div style={{ fontSize: 28, fontWeight: 800 }}>{s.label}</div>
              <div style={{ fontSize: 12, opacity: 0.85 }}>{s.sub}</div>
            </button>
          ))}
        </div>

        <div style={{ marginTop: 12, color: hasOpenRound ? "#16a34a" : "#dc2626" }}>
          {hasOpenRound ? "當前局可下注" : "目前沒有開局（請管理端 /admin/open-round 開局）"}
        </div>

        {/* 籌碼列 */}
        <div style={chipRow}>
          {CHIPS.map((c) => (
            <div
              key={c}
              onClick={() => addChip(c)}
              style={{ ...chipItem, boxShadow: chip === c ? "0 0 0 3px #111 inset" : "none" }}
              onMouseEnter={() => setChip(c)}
              title={`+${c}`}
            >
              {c >= 1000 ? `${c / 1000}K` : c}
            </div>
          ))}
          <button onClick={clearBet} style={btnGhost}>取消</button>
          <button onClick={confirmBet} style={btnPrimary}>確定下注（{betAmount}）</button>
        </div>

        {msg && <div style={{ marginTop: 8, color: /成功/.test(msg) ? "#16a34a" : "#dc2626" }}>{msg}</div>}
      </section>

      {/* 近十局 */}
      <section style={card}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ margin: 0, fontSize: 18 }}>近十局</h2>
          <button onClick={loadHistory} style={btnOutline}>重新整理</button>
        </div>
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
            {history.length === 0 && (
              <tr><td style={cell} colSpan={5}>尚無資料</td></tr>
            )}
          </tbody>
        </table>
      </section>
    </main>
  );
}

/* ====== styles ====== */
const page   = { padding: 20, fontFamily: "system-ui", maxWidth: 980, margin: "0 auto" };
const header = { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 };
const board  = { border: "1px solid #eee", borderRadius: 12, padding: 16, background: "#f7f7f7", marginBottom: 16 };
const sideGrid = { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 };
const sideBtn  = { border: "2px solid #ccc", borderRadius: 12, padding: "18px 8px", cursor: "pointer", background: "#fff" };
const chipRow  = { display: "flex", gap: 10, alignItems: "center", marginTop: 12, flexWrap: "wrap" };
const chipItem = { width: 56, height: 56, borderRadius: "50%", background: "#fff", border: "1px solid #ddd", display: "grid", placeItems: "center", cursor: "pointer", fontWeight: 700 };
const card   = { border: "1px solid #eee", borderRadius: 12, padding: 16, background: "#fff" };
const table  = { width: "100%", borderCollapse: "collapse", marginTop: 8 };
const cell   = { borderBottom: "1px solid #eee", padding: "8px 6px", textAlign: "left", fontSize: 14 };
const btnPrimary = { padding: "10px 14px", background: "#111", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer" };
const btnOutline = { padding: "8px 12px", background: "transparent", color: "#111", border: "1px solid #ccc", borderRadius: 10, cursor: "pointer" };
const btnGhost   = { padding: "10px 14px", background: "transparent", color: "#111", border: "1px solid #ddd", borderRadius: 10, cursor: "pointer" };
