// src/components/BaccaratReveal.jsx
import { useEffect, useRef } from "react";
import "./baccaratReveal.css";

export default function BaccaratReveal({ show, winner, pc, bc, pt, bt, onEnd, ms=7000 }) {
  const t = useRef();
  useEffect(()=>{ 
    if(!show) return; 
    clearTimeout(t.current); 
    t.current = setTimeout(()=> onEnd && onEnd(), ms); 
    return ()=> clearTimeout(t.current);
  }, [show]);

  if(!show) return null;

  const wText = winner ? winner.toUpperCase() : "";
  return (
    <div className="brv__overlay">
      <div className="brv__panel">
        <div className="brv__titleRow">
          <div className="brv__title">開獎中…</div>
          <div className="brv__shimmer run" />
        </div>

        <div className="brv__hands">
          <Hand label="PLAYER" color="#2b6cb0" cards={pc} total={pt}/>
          <Hand label="BANKER" color="#dc2626" cards={bc} total={bt}/>
        </div>

        <div className="brv__result">結果：<b className="brv__winner">{wText}</b></div>
      </div>
    </div>
  );
}

function Hand({ label, color, cards=[], total=0 }) {
  return (
    <div className="brv__hand">
      <div className="brv__handTitle" style={{color}}>{label}</div>
      <div className="brv__cards">
        {cards.map((r,i)=><Card key={i} rank={r}/>)}
      </div>
      <div className="brv__total">點數：<b>{total}</b></div>
    </div>
  );
}

function Card({ rank }) {
  const isRed = ["♥","♦"].includes(rank); // 我們只顯示 rank，不含花色也可
  return (
    <div className="brv__card show">
      <div className="brv__cardFace brv__front">
        <div className="brv__corner" style={{ color: isRed ? "#d11" : "#111" }}>
          <div className="brv__rank">{rank}</div>
        </div>
        <div className="brv__pip" style={{ color: isRed ? "#d11" : "#111" }}>{rank}</div>
      </div>
    </div>
  );
}
