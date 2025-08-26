// src/pages/Lobby.jsx
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import "../styles/ui.css";

export default function Lobby() {
  const nav = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [backoffMs, setBackoffMs] = useState(1000); // 1s 起步
  const ctrlRef = useRef(null);
  const alive = useRef(true);
  const lastJSON = useRef(""); // 只有資料真的變才 setState

  useEffect(() => {
    alive.current = true;

    async function loop() {
      while (alive.current) {
        // 每輪先取消上一輪請求
        if (ctrlRef.current) ctrlRef.current.abort();
        ctrlRef.current = new AbortController();

        const data = await api.rooms({ signal: ctrlRef.current.signal });

        if (data && Array.isArray(data)) {
          const next = JSON.stringify(data);
          if (next !== lastJSON.current) {
            setRooms(data);
            lastJSON.current = next;
          }
          setLoading(false);
          setNotice("");

          // 成功就把 backoff 拉回 2 秒（平穩輪詢）
          await sleep(2000);
          setBackoffMs(1000);
        } else {
          // 失敗：顯示提示，按 backoff 等待再試
          setNotice("連線不穩定，重試中…");
          setLoading(false);
          await sleep(backoffMs);
          setBackoffMs((ms) => Math.min(ms * 2, 10000)); // 最長 10 秒
        }
      }
    }

    loop();

    return () => {
      alive.current = false;
      if (ctrlRef.current) ctrlRef.current.abort();
    };
  }, []);

  return (
    <div className="lobby-bg">
      <span className="glow g1" />
      <span className="glow g2" />
      <span className="glow g3" />

      <div className="lobby-shell">
        <header className="lobby-header">
          <div className="brand">
            <div className="logo">🎰</div>
            <div className="brand-name">TOPZ Casino</div>
          </div>
          <div className="userbar">
            <button className="logout" onClick={() => { api.logout(); nav("/"); }}>
              登出
            </button>
          </div>
        </header>

        {notice && <div className="notice">{notice}</div>}

        <section className="hero">
          <div className="hero-title">百家樂房間</div>
          <div className="hero-sub">選擇房間進入下注</div>

          {loading && (
            <div className="lobby-loading">載入中…</div>
          )}

          {!loading && (
            <div className="grid" style={{ marginTop: 8 }}>
              {rooms.map((r) => (
                <RoomTile key={r.room} r={r} onEnter={() => nav(`/baccarat/room/${r.room}`)} />
              ))}
              {rooms.length === 0 && (
                <div className="tile disabled">
                  <div className="tile-title">暫無資料</div>
                  <div className="tile-desc">等候莊家開局中…</div>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function RoomTile({ r, onEnter }) {
  const { room, round_no, phase, seconds_left, totals } = r;
  const disabled = phase !== "betting"; // 非下注階段先禁止進入，避免你說的點了沒反應

  return (
    <button
      className={`tile ${disabled ? "disabled" : ""}`}
      onClick={disabled ? undefined : onEnter}
      aria-disabled={disabled}
      title={disabled ? "等待下一局或開獎中…" : "進入房間"}
    >
      <div className="tile-title">{room.toUpperCase()}</div>
      <div className="tile-desc" style={{ marginTop: 6 }}>
        局號：<b>{round_no}</b>　狀態：<b>{phase}</b>
        {phase === "betting" && <>　倒數：<b>{seconds_left}s</b></>}
      </div>

      <div className="stat" style={{ marginTop: 10 }}>
        <div className="stat-lab">下注總額（本局）</div>
        <div className="stat-val">
          P:{totals.player ?? 0} / B:{totals.banker ?? 0} / T:{totals.tie ?? 0}
        </div>
      </div>
    </button>
  );
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
