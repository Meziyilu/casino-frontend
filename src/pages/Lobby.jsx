// src/pages/Lobby.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import "../styles/ui.css";

const ROOMS = ["room1", "room2", "room3"];

export default function Lobby() {
  const nav = useNavigate();
  const [me, setMe] = useState(null);
  const [rooms, setRooms] = useState({});
  const [lb, setLb] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    let t;
    const load = async () => {
      try {
        setErr("");
        const [meRes, ...roomStates] = await Promise.all([
          api.me(),
          ...ROOMS.map((r) => api.getState(r).catch(() => null)),
        ]);
        setMe(meRes);
        const map = {};
        ROOMS.forEach((r, i) => (map[r] = roomStates[i]));
        setRooms(map);
      } catch (e) {
        setErr(e.message || "load error");
      }
      try {
        const lbRes = await api.leaderboardToday();
        setLb(lbRes?.top || []);
      } catch {}
      t = setTimeout(load, 1500);
    };
    load();
    return () => clearTimeout(t);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    nav("/auth");
  };

  return (
    <div className="lobby-bg">
      <div className="glow g1" />
      <div className="glow g2" />
      <div className="lobby-shell">
        <div className="lobby-header">
          <div className="brand">
            <div className="logo">🎰</div>
            <div className="brand-name">TOPZ Casino</div>
          </div>
          <div className="userbar">
            <div className="chips">
              <span className="chip">
                <span className="chip-label">User</span>
                <span className="chip-value">{me?.nickname || me?.username}</span>
              </span>
              <span className="chip">
                <span className="chip-label">Balance</span>
                <span className="chip-value">{me?.balance ?? "-"}</span>
              </span>
            </div>
            <button className="logout" onClick={logout}>登出</button>
          </div>
        </div>

        {err && <div className="notice error">{err}</div>}

        <section className="hero">
          <div className="hero-title">遊戲大廳</div>
          <div className="hero-sub">選擇一個百家樂房間進入下注</div>
          <div className="grid">
            {ROOMS.map((r) => {
              const s = rooms[r];
              const seconds = s?.seconds_left ?? "-";
              const round = s?.round_no ?? "-";
              const total =
                (s?.pools?.player || 0) + (s?.pools?.banker || 0) + (s?.pools?.tie || 0);
              return (
                <div
                  key={r}
                  className="tile"
                  onClick={() => nav(`/baccarat/room/${r}`)}
                >
                  <div className="tile-title">百家樂 {r.toUpperCase()}</div>
                  <div className="tile-desc">第 {round} 局 · 剩餘 {seconds}s</div>
                  <div className="stat" style={{ marginTop: 10 }}>
                    <div className="stat-val">{total}</div>
                    <div className="stat-lab">當前總下注</div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="panel">
          <div className="panel-title">今日排行榜（前 5）</div>
          {lb.length === 0 ? (
            <div className="lobby-loading">今日尚無資料</div>
          ) : (
            <div className="grid">
              {lb.map((u, i) => (
                <div key={u.username} className="stat">
                  <div className="stat-val">#{i + 1} {u.nickname || u.username}</div>
                  <div className="stat-lab">今日盈利：{u.profit}</div>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="lobby-footer">
          <div className="muted">© TOPZ Casino</div>
          <div className="muted">台北時間每日 00:00 重置</div>
        </div>
      </div>
    </div>
  );
}
