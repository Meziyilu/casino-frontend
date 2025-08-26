// src/pages/BaccaratRooms.jsx
import { useNavigate } from "react-router-dom";

export default function BaccaratRooms() {
  const nav = useNavigate();
  const rooms = [
    { id: "1", name: "百家樂房間 1", desc: "一般桌，60s 下注" },
    { id: "2", name: "百家樂房間 2", desc: "加速桌，30s 下注" },
    { id: "3", name: "百家樂房間 3", desc: "慢速桌，90s 下注" },
  ];

  return (
    <main style={page}>
      <header style={header}>
        <button onClick={() => nav("/")} style={btnOutline}>← 回大廳</button>
        <h1 style={{margin:0}}>百家樂房間選擇</h1>
        <div />
      </header>

      <section style={grid}>
        {rooms.map(r => (
          <button
            key={r.id}
            onClick={() => nav(`/game/baccarat/room/${r.id}`)}
            style={card}
          >
            <div style={{fontWeight:800, fontSize:18}}>{r.name}</div>
            <div style={{opacity:.8, marginTop:6}}>{r.desc}</div>
          </button>
        ))}
      </section>
    </main>
  );
}

const page   = { padding: 20, fontFamily: "ui-sans-serif, system-ui", background:"#f6f7fb", minHeight:"100vh" };
const header = { display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom: 16 };
const btnOutline = { padding: "8px 12px", background:"transparent", color:"#111", border:"1px solid #ccc", borderRadius:10, cursor:"pointer" };
const grid = { display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(240px, 1fr))", gap:12 };
const card = { textAlign:"left", background:"#fff", border:"1px solid #eee", borderRadius:12, padding:16, cursor:"pointer", boxShadow:"0 2px 10px rgba(0,0,0,.03)" };
