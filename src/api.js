const BASE = import.meta.env.VITE_API_BASE
if (!BASE) console.error('缺少 VITE_API_BASE，請在 .env.production 設定後端網址')

async function jfetch(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    ...opts,
  })
  const text = await res.text().catch(() => '')
  let data; try { data = text ? JSON.parse(text) : null } catch { data = { raw: text } }
  if (!res.ok) throw new Error(data?.detail || data?.message || `HTTP ${res.status}`)
  return data
}

export const api = {
  register: (u,p) => jfetch('/auth/register', { method:'POST', body: JSON.stringify({ username:u, password:p }) }),
  login:    (u,p) => jfetch('/auth/login',    { method:'POST', body: JSON.stringify({ username:u, password:p }) }),
  me:       (t)   => jfetch(`/me?token=${encodeURIComponent(t||'')}`),
}
