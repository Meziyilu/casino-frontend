import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function AuthPage() {
  const [mode, setMode] = useState("login"); // login | register
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      if (mode === "login") {
        const res = await api.login(username, password);
        localStorage.setItem("token", res.token);
        localStorage.setItem("username", username);
        navigate("/lobby");   // ✅ React Router 內部跳轉
      } else {
        await api.register(username, password, nickname);
        alert("註冊成功！請登入");
        setMode("login");
      }
    } catch (err) {
      console.error(err);
      setError("登入/註冊失敗，請確認帳號密碼");
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>{mode === "login" ? "登入" : "註冊"}</h2>

        <input
          type="text"
          placeholder="帳號"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="密碼"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {mode === "register" && (
          <input
            type="text"
            placeholder="暱稱（可留空）"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
        )}

        <button type="submit">
          {mode === "login" ? "登入" : "建立帳號"}
        </button>
        <button
          type="button"
          className="switch-btn"
          onClick={() => setMode(mode === "login" ? "register" : "login")}
        >
          切換到 {mode === "login" ? "註冊" : "登入"}
        </button>

        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
}
