// src/pages/Lobby.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, authStore } from "../api";
import "../styles/ui.css";

export default function Lobby() {
  const nav = useNavigate();
  const [me, setMe] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const u = await api.me();
        if (!ignore) setMe(u);
        const r = await api.rooms();
        if (!ignore) setRooms(r.rooms || []);
      } catch (e) {
        setErr(String(e.message || e));
      }
    })();
    return () => (ignore = true);
  }, []);

  const logout = async () => {
    await api.logout();
    nav("/auth");
  };

  if (!me && !err) {
    return <div className="lobby-bg"><div className="lobby-shell"><div className="lobby-loading">載入中…</div></div></div>;
  }

  return (
    <div className="lobby-bg">
      <div className="lobby-shell">
        <div className="lobby-header">
          <div className="brand">
            <div className="logo">🎰</div>
            <div className="brand-name">TOPZ Casino</div>
          </div>
          <div className="userbar">
            {me && (
              <>
                <div className="chips">
                  <div className="chip">
                    <span className="chip-label">玩家</span>
                    <span className="chip-value">{me.nickname || me.username}</span>
                  </div>
                  <div className="chip">
                    <span className="chip-label">餘額</span>
                    <span className="chip-value">{me.balance}</span>
                  </div>
                </div>
                <div className="avatar">
                  {(me.nickname || me.username || "U").slice(0, 1).toUpperCase()}
                </div>
              </>
            )}
            <button className="logout" onClick={logout}>登出</button>
          </div>
        </div>

        {err && <div className="notice error">{err}</div>}

        <section className="hero">
          <div className="hero-title">遊戲大廳</div>
          <div className="hero-sub">選擇房間開始遊戲（自動開局、台北時間每日重置）</div>
          <div className="hero-row">
            <div className="stat">
              <div className="stat-val">{rooms.length || 3}</div>
              <div className="stat-lab">可用房間</div>
            </div>
            <div className="stat">
              <div className="stat-val">Asia/Taipei</div>
              <div className="stat-lab">時區</div>
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="panel-title">百家樂房間</div>
          <div className="grid">
            {["room1","room2","room3"].map((id, i) => (
              <div key={id} className="tile" onClick={() => nav(`/baccarat/room/${id}`)}>
                <div className="tile-title">房間 {i+1}（{id}）</div>
                <div className="tile-desc">自動開局 / 倒數下注 / 翻牌揭曉</div>
              </div>
            ))}
          </div>
        </section>

        <div className="lobby-footer">
          <div className="muted">© {new Date().getFullYear()} TOPZ</div>
          <div className="muted">每日 00:00 (台北) 重置局號</div>
        </div>
      </div>
    </div>
  );
}
