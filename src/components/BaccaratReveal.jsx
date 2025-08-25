import { useEffect, useMemo, useRef, useState } from "react";

/**
 * 升級版開牌動畫（搭配 baccaratReveal.css）：
 * - 3D 翻牌 + 陰影
 * - 牌面清楚（角落 Rank + 花色、中央 Pip）
 * - 勝利方金光 + 粒子
 * - sticky 置頂顯示
 */
export default function BaccaratReveal({
  visible,
  winner,
  playerTotal = 0,
  bankerTotal = 0,
  playerDraw3 = false,
  bankerDraw3 = false,
  durationMs = 15000,
  bellSrc,
  timings = { p1b1: 900, p2b2: 1900, p3: 2800, b3: 3300, glow: 3800 },
  onFinish,
}) {
  const [phase, setPhase] = useState("idle");
  const audioRef = useRef(null);

  useEffect(() => {
    if (!visible) { setPhase("idle"); return; }
    setPhase("start");

    if (bellSrc) {
      const a = new Audio(bellSrc);
      audioRef.current = a;
      a.volume = 0.85;
      a.play().catch(()=>{});
    }

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
    <div className="brv__overlay">
      <div className="brv__panel">
        <div className="brv__titleRow">
          <div className="brv__title">{phase === "glow" ? "結果" : "開獎中…"}</div>
          <div className={`brv__shimmer ${phase==="glow" ? "run" : ""}`} />
        </div>

        <div className="brv__hands">
          <Hand label="PLAYER" color="#2b6cb0" total={playerTotal} show3={playerDraw3} phase={phase} side="player" />
          <Hand label="BANKER" color="#dc2626" total={bankerTotal} show3={bankerDraw3} phase={phase} side="banker" />
        </div>

        <div className="brv__result">
          {phase === "glow"
            ? <span>勝方：<b className="brv__winner">{(winner || "").toUpperCase()}</b></span>
            : "翻牌進行中…"}
        </div>

        {phase === "glow" && (
          <div className="brv__glowWrap">
            <div className="brv__glowBar" style={{ boxShadow: `0 0 26px 8px ${glowColor}` }} />
            <Sparkles color={glowColor} />
          </div>
        )}
      </div>
    </div>
  );
}

function Hand({ label, color, total, show3, phase, side }) {
  const [show, setShow] = useState({ c1:false, c2:false, c3:false });

  useEffect(() => {
    if (phase === "p1b1") setShow(s=> ({...s, c1:true}));
    if (phase === "p2b2") setShow(s=> ({...s, c2:true}));
    if (phase === "p3" && side === "player" && show3) setShow(s=> ({...s, c3:true}));
    if (phase === "b3" && side === "banker" && show3) setShow(s=> ({...s, c3:true}));
  }, [phase]);

  const cards = useMemo(() => {
    const seed = side === "player" ? 3 : 6;
    const ranks = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
    const suits = ["♠","♥","♦","♣"];
    const mk = (i) => ({
      rank: ranks[(seed + i*2) % ranks.length],
      suit: suits[(seed*7 + i*3) % suits.length],
    });
    return [mk(0), mk(1), mk(2)];
  }, [side]);

  return (
    <div className="brv__hand">
      <div className="brv__handTitle" style={{ color }}>{label}</div>
      <div className="brv__cards">
        <Card visible={show.c1} data={cards[0]} />
        <Card visible={show.c2} data={cards[1]} />
        <Card visible={show.c3} data={cards[2]} dim={!show3} />
      </div>
      <div className="brv__total">點數：<b>{total}</b></div>
    </div>
  );
}

function Card({ visible, dim, data }) {
  const { rank, suit } = data || {};
  const isRed = suit === "♥" || suit === "♦";

  return (
    <div className={`brv__card ${visible ? "show" : ""}`} style={{ opacity: dim ? .35 : 1 }}>
      <div className="brv__cardFace brv__back" />
      <div className="brv__cardFace brv__front">
        <div className="brv__corner" style={{ color: isRed ? "#d11" : "#111" }}>
          <div className="brv__rank">{rank}</div>
          <div className="brv__suit">{suit}</div>
        </div>
        <div className="brv__pip" style={{ color: isRed ? "#d11" : "#111" }}>{suit}</div>
        <div className="brv__corner brv__corner--br" style={{ color: isRed ? "#d11" : "#111" }}>
          <div className="brv__rank">{rank}</div>
          <div className="brv__suit">{suit}</div>
        </div>
      </div>
    </div>
  );
}

function Sparkles({ color="#f5c542", count=18 }) {
  const items = Array.from({ length: count }).map((_,i)=> i);
  return (
    <div className="brv__sparks">
      {items.map(i => (
        <span key={i} className="brv__spark" style={{
          background: color,
          animationDelay: `${(i%7)*0.12}s`,
          left: `${10 + (i*7)%80}%`
        }} />
      ))}
    </div>
  );
}
