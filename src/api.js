// src/api.js
const API_BASE =
  import.meta.env.VITE_API_BASE ||
  "https://api.topz0705.com";

function authHeaders(extra = {}) {
  const t = localStorage.getItem("token");
  const h = {
    "Content-Type": "application/json",
    ...extra,
  };
  if (t) h.Authorization = `Bearer ${t}`;
  return h;
}

async function rq(path, opt = {}) {
  const res = await fetch(`${API_BASE}${path}`, opt);
  // 嘗試解析 JSON，避免 204/空字串直接 throw
  let data = null;
  try { data = await res.json(); } catch { /* ignore */ }
  if (!res.ok) {
    const msg = (data && (data.detail || data.error)) || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

export const api = {
  // ---- Auth ----
  async register({ username, password, nickname }) {
    return rq(`/auth/register`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ username, password, nickname }),
    });
  },
  async login({ username, password }) {
    return rq(`/auth/login`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ username, password }),
    });
  },
  async me() {
    return rq(`/auth/me`, { headers: authHeaders() });
  },

  // ---- Baccarat ----
  async getState(room) {
    return rq(`/baccarat/state?room=${encodeURIComponent(room)}`, {
      headers: authHeaders(),
    });
  },
  async bet({ room, side, amount }) {
    return rq(`/baccarat/bet`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ room, side, amount }),
    });
  },
  async history(room, limit = 10) {
    return rq(`/baccarat/history?room=${encodeURIComponent(room)}&limit=${limit}`, {
      headers: authHeaders(),
    });
  },

  // ---- Leaderboard ----
  async leaderboardToday() {
    return rq(`/leaderboard/today`, { headers: authHeaders() });
  },

  // ---- Admin ----
  async grant({ username, amount, adminToken }) {
    return rq(`/admin/grant`, {
      method: "POST",
      headers: authHeaders({ "X-ADMIN-TOKEN": adminToken }),
      body: JSON.stringify({ username, amount }),
    });
  },
  async cleanup({ mode, adminToken }) {
    return rq(`/admin/cleanup`, {
      method: "POST",
      headers: authHeaders({ "X-ADMIN-TOKEN": adminToken }),
      body: JSON.stringify({ mode }),
    });
  },
  async queryBalance({ username, adminToken }) {
    return rq(`/admin/balance?username=${encodeURIComponent(username)}`, {
      headers: authHeaders({ "X-ADMIN-TOKEN": adminToken }),
    });
  },
};
