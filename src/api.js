// src/api.js
export const API_BASE = "https://api.topz0705.com";

// 輕量 auth 狀態存取
export const authStore = {
  get token() {
    return localStorage.getItem("token");
  },
  set token(v) {
    if (v) localStorage.setItem("token", v);
    else localStorage.removeItem("token");
  },
  clear() {
    localStorage.removeItem("token");
  },
};

// 通用請求器（自動掛 Authorization / JSON header / 錯誤處理）
async function ro(path, { method = "GET", body, headers = {} } = {}) {
  const h = { "Content-Type": "application/json", ...headers };
  if (authStore.token) h.Authorization = `Bearer ${authStore.token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: h,
    body: body ? JSON.stringify(body) : undefined,
  });

  // 嘗試解析 JSON
  let data = null;
  const text = await res.text();
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }

  if (!res.ok) {
    const msg = (data && (data.detail || data.error || data.message)) || res.statusText || "Request failed";
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const api = {
  // ---- Auth ----
  async register({ username, password, nickname }) {
    const r = await ro("/auth/register", { method: "POST", body: { username, password, nickname } });
    if (r?.token) authStore.token = r.token;
    return r;
  },
  async login({ username, password }) {
    const r = await ro("/auth/login", { method: "POST", body: { username, password } });
    if (r?.token) authStore.token = r.token;
    return r;
  },
  async me() {
    return ro("/auth/me");
  },

  // ---- Baccarat ----
  state(room) {
    return ro(`/baccarat/state?room=${encodeURIComponent(room)}`);
  },
  bet({ room, side, amount }) {
    return ro("/baccarat/bet", { method: "POST", body: { room, side, amount } });
  },
  history({ room, limit = 10 }) {
    return ro(`/baccarat/history?room=${encodeURIComponent(room)}&limit=${limit}`);
  },
  leaderboardToday() {
    return ro("/baccarat/leaderboard/today");
  },

  // ---- Admin ----
  adminGrant({ username, amount, adminToken }) {
    return ro("/baccarat/admin/grant", {
      method: "POST",
      headers: { "X-ADMIN-TOKEN": adminToken },
      body: { username, amount },
    });
  },
  adminCleanup({ mode, adminToken }) {
    return ro("/baccarat/admin/cleanup", {
      method: "POST",
      headers: { "X-ADMIN-TOKEN": adminToken },
      body: { mode },
    });
  },
  adminBalance({ username, adminToken }) {
    const h = { "X-ADMIN-TOKEN": adminToken };
    return ro(`/baccarat/admin/balance?username=${encodeURIComponent(username)}`, { headers: h });
  },
};
