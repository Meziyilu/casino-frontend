// src/components/BaccaratReveal.jsx
import { useEffect, useState } from "react";

export default function BaccaratReveal({
  visible,
  winner,
  playerTotal = 0,
  bankerTotal = 0,
  playerDraw3 = false,
  bankerDraw3 = false,
  durationMs = 8000,
  timings = { p1b1: 600, p2b2: 1200, p3: 1800, b3: 2200, glow: 2600 },
  onFinish,
}) {
  const [phase, setPhase] = useState("idle");
  useEffect(() => {
    if (!visible) { setPhase("idle"); return; }
    setPhase("start");
    const t1 = setTimeout(() => setPhase("p1b1"), timings.p1b1);
    const t2 = setTimeout(() => setPhase("p2b2"), timings.p2b2);
    const t3 = setTimeout(() => setPhase(playerDraw3 ? "p3" : (bankerDraw3 ? "b3" : "glow")), timings.p3);
    const t4 = setTimeout(() => setPhase(bankerDraw3 ? "b3" : "glow"), timings.b3);
    const t5 = setTimeout(() => setPhase("glow"), timings.glow);
    const t6 = setTimeout(() => onFinish && onFinish(), durationMs);
    return () => [t1,t2,t3,t4,t5,t6].forEach(clearTimeout);
  }, [visible]);

  if (!visible) return null;

  const glowColor = winner === "player" ? "#2b6cb0" : winner === "banker" ? "#dc2626" : "#16a34a";
  return (
    <div style={{
      position: "sticky", top: 0, zIndex: 40, padding: "8px 0 12px",
      background: "linear-gradient(180deg, rgba(0,0,0,.45), rgba(0,0,0,.12) 65%, transparent)",
      backdropFilter: "blur(2px)"
    }}>
      <div style={{
        width: "min(980px, 96vw)", margin: "0 auto",
        borderRadius: 14, border: "1px solid #1a1a1d",
        background: "#0c0c0e", color: "#fff",
        padding: "12px 16px"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <div style={{ fontWeight: 800 }}>開獎中…</div>
          {phase === "glow" && <div style={{ color: "#ffd366" }}>
            結果：<b>{(winner || "").toUpperCase()}（{playerTotal}:{bankerTotal}）</b>
          </div>}
        </div>
        <div style={{
          width: "100%", height: 6, borderRadius: 999,
          background: "linear-gradient(90deg, rgba(255,255,255,.08), rgba(255,255,255,.22), rgba(255,255,255,.08))",
          boxShadow: phase === "glow" ? `0 0 26px 8px ${glowColor}` : "none",
          transition: "box-shadow .3s ease"
        }} />
      </div>
    </div>
  );
}
