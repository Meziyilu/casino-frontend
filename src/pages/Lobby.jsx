import { useEffect, useState } from "react";
import "../styles/ui.css";

export default function Lobby() {
  const [name, setName] = useState("");

  useEffect(() => {
    const u = localStorage.getItem("username") || "";
    setName(u);
  }, []);

  function logout() {
    localStorage.removeItem("uid");
    localStorage.removeItem("username");
    window.location.href = "/";
  }

  return (
    <div className="lobby-bg">
      <div className="glow g1" />
      <div className="glow g2" />
      <div className="glow g3" />

      <header className="lobby-header">
        <div className="brand">TOPZ</div>
        <div className="spacer" />
        <div className="userchip">
          <span className="hi">Hi, </span>
          <b>{name || "玩家"}</b>
          <button className="logout" onClick={logout}>登出</button>
        </div>
      </header>

      <main className="lobby-main">
        <section className="lobby-card">
          <h2 className="lobby-title">遊戲大廳</h2>
          <p className="lobby-subtitle">選擇你要進入的遊戲（目前先關閉百家樂重寫中）。</p>

          <div className="grid">
            <div className="game-tile disabled">
              <div className="game-name">百家樂</div>
              <div className="game-desc">重寫中 · 敬請期待</div>
              <button className="game-btn" disabled>進入</button>
            </div>

            <div className="game-tile">
              <div className="game-name">休閒小遊戲</div>
              <div className="game-desc">測試用入口（待擴充）</div>
              <button className="game-btn" onClick={() => alert("之後擴充在這裡！")}>看看</button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
