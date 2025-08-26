// src/api.js
const BASE = import.meta.env.VITE_API_BASE || "https://api.topz0705.com";

// 取得/設定 token
export const authStore = {
  get() {
    return localStorage.getItem("token") || "";
  },
  set(t) {
    if (t) localStorage.setItem("token", t);
  },
  clear() {
    localStorage.removeItem("token");
  },
};

async function j(path, opt = {}) {
  const headers = { "Content-Type": "application/json", ...(opt.headers || {}) };
  const token = authStore.get();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(BASE + path, { ...opt, headers });
  const ct = res.headers.get("content-type") || "";
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      if (ct.includes("application/json")) {
        const jj = await res.json();
        msg = JSON.stringify(jj);
      } else {
        const t = await res.text();
        if (t) msg = t;
      }
    } catch {}
    throw new Error(msg);
  }
  if (!ct.includes("application/json")) return null;
  return res.json();
}

// ----- Auth -----
async function register(username, password, nickname) {
  // ⚠️ 扁平 JSON，不要再包一層
  return j("/auth/register", {
    method: "POST",
    body: JSON.stringify({ username, password, nickname }),
  });
}
async function login(username, password) {
  return j("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}
async function me() {
  return j("/auth/me");
}
async function logout() {
  authStore.clear();
  return true;
}

// ----- Baccarat（先列房間、狀態；進房頁之後再接） -----
async function rooms() {
  return j("/baccarat/rooms");
}
async function state(room) {
  return j(`/baccarat/state?room=${encodeURIComponent(room)}`);
}

export const api = { register, login, me, logout, rooms, state };
export default api;
