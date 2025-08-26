// src/api.js
const BASE = import.meta.env.VITE_API_BASE || "https://api.topz0705.com";

async function j(path, opt = {}) {
  const res = await fetch(BASE + path, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(opt.headers || {}) },
    ...opt,
  });
  if (!res.ok) throw new Error(await res.text().catch(()=>"HTTP " + res.status));
  return res.json();
}

// 你原本的 auth / lobby 函數…（保留）

// --- Baccarat ---
export const baccarat = {
  rooms: () => j("/baccarat/rooms"),
  state: (room) => j(`/baccarat/state?room=${encodeURIComponent(room)}`),
  reveal: (room) => j(`/baccarat/reveal?room=${encodeURIComponent(room)}`),
  history: (room, limit=10) => j(`/baccarat/history?room=${encodeURIComponent(room)}&limit=${limit}`),
  bet: (room, side, amount, userId) =>
    j("/baccarat/bet", {
      method: "POST",
      body: JSON.stringify({ room, side, amount }),
      headers: { "X-User-Id": String(userId) } // 暫用，若你已用 session 可移除
    }),
};

export default { baccarat /*, ...其他*/ };
