import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'

export default function AuthPage() {
  const nav = useNavigate()
  const [mode, setMode] = useState('login')
  const [u, setU] = useState('')
  const [p, setP] = useState('')
  const [msg, setMsg] = useState(null)
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setMsg(null); setLoading(true)
    try {
      if (mode === 'register') {
        await api.register(u, p)
        setMsg('註冊成功，請登入'); setMode('login')
      } else {
        const r = await api.login(u, p)
        localStorage.setItem('token', r.token)
        nav('/lobby', { replace: true })
      }
    } catch (err) {
      setMsg(err.message || '發生錯誤')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={wrap}>
      <form onSubmit={submit} style={card}>
        <h2 style={{marginBottom:12}}>{mode==='login' ? '登入' : '註冊'}</h2>
        <label style={label}>帳號</label>
        <input style={input} value={u} onChange={(e)=>setU(e.target.value)} required />
        <label style={label}>密碼</label>
        <input style={input} type="password" value={p} onChange={(e)=>setP(e.target.value)} required />
        <button style={btn} disabled={loading}>{loading?'處理中…':(mode==='login'?'登入':'建立帳號')}</button>
        <button type="button" style={{...btn, background:'#666'}}
                onClick={()=>setMode(mode==='login'?'register':'login')}>
          {mode==='login'?'切換到註冊':'切換到登入'}
        </button>
        {msg && <p style={{color:'#d33', marginTop:8}}>{msg}</p>}
      </form>
    </main>
  )
}

const wrap = { minHeight:'100vh', display:'grid', placeItems:'center', background:'#111' }
const card = { width:330, background:'#1b1b1b', color:'#fff', padding:20, borderRadius:12,
  boxShadow:'0 8px 30px rgba(0,0,0,.4)' }
const label = { fontSize:12, opacity:.75, marginTop:10 }
const input = { marginTop:4, padding:'10px 12px', borderRadius:8, border:'1px solid #333',
  background:'#0e0e0e', color:'#fff', outline:'none' }
const btn = { marginTop:14, width:'100%', padding:'10px 12px', borderRadius:8, border:'none',
  background:'#2b6cb0', color:'#fff', cursor:'pointer' }
