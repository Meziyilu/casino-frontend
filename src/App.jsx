// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import Lobby from "./pages/Lobby";
import AdminPage from "./pages/AdminPage";

export default function App(){
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/auth" replace/>} />
        <Route path="/auth" element={<AuthPage/>} />
        <Route path="/lobby" element={<Lobby/>} />
        <Route path="/admin" element={<AdminPage/>} />
        <Route path="*" element={<div style={{color:"#fff",padding:24}}>Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}
