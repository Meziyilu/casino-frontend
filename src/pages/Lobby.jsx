import { useEffect, useState } from "react";
import { get } from "../api";
import { useNavigate } from "react-router-dom";

export default function Lobby() {
  const nav = useNavigate();
  const token = localStorage.getItem("token") || "";
  const [me, setMe] = useState(null);
  const [bal, setBal] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const m = await get("/me", token);
        setMe(m);
        const b = await get("/balance", token);
        setBal(b.balance);
      } catch (e) {
        localStorage.removeItem("token");
        nav("/auth");
      }
    })();
  }, []);

  return (
    <main style={{ padding: 24, fontFamily:"ui-sans-serif,system-ui" }}>
      <h1>遊戲大廳</h1>
      <div>玩家：{me?.username} {me?.is_admin && <b style={{marginLeft:6}}>（ADMIN）</b>}</div>
      <div style={{margin:"8px 0 16px"}}>餘額：{bal}</div>

      <button onClick={()=> nav("/game/baccarat")} style={btn}>百家樂</button>
    </main>
  );
}
const btn={ padding:"14px 18px", background:"#111", color:"#fff", border:"none", borderRadius:12, cursor:"pointer" };
