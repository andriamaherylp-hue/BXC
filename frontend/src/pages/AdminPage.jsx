import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import { api } from '../api'

export default function AdminPage({ i18n, user, onLogout }) {
  const {t}=i18n
  const [users,setUsers]=useState([]),[overview,setOverview]=useState(null),[error,setError]=useState(''),[busy,setBusy]=useState(false),[search,setSearch]=useState('')
  const load=async()=>{setBusy(true);setError('');try{const [u,o]=await Promise.all([api('/api/admin/users/'),api('/api/admin/overview/')]);setUsers(u.users||[]);setOverview(o)}catch(e){setError(e.message)}finally{setBusy(false)}}
  useEffect(()=>{if(user?.is_staff) load()},[user?.is_staff])
  const filtered=useMemo(()=>{const q=search.trim().toLowerCase();if(!q)return users;return users.filter(x=>[x.username,x.email,x.phone,x.account_code].filter(Boolean).some(v=>String(v).toLowerCase().includes(q)))},[users,search])
  if(!user?.is_staff)return <main className="admin-page"><p>Staff access required.</p><Link to="/home">← {t.home}</Link></main>
  const toggleSuspend=async(item)=>{try{await api(`/api/admin/users/${item.id}/suspend/`,{method:'POST',body:JSON.stringify({suspended:!item.is_suspended})});load()}catch(e){setError(e.message)}}
  const toggleVerify=async(item)=>{try{await api(`/api/admin/users/${item.id}/verify/`,{method:'POST',body:JSON.stringify({verified:!item.is_verified})});load()}catch(e){setError(e.message)}}
  return <main className="app-page admin-dashboard">
    <AppHeader i18n={i18n} user={user} onLogout={onLogout}/>
    <section className="admin-dashboard-shell">
      <div className="admin-title-row"><div><p className="eyebrow">BXC Sandbox</p><h1>{t.adminDashboard}</h1><p>{t.adminDashboardSub}</p></div><button onClick={load}>{busy?t.loading:t.refresh}</button></div>
      {overview&&<div className="admin-kpis"><article><span>{t.totalUsers}</span><strong>{overview.total_users}</strong></article><article><span>{t.active}</span><strong>{overview.active_users}</strong></article><article><span>{t.suspended}</span><strong>{overview.suspended_users}</strong></article><article><span>{t.verified}</span><strong>{overview.verified_users}</strong></article><article><span>{t.demoOrders}</span><strong>{overview.demo_orders}</strong></article></div>}
      <div className="admin-toolbar"><input value={search} onChange={e=>setSearch(e.target.value)} placeholder={t.searchAccounts}/><span>{filtered.length} {t.accounts}</span></div>
      {error&&<div className="form-error">{error}</div>}
      <div className="admin-table-wrap"><table><thead><tr><th>ID</th><th>{t.accountCode}</th><th>{t.username}</th><th>{t.email}</th><th>{t.phone}</th><th>{t.staff}</th><th>{t.registration || 'Registration'}</th><th>{t.verification}</th><th>{t.status}</th><th>{t.joined}</th><th>{t.actions}</th></tr></thead><tbody>{filtered.map(item=><tr key={item.id}><td>{item.id}</td><td>{item.account_code||'—'}</td><td><b>{item.username}</b></td><td>{item.email||'—'}</td><td>{item.phone||'—'}</td><td>{item.is_staff?'Yes':'No'}</td><td><span className={`status-pill ${(item.email_verified||item.phone_verified)?'active':'pending'}`}>{item.email_verified?'Email verified':item.phone_verified?'Phone verified':'Pending'}</span></td><td><span className={`status-pill ${item.is_verified?'active':'pending'}`}>{item.is_verified?t.verified:t.notVerified}</span></td><td><span className={`status-pill ${item.is_suspended?'suspended':'active'}`}>{item.is_suspended?t.suspended:t.active}</span></td><td>{new Date(item.date_joined).toLocaleDateString()}</td><td><div className="admin-actions"><button disabled={item.id===user.id} onClick={()=>toggleSuspend(item)}>{item.is_suspended?t.restore:t.suspend}</button><button onClick={()=>toggleVerify(item)}>{item.is_verified?t.unverify:t.verify}</button></div></td></tr>)}</tbody></table></div>
      <div className="admin-safety"><strong>{t.adminSafetyTitle}</strong><p>{t.adminSafetyText}</p></div>
    </section>
  </main>
}
