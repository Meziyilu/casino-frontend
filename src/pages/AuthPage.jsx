// src/pages/AuthPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      if (isLogin) {
        await api.login({ username, password });
        navigate("/lobby");
      } else {
        await api.register({ username, password });
        setIsLogin(true);
      }
    } catch (err) {
      console.error(err);
      setError("帳號或密碼錯誤，請再試一次！");
    }
  }

  return (
    <div style={styles.bg}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h2 style={styles.title}>{isLogin ? "登入" : "註冊"}</h2>

        <input
          style={styles.input}
          placeholder="帳號"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          style={styles.input}
          type="password"
          placeholder="密碼"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit" style={styles.button}>
          {isLogin ? "登入" : "建立帳號"}
        </button>

        <button
          type="button"
          style={styles.switchBtn}
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin ? "切換到註冊" : "切換到登入"}
        </button>

        {error && <div style={styles.error}>{error}</div>}
      </form>
    </div>
  );
}

const styles = {
  bg: {
    height: "100vh",
    width: "100%",
    background: "linear-gradient(135deg,#0f2027,#203a43,#2c5364)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    background: "rgba(255,255,255,0.1)",
    borderRadius: "16px",
    padding: "40px 32px",
    width: "100%",
    maxWidth: "380px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
    backdropFilter: "blur(8px)",
    textAlign: "center",
    color: "#fff",
  },
  title: {
    marginBottom: "20px",
    fontSize: "1.5rem",
    fontWeight: "600",
    letterSpacing: "1px",
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    marginBottom: "16px",
    border: "none",
    borderRadius: "8px",
    background: "rgba(255,255,255,0.85)",
    fontSize: "1rem",
  },
  button: {
    width: "100%",
    padding: "12px",
    border: "none",
    borderRadius: "8px",
    background: "#2563eb",
    color: "#fff",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    marginBottom: "12px",
    transition: "background 0.3s",
  },
  switchBtn: {
    width: "100%",
    padding: "10px",
    border: "none",
    borderRadius: "8px",
    background: "#4b5563",
    color: "#fff",
    fontSize: "0.95rem",
    cursor: "pointer",
  },
  error: {
    marginTop: "14px",
    color: "#f87171",
    fontWeight: "500",
    fontSize: "0.9rem",
  },
};
