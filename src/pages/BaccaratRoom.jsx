// src/pages/BaccaratRoom.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api, { baccarat as B } from "../api";
import BaccaratReveal from "../components/BaccaratReveal";

export default function BaccaratRoom(){
  const { roomId } = useParams();
  const nav = useNavigate();
  const [state,setState] = useState(null);
  const [hist,setHist] = useState([]);
  const [reveal,setReveal] = useState({show:false});
  const [myBet,setMyBet] = useState({side:null, amount:0});
  const [user,setUser] = useState(null);
  const timer = useRef();

  useEffect(()=>{ (async()=>{
    try{
      // 取得目前登入者（若你已有全域 user，這段換成你的）
      const me = await fetch("/me",{credentials:"include"}).then(r=>r.ok?r.json():null).catch(()=>null);
      setUser(me);
    }catch{}
  })() },[]);

  // 拉 state & history
  useEffect(()=>{
    if(!roomId) return;
    const loop = async ()=>{
      try{
        const s = await B.state(roomId);
        setState(s);
        if(s.status==="dealing"){ // 播動畫
          const r = await B.reveal(roomId);
          setReveal({
            show: true,
            winner: r.winner,
            pc: r.player_cards,
            bc: r.banker_cards,
            pt: r.player_total,
            bt: r.banker_total
          });
        }
        const h = await B.history(roomId, 12);
        setHist(h);
      }catch(e){ console.log(e); }
    };
    loop();
    clearInterval(timer.current);
    timer.current = setInterval(loop, 1000);
    return ()=> clearInterval(timer.current);
  },[roomId]);

  const placeBet = async (side, amount)=>{
    if(!user){ alert("請先登入"); return; }
    try{
      await B.bet(roomId, side, amount, user?.id || 0);
      setMyBet({side, amount});
    }catch(e){ alert("下注失敗：" + e.message); }
  };

  return (
    <main className="page">
      <header className="hdr">
        <button onClick={()=>nav("/lobby")} className="back">← 大廳</button>
        <div className="title">百家樂 {roomId.toUpperCase()}</div>
        <div className="spacer"/>
      </header>

      {/* 開獎動畫固定在下注面板上方 */}
      <BaccaratReveal
        show={reveal.show}
        winner={reveal.winner}
        pc={reveal.pc} bc={reveal.bc}
        pt={reveal.pt} bt={reveal.bt}
        onEnd={()=> setReveal({show:false})}
      />

      <section className="board">
        <div className="lane">
          <div className="timer">
            倒數：<b>{state?.seconds_left ?? 0}</b>s
            <span className={`badge ${state?.status || ""}`}>{state?.status}</span>
          </div>

          <div className="totals">
            <div>下注人數：{state?.bettors ?? 0}</div>
            <div>總額 P/B/T：{state?.totals?.player ?? 0} / {state?.totals?.banker ?? 0} / {state?.totals?.tie ?? 0}</div>
          </div>

          <div className="actions">
            <Btn onClick={()=>placeBet("player",100)} text="閒 100"/>
            <Btn onClick={()=>placeBet("banker",100)} text="莊 100"/>
            <Btn onClick={()=>placeBet("tie",50)} text="和 50"/>
          </div>
        </div>

        <div className="lane">
          <div className="panel">
            <div className="panel-title">今日近 12 局</div>
            <div className="road">
              {hist.map(h=>(
                <div key={h.round_no} className={`dot ${h.winner||"na"}`} title={`#${h.round_no} ${h.pt??"-"}:${h.bt??"-"}`} />
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="panel-title">我的下注</div>
            <div>本局：{myBet.side||"-"} / {myBet.amount||0}</div>
          </div>
        </div>
      </section>
    </main>
  );
}

function Btn({onClick,text}){ return <button className="pill" onClick={onClick}>{text}</button>; }
