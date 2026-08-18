import { useCallback, useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { api, ensureCsrf } from './api'
import { useI18n } from './i18n'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import HomePage from './pages/HomePage'
import FeaturesPage from './pages/FeaturesPage'
import MarketPage from './pages/MarketPage'
import MarketDetailPage from './pages/MarketDetailPage'
import CryptoEtfPage from './pages/CryptoEtfPage'
import LoanPage from './pages/LoanPage'
import FinancialPage from './pages/FinancialPage'
import AccountPage from './pages/AccountPage'
import AdminPage from './pages/AdminPage'
import InviteFriendsPage from './pages/InviteFriendsPage'
import HelpCenterPage from './pages/HelpCenterPage'

function AppRoutes() {
  const i18n = useI18n()
  const [user,setUser]=useState(null), [ready,setReady]=useState(false)
  const navigate=useNavigate()

  const refreshUser=useCallback(async()=>{
    try{const d=await api('/api/auth/me/');setUser(d.user);return d.user}catch(_){setUser(null);return null}
  },[])

  useEffect(()=>{let alive=true;(async()=>{try{await ensureCsrf();const d=await api('/api/auth/me/');if(alive)setUser(d.user)}catch(_){if(alive)setUser(null)}finally{if(alive)setReady(true)}})();return()=>{alive=false}},[])
  const logout=async()=>{try{await api('/api/auth/logout/',{method:'POST',body:'{}'})}finally{setUser(null);navigate('/')}}
  if(!ready) return <div className="app-loading">BXC</div>

  const protectedProps={i18n,user,onLogout:logout,onUserRefresh:refreshUser}
  return <Routes>
    <Route path="/" element={user?<Navigate to="/home" replace/>:<LoginPage i18n={i18n} onLogin={setUser}/>}/>
    <Route path="/register" element={user?<Navigate to="/home" replace/>:<RegisterPage i18n={i18n} onLogin={setUser}/>}/>
    <Route path="/home" element={user?<HomePage {...protectedProps}/>:<Navigate to="/" replace/>}/>
    <Route path="/features" element={user?<FeaturesPage {...protectedProps}/>:<Navigate to="/" replace/>}/>
    <Route path="/market" element={user?<MarketPage {...protectedProps}/>:<Navigate to="/" replace/>}/>
    <Route path="/market/:category/:code" element={user?<MarketDetailPage {...protectedProps}/>:<Navigate to="/" replace/>}/>
    <Route path="/crypto-etf" element={user?<CryptoEtfPage {...protectedProps}/>:<Navigate to="/" replace/>}/>
    <Route path="/loan" element={user?<LoanPage {...protectedProps}/>:<Navigate to="/" replace/>}/>
    <Route path="/financial" element={user?<FinancialPage {...protectedProps}/>:<Navigate to="/" replace/>}/>
    <Route path="/account" element={user?<AccountPage {...protectedProps}/>:<Navigate to="/" replace/>}/>
    <Route path="/invite" element={user?<InviteFriendsPage {...protectedProps}/>:<Navigate to="/" replace/>}/>
    <Route path="/help-center" element={user?<HelpCenterPage {...protectedProps}/>:<Navigate to="/" replace/>}/>
    <Route path="/admin" element={user?<AdminPage {...protectedProps}/>:<Navigate to="/" replace/>}/>
    <Route path="*" element={<Navigate to={user?'/home':'/'} replace/>}/>
  </Routes>
}

export default function App(){return <BrowserRouter><AppRoutes/></BrowserRouter>}
