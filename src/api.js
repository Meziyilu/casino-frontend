// 簡單 API 包裝：統一 base 與錯誤處理
export const API_BASE = import.meta.env.VITE_API_BASE || "https://api.topz0705.com";

async function ro(path, opts = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
    ...opts,
  });
  let data = null;
  try { data = await res.json(); } catch {}
  if (!res.ok) throw new Error((data && (data.detail || data.error)) || `HTTP ${res.status}`);
  return data;
}

export const api = {
  register: ({ username, password }) =>
    ro("/auth/register", { method: "POST", body: JSON.stringify({ username, password }) }),
  login: ({ username, password }) =>
    ro("/auth/login", { method: "POST", body: JSON.stringify({ username, password }) }),
  me: (username) => ro(`/me?username=${encodeURIComponent(username)}`),
};
