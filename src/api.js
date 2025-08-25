const BASE = import.meta.env.VITE_API_BASE || "";

async function http(path, opt = {}) {
  const res = await fetch(BASE + path, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(opt.headers || {}) },
    ...opt,
    body: opt.body ? JSON.stringify(opt.body) : undefined,
  });

  if (!res.ok) {
    let payloadText = "";
    let payloadJson;
    try { payloadText = await res.text(); } catch {}
    try { payloadJson = JSON.parse(payloadText); } catch {}
    const msg =
      (payloadJson && (payloadJson.message || payloadJson.detail)) ||
      payloadText ||
      `HTTP ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.data = payloadJson || payloadText;
    throw err;
  }

  // 有些 API 204 / 空 body
  const text = await res.text();
  if (!text) return {};
  try { return JSON.parse(text); } catch { return { raw: text }; }
}

export const get  = (p) => http(p);
export const post = (p, body) => http(p, { method: "POST", body });
export const del  = (p) => http(p, { method: "DELETE" });
