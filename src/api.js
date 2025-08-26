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
  // auth
  register: (data) => req("/auth/register", { method: "POST", body: JSON.stringify(data) }),
  login:    (data) => req("/auth/login",    { method: "POST", body: JSON.stringify(data) }),

  // lobby
  lobbySummary: () => req("/lobby/summary"),

  // admin
  adminStats:  (token) => req("/admin/stats",  { headers: { "X-Admin-Token": token } }),
  adminUsers:  (token, body) => req("/admin/users", {
    method: "POST",
    headers: { "X-Admin-Token": token },
    body: JSON.stringify(body),
  }),
  adminGrant:  (token, uid, amount) => req(`/admin/users/${uid}/grant`, {
    method: "POST", headers: { "X-Admin-Token": token },
    body: JSON.stringify({ amount }),
  }),
  adminSetBal: (token, uid, balance) => req(`/admin/users/${uid}/set-balance`, {
    method: "POST", headers: { "X-Admin-Token": token },
    body: JSON.stringify({ balance }),
  }),
  adminResetPw:(token, uid, new_password) => req(`/admin/users/${uid}/reset-password`, {
    method: "POST", headers: { "X-Admin-Token": token },
    body: JSON.stringify({ new_password }),
  }),
  adminDelete: (token, uid) => req(`/admin/users/${uid}`, {
    method: "DELETE", headers: { "X-Admin-Token": token },
  }),
};
