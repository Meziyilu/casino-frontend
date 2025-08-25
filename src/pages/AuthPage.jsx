import { useState } from "react";
import { post } from "../api";
import { useNavigate } from "react-router-dom";

export default function AuthPage() {
  const nav = useNavigate();
  const [acc, setAcc] = useState("");
  const [pw, setPw] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [msg, setMsg] = useState("");

  async function submit() {
    setMsg("");
    try {
      const primary = isLogin ? "/auth/login" : "/auth/register";
      const legacy  = isLogin ? "/login"      : "/register"; // fallback 舊路徑
      let res;
      try {
        res = await post(primary, { username: acc.trim(), password: pw });
      } catch (e) {
        if (e.status === 404) res = await post(legacy, { username: acc.trim(), password: pw });
        else throw e;
      }
      const token = res?.access_token;
      if (!token) throw new Error("登入回應異常（沒有 access_token）");
      localStorage.setItem("token", token);
      nav("/");
    } catch (e) {
      if (e.status === 409) setMsg("此帳號已被註冊，請改用其他帳號或切換到登入");
      else if (e.status === 401) setMsg("帳號或密碼錯誤");
      else setMsg(e.message || "發生錯誤");
    }
  }

  return (
    <main style={{ padding: 32, maxWidth: 420, margin: "0 auto", fontFamily: "ui-sans-serif,system-ui" }}>
      <h1>{isLogin ? "登入" : "註冊"}</h1>
      <div style={{ display: "grid", gap: 10 }}>
        <input placeholder="帳號" value={acc} onChange={e=>setAcc(e.target.value)} style={inpt}/>
        <input type="password" placeholder="密碼" value={pw} onChange={e=>setPw(e.target.value)} style={inpt}/>
        <button onClick={submit} style={btn}>{isLogin ? "登入" : "註冊並登入"}</button>
        <button onClick={()=>{ setIsLogin(v=>!v); setMsg(""); }} style={btnGhost}>
          {isLogin ? "沒有帳號？去註冊" : "已有帳號？去登入"}
        </button>
        {msg && <div style={{ color:"#dc2626" }}>{msg}</div>}
      </div>
    </main>
  );
}
const inpt={ padding:10, border:"1px solid #ddd", borderRadius:10 };
const btn={ padding:10, border:"none", background:"#111", color:"#fff", borderRadius:10, cursor:"pointer" };
const btnGhost={ padding:10, border:"1px solid #ddd", background:"transparent", borderRadius:10, cursor:"pointer" };
