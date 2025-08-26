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
      setMsg(err.message || 'Failed to fetch')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={page}>
      <form onSubmit={submit} style={card}>
        <h2 style={title}>{mode==='login' ? '登入' : '註冊'}</h2>

        <label style={label}>帳號</label>
        <input style={input} value={u} onChange={(e)=>setU(e.target.value)} required placeholder="username" />

        <label style={label}>密碼</label>
        <input style={input} type="password" value={p} onChange={(e)=>setP(e.target.value)} required placeholder="password" />

        <button style={btnPrimary} disabled={loading}>
          {loading ? '處理中…' : (mode==='login' ? '登入' : '建立帳號')}
        </button>
        <button type="button" style={btnSecondary}
                onClick={()=>setMode(mode==='login'?'register':'login')}>
          {mode==='login'?'切換到註冊':'切換到登入'}
        </button>

        {msg && <p style={errMsg}>{msg}</p>}
      </form>
    </main>
  )
}

const page = {
  minHeight:'100svh',
  display:'grid',
  placeItems:'center',
  background:'#0e0e0e',
  padding:'24px',
}
const card = {
  width:'min(420px, 92vw)',
  background:'#1b1b1b',
  color:'#fff',
  padding:'20px',
  borderRadius:'14px',
  boxShadow:'0 10px 40px rgba(0,0,0,.5)',
}
const title = { margin:'0 0 12px 0', textAlign:'center' }
const label = { fontSize:12, opacity:.8, marginTop:10, display:'block' }
const input = {
  width:'100%',
  marginTop:6,
  padding:'12px',
  borderRadius:10,
  border:'1px solid #333',
  background:'#0f0f0f',
  color:'#fff',
  outline:'none',
}
const btnPrimary = {
  marginTop:16, width:'100%', padding:'12px',
  borderRadius:10, border:'none', background:'#2b6cb0', color:'#fff', cursor:'pointer'
}
const btnSecondary = {
  marginTop:10, width:'100%', padding:'12px',
  borderRadius:10, border:'none', background:'#555', color:'#fff', cursor:'pointer'
}
const errMsg = { color:'#e55', marginTop:10, textAlign:'center' }
