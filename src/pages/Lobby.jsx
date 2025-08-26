import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "../styles/ui.css";

export default function Lobby() {
  const nav = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const me = await api.me(); // 取目前使用者（cookie + token）
        if (!mounted) return;
        setProfile(me);
      } catch (e) {
        // 任何錯誤都退回登入
        console.error("[me] failed", e);
        localStorage.removeItem("token");
        nav("/", { replace: true });
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [nav]);

  const logout = () => {
    localStorage.removeItem("token");
    nav("/", { replace: true });
  };

  if (loading) {
    return (
      <div className="lobby-bg">
        <span className="glow g1" />
        <span className="glow g2" />
        <main className="lobby-shell">
          <div className="lobby-loading">載入中…</div>
        </main>
      </div>
    );
  }

  return (
    <div className="lobby-bg">
      <span className="glow g1" />
      <span className="glow g2" />
      <span className="glow g3" />

      {/* 頂部資訊列 */}
      <header className="lobby-header animate-pop">
        <div className="brand">
          <div className="logo">🎰</div>
          <div className="brand-name">TOPZ</div>
        </div>

        <div className="userbar">
          <div className="chip">
            <span className="chip-label">玩家</span>
            <span className="chip-value">{profile?.nickname || profile?.username}</span>
          </div>
          <div className="chip">
            <span className="chip-label">金幣</span>
            <span className="chip-value">{profile?.balance ?? 0}</span>
          </div>
          <div className="avatar">
            {(profile?.nickname || profile?.username || "U").slice(0, 1).toUpperCase()}
          </div>
          <button className="logout" onClick={logout}>登出</button>
        </div>
      </header>

      <main className="lobby-shell animate-fadein">
        {notice && <div className="notice">{notice}</div>}

        {/* 上方摘要區（可放公告 / 今日資訊） */}
        <section className="hero">
          <div className="hero-title">遊戲大廳</div>
          <div className="hero-sub">選擇房間開始遊戲吧！</div>

          {/* 你也可以把這些數字改成從後端撈（今日局數、在線、今日盈虧等） */}
          <div className="hero-row">
            <div className="stat">
              <div className="stat-val">3</div>
              <div className="stat-lab">百家樂房間</div>
            </div>
            <div className="stat">
              <div className="stat-val">{profile?.balance ?? 0}</div>
              <div className="stat-lab">我的金幣</div>
            </div>
            <div className="stat">
              <div className="stat-val">UTC+8</div>
              <div className="stat-lab">台北時間</div>
            </div>
          </div>
        </section>

        {/* 遊戲入口 */}
        <section className="panel">
          <div className="panel-title">百家樂房間</div>
          <div className="grid">
            <div
              className="tile"
              onClick={() => nav("/baccarat/room/room1")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && nav("/baccarat/room/room1")}
            >
              <div className="tile-title">百家樂 #1</div>
              <div className="tile-desc">30 秒一局｜自動開局 / 自動結算</div>
            </div>

            <div
              className="tile"
              onClick={() => nav("/baccarat/room/room2")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && nav("/baccarat/room/room2")}
            >
              <div className="tile-title">百家樂 #2</div>
              <div className="tile-desc">60 秒一局｜自動開局 / 自動結算</div>
            </div>

            <div
              className="tile"
              onClick={() => nav("/baccarat/room/room3")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && nav("/baccarat/room/room3")}
            >
              <div className="tile-title">百家樂 #3</div>
              <div className="tile-desc">90 秒一局｜自動開局 / 自動結算</div>
            </div>
          </div>
        </section>

        {/* 可擴充區（排行榜 / 公告 / 教學） */}
        <section className="panel">
          <div className="panel-title">提示</div>
          <ul className="bullet">
            <li>每日 00:00（台北時間）自動重置局號，重新從第 1 局開始。</li>
            <li>下注、結算、開獎動畫會在各房間頁面顯示。</li>
          </ul>
        </section>

        <footer className="lobby-footer">
          <div className="muted">© {new Date().getFullYear()} TOPZ</div>
          <div className="muted">Have fun & play fair.</div>
        </footer>
      </main>
    </div>
  );
}
