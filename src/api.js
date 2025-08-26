// src/api.js
const API_BASE =
  import.meta.env.VITE_API_BASE ||
  "https://api.topz0705.com";

function withCreds(opts = {}) {
  const token = localStorage.getItem("jwt") || "";
  return {
    ...opts,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(opts.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
}

async function safeFetch(url, opts = {}, { signal } = {}) {
  try {
    const res = await fetch(url, { ...withCreds(opts), signal });
    // 後端錯誤也要吞，回給呼叫端判斷
    if (!res.ok) {
      // 盡量讀出 json 錯誤訊息，但不要 throw
      let detail = null;
      try { detail = await res.json(); } catch {}
      return { ok: false, status: res.status, detail };
    }
    const data = await res.json();
    return { ok: true, data };
  } catch (err) {
    // CORS / 連線中斷 / 超時 等
    return { ok: false, error: err?.message || "fetch failed" };
  }
}

export const api = {
  async rooms({ signal } = {}) {
    const r = await safeFetch(`${API_BASE}/baccarat/rooms`, {}, { signal });
    if (!r.ok) return null;
    return r.data?.rooms || null;
  },
  async me({ signal } = {}) {
    const r = await safeFetch(`${API_BASE}/auth/me`, {}, { signal });
    if (!r.ok) return null;
    return r.data || null;
  },
  async login(username, password) {
    const r = await safeFetch(`${API_BASE}/auth/login`, {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    if (!r.ok) return { ok: false, error: r.detail || r.status || "login failed" };
    // 後端會 Set-Cookie 或回 JWT（看你的實作）
    // 若有回 token，記到 localStorage
    if (r.data?.token) localStorage.setItem("jwt", r.data.token);
    return { ok: true, data: r.data };
  },
  async logout() {
    localStorage.removeItem("jwt");
    return { ok: true };
  },
};
