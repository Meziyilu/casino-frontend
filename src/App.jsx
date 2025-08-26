import { Routes, Route, Navigate } from 'react-router-dom'
import AuthPage from './pages/AuthPage.jsx'
import Lobby from './pages/Lobby.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/auth" replace />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/lobby" element={<Lobby />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

function NotFound() {
  return (
    <main style={{padding:24, textAlign:'center', color:'#555'}}>
      <h2>頁面不存在</h2>
      <a href="/auth">回登入</a>
    </main>
  )
}
