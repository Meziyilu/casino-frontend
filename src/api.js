// src/api.js
const API = (import.meta.env.VITE_API_BASE || "").replace(/\/$/, "");

async function handle(res) {
  const text = await res.text();
  if (!res.ok) {
    let msg = text || `HTTP ${res.status}`;
    try {
      const j = text ? JSON.parse(text) : {};
      msg = j.detail || msg;
    } catch {}
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }
  return text ? JSON.parse(text) : {};
}

export function apiBase() {
  return API;
}

export async function post(path, body, token) {
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  return handle(res);
}

export async function get(path, token) {
  const res = await fetch(`${API}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return handle(res);
}
