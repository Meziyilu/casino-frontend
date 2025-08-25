// src/api.js
export function apiBase() {
  return import.meta.env.VITE_API_BASE || "";
}

async function parseError(r) {
  try {
    const data = await r.clone().json();
    const msg = data?.message ?? data?.detail ?? data?.error ?? (typeof data === "string" ? data : "");
    if (msg) return msg;
  } catch (_) {}
  try {
    const t = await r.text();
    if (t) return t;
  } catch (_) {}
  return `HTTP ${r.status}`;
}

async function handle(r) {
  if (!r.ok) {
    const msg = await parseError(r);
    const err = new Error(msg);
    err.status = r.status;
    throw err;
  }
  const text = await r.text().catch(() => "");
  if (!text) return null;
  try { return JSON.parse(text); } catch { return text; }
}

export async function get(path, token) {
  return handle(fetch(`${apiBase()}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  }));
}

export async function post(path, body, token) {
  return handle(fetch(`${apiBase()}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body ?? {}),
  }));
}
