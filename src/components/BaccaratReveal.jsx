import { useEffect, useMemo, useRef, useState } from "react";
import "./baccaratReveal.css";

export default function BaccaratReveal({
  visible,
  winner,
  playerTotal = 0,
  bankerTotal = 0,
  playerDraw3,
  bankerDraw3,
  durationMs = 15000,
  bellSrc,
  timings = { p1b1:800, p2b2:1800, p3:2800, b3:3200, glow:3800 },
  onFinish,
}) {
  const [flip, setFlip] = useState({ p1:false,p2:false,p3:false,b1:false,b2:false,b3:false,glow:false });
  const audioRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  const p3 = useMemo(() => playerDraw3 ?? (playerTotal <= 5), [playerDraw3, playerTotal]);
  const b3 = useMemo(() => bankerDraw3 ?? (bankerTotal <= 5), [bankerDraw3, bankerTotal]);

  const color = winner === "player" ? "#2b6cb0" : winner === "banker" ? "#dc2626" : "#16a34a";
  const label = winner === "player" ? "閒勝" : winner === "banker" ? "莊勝" : "和局";

  useEffect(() => {
    if (!visible) return;
    setMounted(true);
    setFlip({ p1:false,p2:false,p3:false,b1:false,b2:false,b3:false,glow:false });

    if (bellSrc) { audioRef.current = new Audio(bellSrc); audioRef.current.preload = "auto"; }

    const timers = [];
    timers.push(setTimeout(()=>setFlip(s=>({ ...s, p1:true, b1:true })), timings.p1b1));
    timers.push(setTimeout(()=>setFlip(s=>({ ...s, p2:true, b2:true })), timings.p2b2));
    if (p3) timers.push(setTimeout(()=>setFlip(s=>({ ...s, p3:true })), timings.p3));
    if (b3) timers.push(setTimeout(()=>setFlip(s=>({ ...s, b3:true })), timings.b3));
    timers.push(setTimeout(()=>{
      setFlip(s=>({ ...s, glow:true }));
      if (audioRef.current) { try { audioRef.current.currentTime = 0; audioRef.current.play(); } catch {} }
    }, timings.glow));
    timers.push(setTimeout(()=>{
      setMounted(false);
      onFinish?.();
    }, durationMs));

    return () => {
      timers.forEach(clearTimeout);
      try { audioRef.current && audioRef.current.pause(); } catch {}
    };
  }, [visible, p3, b3, durationMs, onFinish, bellSrc, timings]);

  if (!visible || !mounted) return null;

  return (
    <div className="br-overlay">
      <div className="br-modal">
        <SideBlock title="閒" total={playerTotal} cvar="#2b6cb0"
                   f1={flip.p1} f2={flip.p2} f3={flip.p3} show3={p3}
                   glow={flip.glow && winner === "player"} />
        <div className="br-vs">VS</div>
        <SideBlock title="莊" total={bankerTotal} cvar="#dc2626"
                   f1={flip.b1} f2={flip.b2} f3={flip.b3} show3={b3}
                   glow={flip.glow && winner === "banker"} />
      </div>

      <div className="br-win" style={{ borderColor: color, color }}>
        {flip.p2 ? label : "開獎中…"}
      </div>

      {flip.glow && winner === "tie" && <div className="br-tie-ring" />}
    </div>
  );
}

function SideBlock({ title, total, cvar, f1, f2, f3, show3, glow }) {
  return (
    <div className="br-side">
      <div className="br-side-title" style={{ color: cvar }}>{title}</div>
      <div className="br-cards">
        <FlipCard flipped={f1} color={cvar} />
        <FlipCard flipped={f2} color={cvar} delayMs={150} />
        {show3 && <FlipCard flipped={f3} color={cvar} delayMs={300} small />}
        <div className="br-total" style={{ color: cvar }}>{f2 ? total : "?"}</div>
      </div>
      {glow && <div className="br-glow" style={{ borderColor: cvar }} />}
    </div>
  );
}

function FlipCard({ flipped, color, delayMs=0, small=false }) {
  return (
    <div className="br-card-wrap">
      <div className={`br-card ${flipped ? "is-flipped" : ""} ${small ? "is-small" : ""}`}
           style={{ transitionDelay: `${delayMs}ms` }}>
        <div className="br-card-face br-back"
             style={{ backgroundImage: `repeating-linear-gradient(45deg, ${color}11, ${color}11 6px, #ffffff 6px, #ffffff 12px)` }} />
        <div className="br-card-face br-front" style={{ borderColor: color, color }}>
          ★
          <div className="br-shine" />
        </div>
      </div>
    </div>
  );
}
