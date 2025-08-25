import { useState, useEffect } from "react";
import { post, get } from "./api";

export default function App() {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [form, setForm] = useState({ username: "", password: "", nickname: "" });
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [me, setMe] = useState(null);
  const API_BASE = import.meta.env.VITE_API_BASE || "";

  useEffect(() => {
    if (!token) return;
    get("/me", token)
      .then(setMe)
      .catch(() => { setToken(""); localStorage.removeItem("token"); });
  }, [token]);

  async function submit() {
    try {
      const path = mode === "login" ? "/auth/login" : "/auth/register";
      const body = mode === "login"
        ? { username: form.username, password: form.password }
        : { username: form.username, password: form.password, nickname: form.nickname || null };
      const data = await post(path, body);
      localStorage.setItem("token", data.access_token);
      setToken(data.access_token);
    } catch (e) {
      alert("失敗：" + e.message);
    }
  }

  if (token && me) {
    return (
      <main style={{ padding: 24, fontFamily: "system-ui" }}>
        <h1>歡迎，{me.username}</h1>
        <p>API_BASE: {API_BASE}</p>
        <button onClick={() => { localStorage.removeItem("token"); setToken(""); setMe(null); }}>
          登出
        </button>
        <hr />
        <h2>（之後在這裡接你的遊戲介面）</h2>
      </main>
    );
  }

  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>{mode === "login" ? "登入" : "註冊"}</h1>
      <p>API_BASE: {API_BASE}</p>
      <div style={{ display: "grid", gap: 8, maxWidth: 320 }}>
        <input placeholder="帳號 username" value={form.username}
               onChange={e => setForm({ ...form, username: e.target.value })} />
        <input placeholder="密碼 password" type="password" value={form.password}
               onChange={e => setForm({ ...form, password: e.target.value })} />
        {mode === "register" && (
          <input placeholder="暱稱（可留空）" value={form.nickname}
                 onChange={e => setForm({ ...form, nickname: e.target.value })} />
        )}
        <button onClick={submit}>{mode === "login" ? "登入" : "建立帳號"}</button>
        <button onClick={() => setMode(mode === "login" ? "register" : "login")}>
          切換到 {mode === "login" ? "註冊" : "登入"}
        </button>
      </div>
    </main>
  );
}
