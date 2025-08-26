// src/pages/BaccaratRoom.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import BaccaratReveal from "../components/BaccaratReveal";
import "../styles/ui.css";

export default function BaccaratRoom() {
  const nav = useNavigate();
  const { roomId } = useParams(); // room1 | room2 | room3

  const [state, setState] = useState({
    round_no: 0,
    phase: "waiting",
    seconds_left: 0,
    outcome: null,
    player_total: 0,
    banker_total: 0,
  });
  const [betSide, setBetSide] = useState("player");
  const [amount, setAmount] = useState(10);
  const [err, setErr] = useState("");
  const [hist, setHist] = useState([]);
  const [reveal, setReveal] = useState({
    show: false,
    winner: null,
    pt: 0,
    bt: 0,
    p3: false,
    b3: false,
  });

  const prevPhase = useRef("waiting");

  async function loadState() {
    try {
      const s = await api.state(roomId);
      setState(s);
      // phase 從 betting → revealing 觸發開獎動畫
      if (prevPhase.current === "betting" && s.phase === "revealing") {
        const winner =
          s.outcome === "player" ? "player" : s.outcome === "banker" ? "banker" : "tie";
        setReveal({
          show: true,
          winner,
          pt: s.player_total || 0,
          bt: s.banker_total || 0,
          p3: false,
          b3: false,
        });
      }
      prevPhase.current = s.phase;
    } catch (e) {
      // 保持頁面不崩
    }
  }

  async function loadHistory() {
    try {
      const h = await api.history({ room: roomId, limit: 10 });
      setHist(h.items || []);
    } catch {}
  }

  useEffect(() => {
    if (!roomId) return;
    loadState();
    loadHistory();
    const t = setInterval(loadState, 1000);
    const t2 = setInterval(loadHistory, 6000);
    return () => {
      clearInterval(t);
      clearInterval(t2);
    };
  }, [roomId]);

  async function placeBet() {
    setErr("");
    try {
      await api.bet({ room: roomId, side: betSide, amount: Math.max(1, Number(amount) || 1) });
      await loadState();
      await loadHistory();
    } catch (e) {
      setErr(e?.message || "下注失敗");
    }
  }

  return (
    <div className="lobby-bg">
      <div className="lobby-shell">
        <div className="lobby-header">
          <div className="brand">
            <div className="logo">🂡</div>
            <div className="brand-name">Baccarat - {roomId?.toUpperCase()}</div>
          </div>
          <div className="userbar">
            <button className="auth-btn" onClick={() => nav("/lobby")}>回大廳</button>
            <button className="logout" onClick={() => nav("/admin")}>管理面板</button>
          </div>
        </div>

        {/* 開獎動畫固定在下注面板上方 */}
        <BaccaratReveal
          visible={reveal.show}
          winner={reveal.winner}
          playerTotal={reveal.pt}
          bankerTotal={reveal.bt}
          playerDraw3={reveal.p3}
          bankerDraw3={reveal.b3}
          durationMs={12000}
          timings={{ p1b1: 800, p2b2: 1600, p3: 2400, b3: 3200, glow: 3800 }}
          onFinish={() => setReveal({ show: false, winner: null, pt: 0, bt: 0, p3: false, b3: false })}
        />

        <section className="panel">
          <div className="panel-title">
            局號：{state.round_no}　狀態：
            {state.phase === "betting" ? "下注中" : state.phase === "revealing" ? "開獎中" : "等待中"}　
            倒數：{state.seconds_left || 0}s
          </div>

          <div className="grid">
            <div className="tile">
              <div className="tile-title">下注</div>
              <div className="tile-desc">選擇一個項目與金額，在倒數結束前下單。</div>
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <button
                  className={`auth-btn ${betSide === "player" ? "primary" : "ghost"}`}
                  onClick={() => setBetSide("player")}
                >
                  P (0.95)
                </button>
                <button
                  className={`auth-btn ${betSide === "banker" ? "primary" : "ghost"}`}
                  onClick={() => setBetSide("banker")}
                >
                  B (1:1)
                </button>
                <button
                  className={`auth-btn ${betSide === "tie" ? "primary" : "ghost"}`}
                  onClick={() => setBetSide("tie")}
                >
                  T (8:1)
                </button>
              </div>
              <div style={{ marginTop: 10 }}>
                <input
                  className="auth-input"
                  type="number"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="下注金額"
                />
              </div>
              {err && <div className="auth-error" style={{ marginTop: 10 }}>{err}</div>}
              <button
                className="auth-btn primary"
                style={{ marginTop: 10 }}
                disabled={state.phase !== "betting"}
                onClick={placeBet}
              >
                {state.phase === "betting" ? "立即下注" : "目前不能下注"}
              </button>
            </div>

            <div className="tile">
              <div className="tile-title">當前合計</div>
              <div className="tile-desc">玩家：{state.player_total || 0}</div>
              <div className="tile-desc">莊家：{state.banker_total || 0}</div>
            </div>

            <div className="tile">
              <div className="tile-title">近十局</div>
              {hist.length === 0 ? (
                <div className="tile-desc">暫無資料</div>
              ) : (
                <ol className="bullet">
                  {hist.map((h) => (
                    <li key={h.round_no}>
                      #{h.round_no}：{h.outcome?.toUpperCase()}（P{h.player_total} / B{h.banker_total}）
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
