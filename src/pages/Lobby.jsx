// src/pages/Lobby.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api"; // ← 具名匯入，不要用 default
// 全域 CSS 已在 src/main.jsx 匯入，這裡不用再匯入

export default function Lobby() {
  const nav = useNavigate();
  const [me, setMe] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem("me") || "null"); } catch { return null; }
  });
  const [sum, setSum] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!me) {
      nav("/auth");
      return;
    }
    (async () => {
      try {
        setErr("");
        const r = await api.lobbySummary();
        setSum(r.summary);
      } catch (e) {
        setErr(e.message || "ERROR");
      }
    })();
  }, [me, nav]);

  function logout() {
    sessionStorage.removeItem("me");
    nav("/auth");
  }

  return (
    <div className="lobby-bg">
      <div className="glow g1"></div><div className="glow g2"></div><div className="glow g3"></div>

      <div className="lobby-shell">
        <div className="lobby-header">
          <div className="brand">
            <div className="logo">🎰</div>
            <div className="brand-name">TOPZ Casino 大廳</div>
          </div>
          <div className="userbar">
            {me && (
              <>
                <div className="chip"><span className="chip-label">玩家</span><span className="chip-value">{me.nickname || me.username}</span></div>
                <div className="chip"><span className="chip-label">餘額</span><span className="chip-value">{(me.balance ?? 0).toLocaleString()}</span></div>
                <div className="avatar">{(me.nickname || me.username || "?").slice(0,1).toUpperCase()}</div>
              </>
            )}
            <button className="logout" onClick={logout}>登出</button>
          </div>
        </div>

        {err && <div className="notice error">錯誤：{err}</div>}

        <div className="hero">
          <div className="hero-title">系統統計</div>
          <div className="hero-row">
            <div className="stat"><div className="stat-val">{sum?.totalUsers ?? "-"}</div><div className="stat-lab">總會員</div></div>
            <div className="stat"><div className="stat-val">{sum?.todayNewUsers ?? "-"}</div><div className="stat-lab">今日新註冊</div></div>
            <div className="stat"><div className="stat-val">{sum ? sum.totalBalance.toLocaleString() : "-"}</div><div className="stat-lab">總餘額</div></div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-title">遊戲清單</div>
          <div className="grid">
            <div className="tile disabled">
              <div className="tile-title">百家樂 <span className="badge busy">建置中</span></div>
              <div className="tile-desc">即將上線，敬請期待</div>
              <div className="tile-foot">
                <div className="tile-meta"><span className="meta-people">🆔 demo</span></div>
                <div className="tile-cta">
                  <button className="btn" disabled>進入</button>
                </div>
              </div>
            </div>

            <div className="tile" onClick={()=>nav("/admin")}>
              <div className="corner-ribbon">ADMIN</div>
              <div className="tile-title">管理面板 <span className="badge online">STAFF</span></div>
              <div className="tile-desc">加幣 / 設餘額 / 搜尋會員 / 重設密碼</div>
              <div className="tile-foot">
                <div className="tile-meta"><span className="meta-people">🛠️ 管理功能</span></div>
                <div className="tile-cta"><button className="btn primary">打開</button></div>
              </div>
            </div>
          </div>
        </div>

        <div className="lobby-footer">
          <div className="muted">© 2025 TOPZ</div>
          <div>Lobby</div>
        </div>
      </div>
    </div>
  );
}
