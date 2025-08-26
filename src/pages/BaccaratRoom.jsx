// src/pages/BaccaratRoom.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import BaccaratReveal from "../components/BaccaratReveal";
import "../styles/ui.css";

const SIDES = [
  { key: "player", label: "閒", color: "#2b6cb0" },
  { key: "banker", label: "莊", color: "#dc2626" },
  { key: "tie",    label: "和", color: "#16a34a" },
];

export default function BaccaratRoom() {
  const nav = useNavigate();
  const { roomId } = useParams();
  const [me, setMe] = useState(null);
  const [state, setState] = useState(null);
  const [betSide, setBetSide] = useState("player");
  const [amount, setAmount] = useState(100);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [hist, setHist] = useState([]);

  // 揭示動畫資料
  const [reveal, setReveal] = useState({
    show: false, winner: null, pt: 0, bt: 0, p3: false, b3: false,
  });

  // 拉狀態 + 歷史
  useEffect(() => {
    let t;
    const loop = async () => {
      try {
        setErr("");
        const [meRes, stateRes, histRes] = await Promise.all([
          api.me(),
          api.getState(roomId),
          api.history(roomId, 10),
        ]);
        setMe(meRes);
        setState(stateRes);
        setHist(histRes?.rows || []);

        // 當後端 phase 進入 reveal，就觸發動畫
        if (stateRes?.phase === "reveal" && stateRes?.result) {
          const r = stateRes.result; // { winner, player_total, banker_total, player_draw3, banker_draw3 }
          setReveal({
            show: true,
            winner: r.winner,
            pt: r.player_total,
            bt: r.banker_total,
            p3: !!r.player_draw3,
            b3: !!r.banker_draw3,
          });
        } else {
          setReveal((s) => ({ ...s, show: false }));
        }
      } catch (e) {
        setErr(e.message || "load error");
      }
      t = setTimeout(loop, 1000);
    };
    loop();
    return () => clearTimeout(t);
  }, [roomId]);

  const pools = state?.pools || { player: 0, banker: 0, tie: 0 };
  const seconds = state?.seconds_left ?? "-";
  const roundNo = state?.round_no ?? "-";
  const phase = state?.phase || "-";

  const placeBet = async () => {
    try {
      setBusy(true);
      setErr("");
      await api.bet({ room: roomId, side: betSide, amount: Number(amount) });
      // 下單成功後，立刻刷新餘額與房態
      const [meRes, stateRes] = await Promise.all([api.me(), api.getState(roomId)]);
      setMe(meRes);
      setState(stateRes);
    } catch (e) {
      setErr(e.message || "bet failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="lobby-bg">
      <div className="glow g1" />
      <div className="glow g2" />
      <div className="lobby-shell">
        {/* Header */}
        <div className="lobby-header">
          <div className="brand" style={{ cursor: "pointer" }} onClick={() => nav("/")}>
            <div className="logo">🎰</div>
            <div className="brand-name">TOPZ Casino</div>
          </div>
          <div className="userbar">
            <div className="chips">
              <span className="chip"><span className="chip-label">房間</span><span className="chip-value">{roomId.toUpperCase()}</span></span>
              <span className="chip"><span className="chip-label">局號</span><span className="chip-value">{roundNo}</span></span>
              <span className="chip"><span className="chip-label">倒數</span><span className="chip-value">{seconds}s</span></span>
              <span className="chip"><span className="chip-label">餘額</span><span className="chip-value">{me?.balance ?? "-"}</span></span>
            </div>
          </div>
        </div>

        {err && <div className="notice error">{err}</div>}

        {/* ✅ 翻牌動畫固定在下注面板上方 */}
        <BaccaratReveal
          visible={reveal.show}
          winner={reveal.winner}
          playerTotal={reveal.pt}
          bankerTotal={reveal.bt}
          playerDraw3={reveal.p3}
          bankerDraw3={reveal.b3}
          durationMs={8000}
          timings={{ p1b1: 600, p2b2: 1200, p3: 1800, b3: 2200, glow: 2600 }}
          onFinish={() => setReveal((s) => ({ ...s, show: false }))}
        />

        {/* 主板 */}
        <section className="hero">
          <div className="hero-title">下注面板</div>
          <div className="hero-sub">當前階段：{phase}</div>

          <div className="grid" style={{ alignItems: "stretch" }}>
            {/* 下注卡 */}
            <div className="tile" style={{ minHeight: 220 }}>
              <div className="tile-title">選擇下注</div>
              <div className="tile-desc">選邊 + 金額</div>

              <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                {SIDES.map((s) => (
                  <button
                    key={s.key}
                    className="auth-btn ghost"
                    style={{
                      border: betSide === s.key ? `2px solid ${s.color}` : "1px solid var(--outline)",
                      fontWeight: 800,
                    }}
                    onClick={() => setBetSide(s.key)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              <label className="auth-label" style={{ marginTop: 12 }}>金額</label>
              <input
                type="number"
                className="auth-input"
                min={1}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="輸入下注金額"
              />
              <button
                disabled={busy || phase !== "betting"}
                onClick={placeBet}
                className="auth-btn primary"
                style={{ marginTop: 12 }}
              >
                {busy ? "送出中..." : "下注"}
              </button>
              <div className="auth-footer" style={{ textAlign: "left" }}>
                小提醒：只有在「betting」階段可下注；結算將依莊 0.95 與和 8:1 派彩。
              </div>
            </div>

            {/* 池子卡 */}
            <div className="tile" style={{ minHeight: 220 }}>
              <div className="tile-title">當前池子</div>
              <div className="hero-row" style={{ marginTop: 10 }}>
                <div className="stat"><div className="stat-val">{pools.player || 0}</div><div className="stat-lab">閒</div></div>
                <div className="stat"><div className="stat-val">{pools.banker || 0}</div><div className="stat-lab">莊</div></div>
                <div className="stat"><div className="stat-val">{pools.tie || 0}</div><div className="stat-lab">和</div></div>
              </div>
              <div className="auth-footer">下注人數：{state?.bettors || 0}</div>
            </div>
          </div>
        </section>

        {/* 近十局 + 路紙簡易 */}
        <section className="panel">
          <div className="panel-title">近十局</div>
          {hist.length === 0 ? (
            <div className="lobby-loading">尚無歷史</div>
          ) : (
            <div className="hero-row">
              {hist.map((h) => (
                <div key={h.round_no} className="stat">
                  <div className="stat-val">#{h.round_no}</div>
                  <div className="stat-lab">結果：{(h.outcome || "").toUpperCase()}</div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
