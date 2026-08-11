import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { api, ensureCsrf } from './api'
import { useI18n } from './i18n'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import HomePage from './pages/HomePage'
import AdminPage from './pages/AdminPage'

function AppRoutes() {
  const i18n = useI18n()
  const [user,setUser]=useState(null), [ready,setReady]=useState(false)
  const navigate=useNavigate()
  useEffect(()=>{let alive=true;(async()=>{try{await ensureCsrf();const d=await api('/api/auth/me/');if(alive)setUser(d.user)}catch(_){if(alive)setUser(null)}finally{if(alive)setReady(true)}})();return()=>{alive=false}},[])
  const logout=async()=>{try{await api('/api/auth/logout/',{method:'POST',body:'{}'})}finally{setUser(null);navigate('/')}}
  if(!ready) return <div className="app-loading">DXC</div>
  return <Routes>
    <Route path="/" element={user?<Navigate to="/home" replace/>:<LoginPage i18n={i18n} onLogin={setUser}/>}/>
    <Route path="/register" element={user?<Navigate to="/home" replace/>:<RegisterPage i18n={i18n} onLogin={setUser}/>}/>
    <Route path="/home" element={user?<HomePage i18n={i18n} user={user} onLogout={logout}/>:<Navigate to="/" replace/>}/>
    <Route path="/admin" element={user?<AdminPage i18n={i18n} user={user}/>:<Navigate to="/" replace/>}/>
    <Route path="*" element={<Navigate to={user?'/home':'/'} replace/>}/>
  </Routes>
}

export default function App(){return <BrowserRouter><AppRoutes/></BrowserRouter>}
