// src/api.js
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

async function ro(path, opts = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    ...opts,
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export const api = {
  register: ({ username, password }) =>
    ro("/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  login: ({ username, password }) =>
    ro("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  me: (username) => ro(`/me?username=${encodeURIComponent(username)}`),
};

// 同時匯出 default，方便 import api from "../api"
export default api;
