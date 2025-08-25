import { useEffect, useState } from "react";
import { post, get } from "../api";

export default function AuthPage() {
  const [mode, setMode] = useState("login"); // 'login' | 'register'
  const [f, setF] = useState({ username: "", password: "", nickname: "" });
  const [msg, setMsg] = useState("");

  async function submit() {
    setMsg("");
    try {
      const path = mode === "login" ? "/auth/login" : "/auth/register";
      const body =
        mode === "login"
          ? { username: f.username, password: f.password }
          : { username: f.username, password: f.password, nickname: f.nickname || null };
      const data = await post(path, body);
      localStorage.setItem("token", data.access_token);
      // 驗證 token 並讀使用者
      await get("/me", data.access_token);
      location.href = "/"; // 進入遊戲頁
    } catch (e) {
      setMsg("失敗：" + (e.message || e));
    }
  }

  return (
    <main style={{ padding: 24, fontFamily: "system-ui", maxWidth: 360, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 12 }}>{mode === "login" ? "登入" : "註冊"}</h1>

      <label>帳號</label>
      <input
        style={inputStyle}
        value={f.username}
        onChange={(e) => setF({ ...f, username: e.target.value })}
        placeholder="username"
      />

      <label style={{ marginTop: 8 }}>密碼</label>
      <input
        style={inputStyle}
        type="password"
        value={f.password}
        onChange={(e) => setF({ ...f, password: e.target.value })}
        placeholder="password"
      />

      {mode === "register" && (
        <>
          <label style={{ marginTop: 8 }}>暱稱（可留空）</label>
          <input
            style={inputStyle}
            value={f.nickname}
            onChange={(e) => setF({ ...f, nickname: e.target.value })}
            placeholder="nickname"
          />
        </>
      )}

      <button style={btnStyle} onClick={submit}>
        {mode === "login" ? "登入" : "建立帳號"}
      </button>
      <button
        style={{ ...btnStyle, background: "transparent", border: "1px solid #ccc", color: "#333" }}
        onClick={() => setMode(mode === "login" ? "register" : "login")}
      >
        切換到 {mode === "login" ? "註冊" : "登入"}
      </button>

      {msg && <p style={{ color: "crimson", marginTop: 10 }}>{msg}</p>}
    </main>
  );
}

const inputStyle = { width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ccc" };
const btnStyle = {
  width: "100%",
  marginTop: 12,
  padding: 12,
  background: "#111",
  color: "#fff",
  borderRadius: 10,
  border: "none",
  cursor: "pointer",
};
