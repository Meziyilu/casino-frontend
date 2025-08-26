// src/api.js
export const API_BASE = "https://api.topz0705.com";

export const authStore = {
  get token() { return localStorage.getItem("token"); },
  set token(v) { v ? localStorage.setItem("token", v) : localStorage.removeItem("token"); },
  clear() { localStorage.removeItem("token"); }
};

async function ro(path, { method = "GET", body, headers = {} } = {}) {
  const h = { "Content-Type": "application/json", ...headers };
  if (authStore.token) h.Authorization = `Bearer ${authStore.token}`;
  const res = await fetch(`${API_BASE}${path}`, {
    method, headers: h, body: body ? JSON.stringify(body) : undefined
  });
  const tx = await res.text();
  let data = null; try { data = tx ? JSON.parse(tx) : null; } catch { data = { raw: tx }; }
  if (!res.ok) { const msg = data?.detail || data?.error || res.statusText; const e = new Error(msg); e.status = res.status; e.data = data; throw e; }
  return data;
}

export const api = {
  // auth
  register({ username, password, nickname }) { return ro(`/auth/register`, { method: "POST", body: { username, password, nickname } }); },
  login({ username, password }) { return ro(`/auth/login`, { method: "POST", body: { username, password } }); },
  me() { return ro(`/auth/me`); },

  // lobby / rooms
  rooms() { return ro(`/baccarat/rooms`); },
  state(room) { return ro(`/baccarat/state?room=${encodeURIComponent(room)}`); },
  bet({ room, side, amount }) { return ro(`/baccarat/bet`, { method: "POST", body: { room, side, amount } }); },
  history({ room, limit = 10 }) { return ro(`/baccarat/history?room=${encodeURIComponent(room)}&limit=${limit}`); },
  leaderboardToday() { return ro(`/baccarat/leaderboard/today`); },

  // admin
  adminGrant({ username, amount, adminToken }) {
    return ro(`/baccarat/admin/grant`, { method: "POST", headers: { "X-ADMIN-TOKEN": adminToken }, body: { username, amount } });
  },
  adminCleanup({ mode, adminToken }) {
    return ro(`/baccarat/admin/cleanup`, { method: "POST", headers: { "X-ADMIN-TOKEN": adminToken }, body: { mode } });
  },
  adminBalance({ username, adminToken }) {
    return ro(`/baccarat/admin/balance?username=${encodeURIComponent(username)}`, { headers: { "X-ADMIN-TOKEN": adminToken } });
  },
};
