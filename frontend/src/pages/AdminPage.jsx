import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import Brand from '../components/Brand'

export default function AdminPage({ i18n, user }) {
  const {t}=i18n
  const [users,setUsers]=useState([]), [error,setError]=useState(''), [busy,setBusy]=useState(false)
  const load=async()=>{setBusy(true);setError('');try{const d=await api('/api/admin/users/');setUsers(d.users||[])}catch(e){setError(e.message)}finally{setBusy(false)}}
  useEffect(()=>{if(user?.is_staff) load()},[user?.is_staff])
  if(!user?.is_staff) return <main className="admin-page"><p>Staff access required.</p><Link to="/home">← Home</Link></main>
  const toggle=async(item)=>{try{await api(`/api/admin/users/${item.id}/suspend/`,{method:'POST',body:JSON.stringify({suspended:!item.is_suspended})});load()}catch(e){setError(e.message)}}
  return <main className="admin-page"><header><Brand/><div><Link to="/home">← {t.home}</Link><button onClick={load}>{t.refresh}</button></div></header><section className="admin-shell"><h1>{t.admin}</h1>{error&&<div className="form-error">{error}</div>}<div className="admin-table-wrap"><table><thead><tr><th>ID</th><th>{t.username}</th><th>{t.email}</th><th>{t.phone}</th><th>{t.staff}</th><th>{t.status}</th><th>{t.joined}</th><th>{t.actions}</th></tr></thead><tbody>{users.map(item=><tr key={item.id}><td>{item.id}</td><td>{item.username}</td><td>{item.email||'—'}</td><td>{item.phone||'—'}</td><td>{item.is_staff?'Yes':'No'}</td><td><span className={`status-pill ${item.is_suspended?'suspended':'active'}`}>{item.is_suspended?t.suspended:t.active}</span></td><td>{new Date(item.date_joined).toLocaleDateString()}</td><td><button disabled={item.id===user.id} onClick={()=>toggle(item)}>{item.is_suspended?t.restore:t.suspend}</button></td></tr>)}</tbody></table></div>{busy&&<p>Loading…</p>}</section></main>
}
