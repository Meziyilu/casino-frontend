import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "../styles/ui.css";

export default function Lobby() {
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const username = localStorage.getItem("username") || "";
        if (!username) throw new Error("尚未登入");
        const data = await api.me(username);
        setMe(data);
      } catch (e) {
        setErr("尚未登入或連線異常，請重新登入");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function logout() {
    localStorage.removeItem("username");
    localStorage.removeItem("uid");
    navigate("/auth");
  }

  const displayName = me?.nickname || me?.username || "玩家";
  const balance = Number(me?.balance || 0).toLocaleString();

  return (
    <div className="lobby-bg">
      <div className="glow g1" />
      <div className="glow g2" />
      <div className="glow g3" />

      <div className="lobby-shell">
        {/* 頂欄 */}
        <header className="lobby-header animate-fadein">
          <div className="brand">
            <div className="logo">🎰</div>
            <div className="brand-name">TOPZ 大廳</div>
          </div>
          <div className="userbar">
            <div className="chips">
              <div className="chip">
                <span className="chip-label">玩家</span>
                <b className="chip-value">{displayName}</b>
              </div>
              <div className="chip">
                <span className="chip-label">餘額</span>
                <b className="chip-value">{balance}</b>
              </div>
            </div>
            <div className="avatar">{displayName.slice(0, 1).toUpperCase()}</div>
            <button className="logout" onClick={logout}>登出</button>
          </div>
        </header>

        {loading ? (
          <div className="lobby-loading">載入中…</div>
        ) : (
          <>
            {err && <div className="notice error">{err}</div>}

            {/* 英雄橫幅 */}
            <section className="hero animate-pop">
              <div className="hero-title">歡迎回來，{displayName}</div>
              <div className="hero-sub">選擇你的遊戲，今天手氣不錯！</div>
              <div className="hero-row">
                <div className="stat">
                  <div className="stat-val">{balance}</div>
                  <div className="stat-lab">我的餘額</div>
                </div>
                <div className="stat">
                  <div className="stat-val">0</div>
                  <div className="stat-lab">今日對局</div>
                </div>
                <div className="stat">
                  <div className="stat-val">—</div>
                  <div className="stat-lab">連勝</div>
                </div>
              </div>
            </section>

            {/* 公告 */}
            <section className="panel">
              <div className="panel-title">公告</div>
              <ul className="bullet">
                <li>百家樂目前重寫中，暫時關閉入口。</li>
                <li>每日 00:00（台北時間）會重置排行榜與房間。</li>
                <li>如有問題，請聯繫管理員。</li>
              </ul>
            </section>

            {/* 遊戲網格 */}
            <section className="panel">
              <div className="panel-title">遊戲清單</div>
              <div className="grid">
                <GameTile title="百家樂" desc="維護中 · 即將回歸" disabled />
                <GameTile title="輪盤" desc="即將上線" disabled />
                <GameTile title="老虎機" desc="即將上線" disabled />
                <GameTile title="撲克" desc="即將上線" disabled />
              </div>
            </section>

            {/* 底部 */}
            <footer className="lobby-footer">
              <div>⚙️ 系統狀態：運行中</div>
              <div className="muted">© {new Date().getFullYear()} TOPZ</div>
            </footer>
          </>
        )}
      </div>
    </div>
  );
}

function GameTile({ title, desc, disabled }) {
  return (
    <button
      className={`tile ${disabled ? "disabled" : ""}`}
      onClick={() => {}}
      disabled={disabled}
    >
      <div className="tile-title">{title}</div>
      <div className="tile-desc">{desc}</div>
    </button>
  );
}
