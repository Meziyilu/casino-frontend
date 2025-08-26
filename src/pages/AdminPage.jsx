// src/pages/AdminPage.jsx
import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import "../styles/ui.css"; // 沿用你的樣式

export default function AdminPage() {
  const [token, setToken] = useState(() => sessionStorage.getItem("ADMIN_TOKEN") || "");
  const [inputToken, setInputToken] = useState("");
  const [stats, setStats] = useState(null);
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [err, setErr] = useState("");

  const pages = useMemo(() => Math.max(1, Math.ceil(total / size)), [total, size]);

  const needToken = !token;

  async function loadAll(p = page, keyword = q) {
    if (!token) return;
    try {
      setErr("");
      const s = await api.adminStats(token);
      setStats(s.stats);
      const u = await api.adminUsers(token, { q: keyword, page: p, size });
      setItems(u.items);
      setTotal(u.total);
      setPage(u.page);
    } catch (e) {
      setErr(e.message || String(e));
    }
  }

  useEffect(() => { if (token) loadAll(1, ""); }, [token]);

  function applyToken() {
    if (!inputToken.trim()) return;
    sessionStorage.setItem("ADMIN_TOKEN", inputToken.trim());
    setToken(inputToken.trim());
  }

  async function doGrant(id) {
    const v = prompt("加幣（可負數扣款）", "100");
    if (!v) return;
    const n = Number(v);
    if (Number.isNaN(n)) return alert("請輸入數字");
    await api.adminGrant(token, id, n);
    await loadAll();
  }

  async function doSetBal(id) {
    const v = prompt("設定餘額", "1000");
    if (!v) return;
    const n = Number(v);
    if (Number.isNaN(n)) return alert("請輸入數字");
    await api.adminSetBal(token, id, n);
    await loadAll();
  }

  async function doResetPw(id) {
    const v = prompt("重設密碼為：", "12345678");
    if (!v) return;
    await api.adminResetPw(token, id, v);
    alert("已重設");
  }

  async function doDelete(id) {
    if (!confirm("確定要刪除此帳號？")) return;
    await api.adminDelete(token, id);
    await loadAll();
  }

  return (
    <div className="lobby-bg">
      <div className="glow g1"></div><div className="glow g2"></div><div className="glow g3"></div>

      <div className="lobby-shell">
        <div className="lobby-header">
          <div className="brand">
            <div className="logo">🛠️</div>
            <div className="brand-name">管理面板</div>
          </div>

          <div className="userbar">
            {needToken ? (
              <div style={{display:"flex", gap:8}}>
                <input className="auth-input" placeholder="輸入 ADMIN_TOKEN" value={inputToken} onChange={e=>setInputToken(e.target.value)} style={{width:240}}/>
                <button className="btn primary" onClick={applyToken}>解鎖</button>
              </div>
            ) : (
              <>
                <div className="chip"><span className="chip-label">狀態</span><span className="chip-value">已驗證</span></div>
                <button className="logout" onClick={() => { sessionStorage.removeItem("ADMIN_TOKEN"); setToken(""); }}>登出</button>
              </>
            )}
          </div>
        </div>

        {!needToken && (
          <>
            <div className="toolbar">
              <div className="search">
                <span className="icon">🔎</span>
                <input placeholder="搜尋帳號/暱稱…" value={q} onChange={e=>setQ(e.target.value)}
                  onKeyDown={(e)=>{ if(e.key==="Enter") loadAll(1,q); }}/>
              </div>
              <button className="btn" onClick={()=>loadAll(1,q)}>搜尋</button>
              <button className="btn" onClick={()=>{ setQ(""); loadAll(1,""); }}>清空</button>
              <button className="btn primary" onClick={()=>loadAll()}>重新整理</button>
            </div>

            {err && <div className="notice error">錯誤：{err}</div>}

            <div className="hero">
              <div className="hero-title">系統統計</div>
              <div className="hero-row">
                <div className="stat"><div className="stat-val">{stats?.totalUsers ?? "-"}</div><div className="stat-lab">總會員</div></div>
                <div className="stat"><div className="stat-val">{stats?.todayNewUsers ?? "-"}</div><div className="stat-lab">今日新註冊</div></div>
                <div className="stat"><div className="stat-val">{stats ? stats.totalBalance.toLocaleString() : "-"}</div><div className="stat-lab">總餘額</div></div>
              </div>
            </div>

            <div className="panel">
              <div className="panel-title">會員清單</div>

              <div className="grid">
                {items.map(u => (
                  <div key={u.id} className="tile">
                    <div className="tile-title">{u.username} <span className="badge online">USER</span></div>
                    <div className="tile-desc">暱稱：{u.nickname || "-"}</div>
                    <div className="tile-desc">餘額：<b>{u.balance.toLocaleString()}</b></div>
                    <div className="tile-desc">註冊：{new Date(u.created_at).toLocaleString()}</div>

                    <div className="tile-foot">
                      <div className="tile-meta"><span className="meta-people">🆔 {u.id}</span></div>
                      <div className="tile-cta">
                        <button className="btn success" onClick={()=>doGrant(u.id)}>加幣</button>
                        <button className="btn" onClick={()=>doSetBal(u.id)}>設餘額</button>
                        <button className="btn warn" onClick={()=>doResetPw(u.id)}>重設密碼</button>
                        <button className="btn" onClick={()=>doDelete(u.id)}>刪除</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 分頁 */}
              <div style={{display:"flex", gap:10, marginTop:12, alignItems:"center", justifyContent:"flex-end"}}>
                <button className="btn" disabled={page<=1} onClick={()=>loadAll(page-1,q)}>上一頁</button>
                <div className="chip">第 {page} / {pages} 頁（共 {total} 筆）</div>
                <button className="btn" disabled={page>=pages} onClick={()=>loadAll(page+1,q)}>下一頁</button>
              </div>
            </div>
          </>
        )}

        {needToken && (
          <div className="empty">請先輸入 <b>ADMIN_TOKEN</b> 解鎖管理面板。</div>
        )}

        <div className="lobby-footer">
          <div className="muted">© 2025 TOPZ</div>
          <div>Admin Console</div>
        </div>
      </div>
    </div>
  );
}
