// src/pages/Lobby.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, authStore } from "../api";
import "../styles/ui.css";

export default function Lobby() {
  const nav = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [top5, setTop5] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  async function loadAll() {
    try {
      setErr("");
      const [r, lb] = await Promise.all([
        api.rooms ? api.rooms() : fetchRoomsFallback(),
        api.leaderboardToday().catch(() => ({ top5: [] })),
      ]);
      setRooms(r.rooms || []);
      setTop5(lb.top5 || []);
    } catch (e) {
      setErr(e?.message || "載入失敗");
    } finally {
      setLoading(false);
    }
  }

  // 備援：如果還沒加 /baccarat/rooms，就用三次 /state 組回來
  async function fetchRoomsFallback() {
    const names = ["room1", "room2", "room3"];
    const states = await Promise.all(names.map((room) => api.state(room)));
    const rooms = states.map((s, i) => ({
      room: names[i],
      round_no: s.round_no,
      phase: s.phase,
      seconds_left: s.seconds_left,
      totals: { player: s.player_total || 0, banker: s.banker_total || 0, tie: 0 },
    }));
    return { rooms };
  }

  useEffect(() => {
    loadAll();
    const t = setInterval(loadAll, 2000);
    return () => clearInterval(t);
  }, []);

  function logout() {
    authStore.clear();
    nav("/auth", { replace: true });
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
            <button className="logout" onClick={logout}>登出</button>
            <button className="auth-btn" onClick={() => nav("/admin")}>管理面板</button>
          </div>
        </div>

        {loading ? (
          <div className="lobby-loading">載入中…</div>
        ) : err ? (
          <div className="notice error">{err}</div>
        ) : (
          <>
            <section className="hero">
              <div className="hero-title">遊戲大廳</div>
              <div className="hero-sub">選擇房間進入下注。資料每 2 秒更新。</div>
              <div className="grid">
                {rooms.map((r) => (
                  <div
                    key={r.room}
                    className="tile"
                    onClick={() => nav(`/baccarat/room/${r.room}`)}
                  >
                    <div className="tile-title">百家樂：{r.room.toUpperCase()}</div>
                    <div className="tile-desc">局號：{r.round_no || 0}</div>
                    <div className="tile-desc">
                      狀態：{r.phase === "betting" ? "下注中" : r.phase === "revealing" ? "開獎中" : "等待中"}
                    </div>
                    <div className="tile-desc">倒數：{r.seconds_left || 0}s</div>
                    <div className="tile-desc">
                      下注合計：P {r.totals?.player ?? 0}｜B {r.totals?.banker ?? 0}｜T {r.totals?.tie ?? 0}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="panel">
              <div className="panel-title">今日排行榜（下注總額 Top 5）</div>
              {top5.length === 0 ? (
                <div className="muted">暫無資料</div>
              ) : (
                <ol className="bullet">
                  {top5.map((x, i) => (
                    <li key={x.user_id || i}>
                      {x.nickname || `user_${x.user_id}`}：{x.value}
                    </li>
                  ))}
                </ol>
              )}
            </section>
          </>
        )}

        <div className="lobby-footer">
          <span className="muted">© TOPZ</span>
          <span className="muted">台北時間每日 00:00 重置</span>
        </div>
      </div>
    </div>
  );
}
