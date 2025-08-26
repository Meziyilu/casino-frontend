// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/ui.css'  // ✅ 這裡匯入一次就好

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
