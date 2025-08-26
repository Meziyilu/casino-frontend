// src/api.js
const BASE = import.meta.env.VITE_API_BASE || "https://api.topz0705.com";

async function req(path, opt = {}) {
  const r = await fetch(BASE + path, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(opt.headers || {}) },
    ...opt,
  });
  if (!r.ok) {
    let msg = `HTTP ${r.status}`;
    try { const j = await r.json(); msg = j.detail || j.message || msg; } catch {}
    throw new Error(msg);
  }
  return r.json();
}

export const api = {
  register: (data) => req("/auth/register", { method: "POST", body: JSON.stringify(data) }),
  login:    (data) => req("/auth/login",    { method: "POST", body: JSON.stringify(data) }),
  lobbySummary: () => req("/lobby/summary"),
  // …（若有 admin API 也放這裡）
};
