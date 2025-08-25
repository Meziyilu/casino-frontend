// src/api.js
export function apiBase() {
  return import.meta.env.VITE_API_BASE || "";
}

async function parseError(r) {
  // 優先嘗試 JSON -> 再退回 text
  try {
    const data = await r.clone().json();
    // 從常見欄位找 message
    const msg =
      data?.message ??
      data?.detail ??
      data?.error ??
      (typeof data === "string" ? data : "");
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
  // 有些 API（例如 204）沒有 body
  const text = await r.text().catch(() => "");
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function get(path, token) {
  return handle(
    fetch(`${apiBase()}${path}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      credentials: "include",
    })
  );
}

export async function post(path, body, token) {
  return handle(
    fetch(`${apiBase()}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body ?? {}),
      credentials: "include",
    })
  );
}
