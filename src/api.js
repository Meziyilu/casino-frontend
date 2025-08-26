// src/api.js
const BASE = import.meta.env.VITE_API_BASE || "https://api.topz0705.com";

async function j(path, opt = {}) {
  const res = await fetch(BASE + path, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(opt.headers || {}) },
    ...opt,
  });
  // 盡量把錯誤訊息傳出來
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const t = await res.text();
      if (t) msg = t;
    } catch {}
    throw new Error(msg);
  }
  // 有些 204 無內容
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) return null;
  return res.json();
}

// -------- Auth / User --------
async function login(username, password) {
  return j("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

async function register(username, password, nickname) {
  return j("/auth/register", {
    method: "POST",
    body: JSON.stringify({ username, password, nickname }),
  });
}

async function me() {
  return j("/me"); // 你的後端已實作 /me
}

async function logout() {
  // 若後端沒有 /auth/logout，可直接清除前端 token；這裡留著以後擴充
  try {
    await j("/auth/logout", { method: "POST" });
  } catch (_) {}
  return true;
}

// -------- Baccarat --------
export const baccarat = {
  rooms: () => j("/baccarat/rooms"),
  state: (room) => j(`/baccarat/state?room=${encodeURIComponent(room)}`),
  reveal: (room) => j(`/baccarat/reveal?room=${encodeURIComponent(room)}`),
  history: (room, limit = 10) =>
    j(`/baccarat/history?room=${encodeURIComponent(room)}&limit=${limit}`),
  bet: (room, side, amount, userId) =>
    j("/baccarat/bet", {
      method: "POST",
      body: JSON.stringify({ room, side, amount }),
      headers: { "X-User-Id": String(userId ?? "") },
    }),
};

// 統一聚合成一個物件，並且「具名匯出」與「預設匯出」都提供
export const api = { login, register, me, logout, baccarat };
export default api;
