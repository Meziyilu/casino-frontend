// src/api.js
function readBase() {
  // 移除尾端斜線，避免 //auth/login
  const v = (import.meta.env?.VITE_API_BASE || "").trim().replace(/\/+$/, "");
  return v;
}

export function apiBase() {
  const base = readBase();
  // 若沒設 VITE_API_BASE，就 fallback 到同網域（方便本地或反代）
  return base || window.location.origin;
}

async function parseErrorResponse(r) {
  try {
    const cloned = r.clone();
    const ct = cloned.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      const data = await cloned.json();
      const msg = data?.message ?? data?.detail ?? data?.error ?? (typeof data === "string" ? data : "");
      if (msg) return msg;
    } else {
      const text = await cloned.text();
      if (text) return text;
    }
  } catch (_) {}
  return `HTTP ${r.status}`;
}

async function doFetch(url, init) {
  try {
    const r = await fetch(url, init);
    if (!r.ok) {
      const msg = await parseErrorResponse(r);
      const err = new Error(msg || `HTTP ${r.status}`);
      err.status = r.status;
      err.url = url;
      throw err;
    }
    // 有些 API 會回空字串
    const text = await r.text().catch(() => "");
    if (!text) return null;
    try { return JSON.parse(text); } catch { return text; }
  } catch (e) {
    // 走到這裡通常是：DNS/網路/CORS/URL 錯（fetch 連不上）
    if (!(e instanceof Error)) throw e;
    // 明確提示目前 API base 與請求網址
    const base = apiBase();
    const hint = `Network error: ${e.message || e}. apiBase=${base}`;
    const err = new Error(hint);
    err.cause = e;
    throw err;
  }
}

export async function get(path, token) {
  const url = `${apiBase()}${path}`;
  return doFetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

export async function post(path, body, token) {
  const url = `${apiBase()}${path}`;
  return doFetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body ?? {}),
  });
}
