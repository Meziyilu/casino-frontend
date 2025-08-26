// src/pages/Lobby.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function Lobby() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        // 從 localStorage 取使用者帳號（登入時可存一份）
        const username = localStorage.getItem("username") || "";
        const data = await api.me(username);
        setMe(data);
      } catch (err) {
        console.error(err);
        setError("尚未登入或連線異常，請重新登入");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function logout() {
    // 若後端尚無 /auth/logout，先清本地即可
    localStorage.removeItem("username");
    navigate("/auth");
  }

  // 卡片：通用外觀
  function GameCard({ title, subtitle, onClick, disabled }) {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        style={{
          ...styles.card,
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.55 : 1,
        }}
      >
        <div style={styles.cardTitle}>{title}</div>
        <div style={styles.cardSub}>{subtitle}</div>
      </button>
    );
  }

  if (loading) {
    return (
      <div style={styles.bg}>
        <div style={styles.container}>
          <div style={styles.headerRow}>
            <div style={styles.logo}>🎰</div>
            <div style={styles.skeleton} />
          </div>
          <div style={styles.loading}>載入中…</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.bg}>
      <div style={styles.container}>
        {/* 頂部欄 */}
        <div style={styles.headerRow}>
          <div style={styles.brandWrap}>
            <div style={styles.logo}>🎰</div>
            <div style={styles.brand}>TOPZ 遊戲大廳</div>
          </div>

          <div style={styles.userWrap}>
            <div style={styles.userInfo}>
              <div style={styles.hello}>
                {me?.nickname ? `嗨，${me.nickname}` : me?.username ? `嗨，${me.username}` : "嗨，玩家"}
              </div>
              {"balance" in (me || {}) && (
                <div style={styles.balance}>餘額：{Number(me.balance || 0).toLocaleString()}</div>
              )}
            </div>
            <div style={styles.avatar}>{(me?.nickname || me?.username || "U").slice(0, 1).toUpperCase()}</div>
            <button style={styles.logoutBtn} onClick={logout}>登出</button>
          </div>
        </div>

        {error && <div style={styles.errorBar}>{error}</div>}

        {/* 遊戲網格 */}
        <div style={styles.grid}>
          {/* 百家樂：暫時關閉（你之後要接房間時，在 onClick 換成 navigate('/baccarat') 或 /room/...） */}
          <GameCard
            title="百家樂"
            subtitle="維護中，敬請期待"
            disabled
            onClick={() => {}}
          />

          <GameCard title="輪盤" subtitle="即將上線" disabled onClick={() => {}} />
          <GameCard title="老虎機" subtitle="即將上線" disabled onClick={() => {}} />
          <GameCard title="撲克" subtitle="即將上線" disabled onClick={() => {}} />
        </div>

        {/* 服務公告 / 版權列 */}
        <div style={styles.footer}>
          <div>⚙️ 系統狀態：運行中</div>
          <div style={{ opacity: 0.6 }}>© {new Date().getFullYear()} TOPZ</div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  bg: {
    minHeight: "100vh",
    width: "100%",
    background: "linear-gradient(135deg,#0f2027,#203a43,#2c5364)",
    padding: "32px 16px",
    color: "#fff",
  },
  container: {
    maxWidth: 1080,
    margin: "0 auto",
  },
  headerRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  brandWrap: { display: "flex", alignItems: "center", gap: 12 },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 12,
    display: "grid",
    placeItems: "center",
    background: "rgba(255,255,255,0.12)",
    boxShadow: "0 4px 16px rgba(0,0,0,.25)",
    fontSize: 22,
  },
  brand: { fontSize: 20, fontWeight: 700, letterSpacing: 0.6 },
  userWrap: { display: "flex", alignItems: "center", gap: 12 },
  userInfo: { textAlign: "right", marginRight: 8, lineHeight: 1.2 },
  hello: { fontWeight: 700 },
  balance: { fontSize: 13, opacity: 0.9 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    background: "linear-gradient(145deg,#1f2937,#374151)",
    display: "grid",
    placeItems: "center",
    fontWeight: 800,
    boxShadow: "0 6px 22px rgba(0,0,0,.25) inset, 0 2px 10px rgba(0,0,0,.25)",
  },
  logoutBtn: {
    padding: "10px 14px",
    border: "none",
    borderRadius: 10,
    background: "#ef4444",
    color: "#fff",
    fontWeight: 600,
    cursor: "pointer",
  },
  errorBar: {
    background: "rgba(239,68,68,.2)",
    border: "1px solid rgba(239,68,68,.35)",
    padding: "10px 14px",
    borderRadius: 10,
    marginBottom: 16,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: 16,
  },
  card: {
    background: "rgba(255,255,255,.08)",
    borderRadius: 16,
    padding: 20,
    textAlign: "left",
    color: "#fff",
    border: "1px solid rgba(255,255,255,.15)",
    boxShadow: "0 10px 30px rgba(0,0,0,.25), inset 0 0 0 1px rgba(255,255,255,.04)",
    transition: "transform .2s ease, box-shadow .2s ease",
  },
  cardTitle: { fontSize: 18, fontWeight: 800, marginBottom: 6, letterSpacing: 0.5 },
  cardSub: { opacity: 0.85 },
  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 24,
    paddingTop: 16,
    borderTop: "1px dashed rgba(255,255,255,.2)",
  },
  loading: {
    width: "100%",
    minHeight: 220,
    display: "grid",
    placeItems: "center",
    background: "rgba(255,255,255,.06)",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,.1)",
  },
  skeleton: {
    width: 160,
    height: 28,
    borderRadius: 8,
    background:
      "linear-gradient(90deg, rgba(255,255,255,.18), rgba(255,255,255,.35), rgba(255,255,255,.18))",
    animation: "shine 1.2s linear infinite",
  },
};
