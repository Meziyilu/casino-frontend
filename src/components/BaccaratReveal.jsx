import { useEffect, useMemo, useRef, useState } from "react";

export default function BaccaratReveal({
  visible,
  winner,
  playerTotal = 0,
  bankerTotal = 0,
  playerDraw3 = false,
  bankerDraw3 = false,
  durationMs = 15000,
  bellSrc,
  timings = { p1b1:800, p2b2:1800, p3:2800, b3:3200, glow:3800 },
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
      a.volume = 0.8;
      a.play().catch(()=>{});
    }
    const t1 = setTimeout(()=>setPhase("p1b1"), timings.p1b1);
    const t2 = setTimeout(()=>setPhase("p2b2"), timings.p2b2);
    const t3 = setTimeout(()=> playerDraw3 ? setPhase("p3") : bankerDraw3 ? setPhase("b3") : setPhase("glow"), timings.p3);
    const t4 = setTimeout(()=> bankerDraw3 ? setPhase("b3") : setPhase("glow"), timings.b3);
    const t5 = setTimeout(()=>setPhase("glow"), timings.glow);
    const t6 = setTimeout(()=> onFinish && onFinish(), durationMs);
    return ()=>[t1,t2,t3,t4,t5,t6].forEach(clearTimeout);
  }, [visible]);

  if (!visible) return null;

  const glowColor = winner==="player" ? "#2b6cb0" : winner==="banker" ? "#dc2626" : "#16a34a";

  return (
    <div style={overlay}>
      <div style={panel}>
        <div style={row}>
          <Hand title="PLAYER" total={playerTotal} show3={playerDraw3} phase={phase} side="player" />
          <Hand title="BANKER" total={bankerTotal} show3={bankerDraw3} phase={phase} side="banker" />
        </div>
        <div style={{ marginTop: 12, fontSize: 14, opacity: .9 }}>
          {phase==="glow" ? <span>結果：<b>{winner?.toUpperCase()}</b></span> : "開獎中…"}
        </div>
        {phase==="glow" && <div style={{ ...glow, boxShadow:`0 0 24px 6px ${glowColor}` }} />}
      </div>
    </div>
  );
}

function Hand({ title, total, show3, phase, side }) {
  const [show, setShow] = useState({ c1:false, c2:false, c3:false });
  useEffect(() => {
    if (phase==="p1b1" && side==="player") setShow(s=>({...s, c1:true}));
    if (phase==="p1b1" && side==="banker") setShow(s=>({...s, c1:true}));
    if (phase==="p2b2" && side==="player") setShow(s=>({...s, c2:true}));
    if (phase==="p2b2" && side==="banker") setShow(s=>({...s, c2:true}));
    if (phase==="p3" && side==="player" && show3) setShow(s=>({...s, c3:true}));
    if (phase==="b3" && side==="banker" && show3) setShow(s=>({...s, c3:true}));
  }, [phase]);

  const color = side==="player" ? "#2b6cb0" : side==="banker" ? "#dc2626" : "#16a34a";

  return (
    <div style={{ width: "45%", minWidth: 260 }}>
      <div style={{ fontWeight: 800, letterSpacing: 1, color, marginBottom: 6 }}>{title}</div>
      <div style={{ display:"flex", gap: 10 }}>
        <Card visible={show.c1} />
        <Card visible={show.c2} />
        <Card visible={show.c3} dim={!show3} />
      </div>
      <div style={{ marginTop: 8 }}>點數：<b>{total}</b></div>
    </div>
  );
}

function Card({ visible, dim }) {
  return (
    <div style={{
      width: 88, height: 120, borderRadius: 12, border: "1px solid #ddd",
      background: visible ? "#fff" : "linear-gradient(135deg,#111 0%,#333 100%)",
      transform: visible ? "rotateY(0)" : "rotateY(180deg)",
      transition: "transform .6s ease, background .6s ease, opacity .4s",
      transformStyle: "preserve-3d",
      opacity: dim ? .35 : 1,
      display: "grid", placeItems: "center", fontWeight: 800, fontSize: 18
    }}>
      {visible ? "🃏" : ""}
    </div>
  );
}

const overlay = {
  position:"fixed", inset:0, background:"rgba(0,0,0,.45)", display:"grid",
  placeItems:"center", zIndex: 50
};
const panel = {
  width:"min(940px, 96vw)", background:"#0b0b0c", color:"#fff", borderRadius:16, padding:24,
  border:"1px solid #1f1f22", boxShadow:"0 10px 40px rgba(0,0,0,.5)", textAlign:"center"
};
const row = { display:"flex", gap:24, justifyContent:"space-between", alignItems:"center", flexWrap:"wrap" };
const glow = { width: "100%", height: 4, borderRadius: 999, marginTop: 10 };
