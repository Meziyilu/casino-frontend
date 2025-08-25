import { useEffect, useState } from "react";
import { get } from "../api";

export default function GamePage() {
  const [me, setMe] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    get("/me", token).then(setMe).catch(() => {
      localStorage.removeItem("token");
      location.href = "/auth";
    });
  }, []);

  function logout() {
    localStorage.removeItem("token");
    location.href = "/auth";
  }

  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>遊戲大廳</h1>
      <p>歡迎，{me?.username}</p>
      <button onClick={logout}>登出</button>
      <hr />
      {/* 之後把下注/歷史/開局元件放這裡 */}
      <p>（下一步：顯示餘額、下注、近十局…）</p>
    </main>
  );
}
