import { useEffect, useState } from 'react'
import { api } from '../api'
import { useNavigate } from 'react-router-dom'

export default function Lobby() {
  const nav = useNavigate()
  const [me, setMe] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const t = localStorage.getItem('token')
    if (!t) { nav('/auth', { replace:true }); return }
    api.me(t).then(setMe).catch(err => setError(err.message))
  }, [])

  return (
    <main style={wrap}>
      <div style={box}>
        <h2>🎲 遊戲大廳</h2>
        <p style={{opacity:.8}}>目前僅開放登入/註冊，遊戲尚未開放。</p>
        {me && <p style={{marginTop:8}}>歡迎，{me.nickname || me.username}</p>}
        {error && <p style={{color:'#d33'}}>{error}</p>}
        <button style={btn} onClick={() => { localStorage.removeItem('token'); location.href='/auth' }}>
          登出
        </button>
      </div>
    </main>
  )
}

const wrap = { minHeight:'100vh', display:'grid', placeItems:'center', background:'#101010', color:'#fff' }
const box = { width:420, padding:24, background:'#1b1b1b', borderRadius:12, textAlign:'center',
  boxShadow:'0 10px 30px rgba(0,0,0,.4)' }
const btn = { marginTop:14, padding:'10px 16px', borderRadius:8, border:'none', background:'#444',
  color:'#fff', cursor:'pointer' }
