export function apiBase() {
  // 若 VITE_API_BASE 空字串，代表同網域（反向代理或同主機）
  // 若不同域，填寫 render.yaml 裡的 VITE_API_BASE
  return import.meta.env.VITE_API_BASE || "";
}

async function handle(r) {
  if (!r.ok) {
    const t = await r.text().catch(()=> "");
    const msg = t || `HTTP ${r.status}`;
    const err = new Error(msg);
    err.status = r.status;
    throw err;
  }
  return r.json();
}

export async function get(path, token) {
  return handle(fetch(`${apiBase()}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    credentials: "include",
  }));
}

export async function post(path, body, token) {
  return handle(fetch(`${apiBase()}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
    credentials: "include",
  }));
}
