import { useEffect, useState } from 'react'
import AppHeader from '../components/AppHeader'
import SiteFooter from '../components/SiteFooter'
import { api } from '../api'

const ORDER_TABS=['All orders','Contracts','Options','Crypto ETF','Wallet Income','My Investments','Spot Orders']

export default function AccountPage({ i18n, user, onLogout, onUserRefresh }) {
  const {t}=i18n
  const [summary,setSummary]=useState(null)
  const [orders,setOrders]=useState([])
  const [funding,setFunding]=useState([])
  const [error,setError]=useState('')
  const [dialog,setDialog]=useState('')
  const [notice,setNotice]=useState('')

  const load=async()=>{
    try{
      const [s,o,f]=await Promise.all([
        api('/api/account/summary/'),
        api('/api/demo/orders/'),
        api('/api/account/funding-requests/'),
      ])
      setSummary(s)
      setOrders(o.orders||[])
      setFunding(f.requests||[])
    }catch(e){setError(e.message)}
  }
  useEffect(()=>{load()},[])

  const changePassword=async(e)=>{
    e.preventDefault()
    const fd=new FormData(e.currentTarget)
    try{
      await api('/api/account/change-password/',{method:'POST',body:JSON.stringify({current_password:fd.get('current_password'),new_password:fd.get('new_password')})})
      setDialog('')
      alert(t.passwordChanged)
    }catch(err){alert(err.message)}
  }

  const submitFunding=async(e)=>{
    e.preventDefault()
    const fd=new FormData(e.currentTarget)
    setNotice('')
    try{
      await api('/api/account/funding-requests/',{method:'POST',body:JSON.stringify({
        kind:fd.get('kind'),account_type:fd.get('account_type'),amount:fd.get('amount'),asset:'USDT',network:fd.get('network'),address:fd.get('address'),note:fd.get('note'),
      })})
      setNotice('Sandbox request submitted for administrator review.')
      await load()
      e.currentTarget.reset()
    }catch(err){setNotice(err.message)}
  }

  const balance=summary?.balances||{trading:'0.00',spot:'0.00',finance:'0.00',loan:'0.00',total:'0.00'}
  return <main className="app-page account-page"><AppHeader i18n={i18n} user={user} onLogout={onLogout}/><section className="account-shell">
    <select className="account-code" value={summary?.account_code||''} readOnly><option>{summary?.account_code||'------'}</option></select>
    <div className="balance-card"><h2>{balance.total} DEMO USDT</h2><div><span>{t.tradingBalance}: <b>{balance.trading} USDT</b></span><span>{t.spotBalance}: <b>{balance.spot} USDT</b></span><span>{t.financeBalance}: <b>{balance.finance} USDT</b></span><span>{t.loan}: <b>{balance.loan} USDT</b></span></div><small className="balance-card-meta">{summary?.vip_label||'Regular'} · Sandbox withdrawals {summary?.withdrawals_blocked?'disabled':'enabled'}</small></div>
    <div className="account-actions"><button onClick={()=>setDialog('transfer')}>{t.accountTransfer}</button><button onClick={()=>setDialog('exchange')}>{t.flashExchange}</button><button onClick={()=>setDialog('funds')}>{t.depositWithdrawal}</button><button onClick={()=>setDialog('card')}>{t.bankCardWithdrawal}</button></div>
    <h1>{t.order}</h1><div className="order-tabs">{ORDER_TABS.map((label,i)=><button key={label} className={i===0?'active':''}>{t[`order_${i}`]||label}</button>)}</div>
    {orders.length?<div className="demo-orders">{orders.slice(0,12).map(o=><div key={o.id}><strong>{o.market_code}</strong><span>{o.mode}</span><span>{o.duration}s</span><span>{o.investment} DEMO USDT</span><span className={`order-status ${o.status}`}>{o.status}</span><small>{new Date(o.created_at).toLocaleString()}</small></div>)}</div>:<p className="no-data">{t.noMoreData}</p>}

    {funding.length>0&&<><h2 className="account-subheading">Sandbox funding requests</h2><div className="funding-history">{funding.slice(0,10).map(item=><div key={item.id}><b>{item.kind}</b><span>{item.amount} {item.asset}</span><span>{item.account_type}</span><span className={`status-pill ${item.status==='approved'?'active':item.status==='rejected'?'suspended':'pending'}`}>{item.status}</span><small>{new Date(item.created_at).toLocaleString()}</small></div>)}</div></>}

    <h1>{t.settings}</h1><div className="settings-list">
      <button onClick={()=>setDialog('verification')}><span>{t.accountVerification}</span><b>{summary?.is_verified?t.verified:t.notVerified} ›</b></button>
      <button onClick={()=>setDialog('invite')}><span>{t.inviteFriends}</span><b>›</b></button>
      <button onClick={()=>setDialog('support')}><span>{t.contactWhatsapp}</span><b>›</b></button>
      <button onClick={()=>setDialog('support')}><span>{t.contactOnline}</span><b>›</b></button>
      <button onClick={()=>setDialog('faq')}><span>{t.helpCenterFaq}</span><b>›</b></button>
      <button onClick={()=>setDialog('notifications')}><span>{t.notification}</span><b>›</b></button>
      <button onClick={()=>setDialog('password')}><span>{t.changePassword}</span><b>›</b></button>
      <button onClick={()=>setDialog('language')}><span>{t.changeLanguage}</span><b>›</b></button>
      <button onClick={onLogout}><span>{t.logout}</span><b>›</b></button>
    </div>{error&&<div className="form-error">{error}</div>}
  </section><SiteFooter t={t}/>
  {dialog&&<div className="modal-backdrop" onMouseDown={()=>setDialog('')}><div className="simple-modal" onMouseDown={e=>e.stopPropagation()}>
    {dialog==='password'?<><h2>{t.changePassword}</h2><form onSubmit={changePassword} className="modal-form"><input name="current_password" type="password" placeholder={t.currentPassword} required/><input name="new_password" type="password" placeholder={t.newPassword} required/><button className="black-action">{t.save}</button></form></>
    :dialog==='funds'?<><h2>Sandbox deposit & withdrawal request</h2><p className="sandbox-modal-note">Requests are simulated and reviewed by the BXC sandbox administrator. No cryptocurrency is transferred.</p><form onSubmit={submitFunding} className="modal-form"><select name="kind" required><option value="deposit">Deposit request</option><option value="withdrawal">Withdrawal request</option></select><select name="account_type" required><option value="spot">Spot account</option><option value="trading">Trading account</option><option value="finance">Finance account</option></select><select name="network"><option>USDT-TRC20</option><option>USDT-ERC20</option><option>USDT-BEP20</option></select><input name="amount" type="number" step="0.01" min="0.01" placeholder="Amount (DEMO USDT)" required/><input name="address" placeholder="Demo destination/reference address"/><input name="note" placeholder="Note"/><button className="black-action">Submit sandbox request</button></form>{notice&&<div className="inline-message">{notice}</div>}</>
    :<><h2>{dialog==='verification'?t.accountVerification:t.demoMode}</h2><p>{dialog==='verification'?(summary?.is_verified?t.alreadyVerified:t.verificationAdminReview):t.demoOnlyMessage}</p><button className="black-action" onClick={()=>setDialog('')}>{t.close}</button></>}
  </div></div>}
  </main>
}
