import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import SiteFooter from '../components/SiteFooter'
import VerificationModal from '../components/VerificationModal'
import { api } from '../api'
import { EXCHANGE_RATES } from '../data/markets'

const ORDER_TABS=['All orders','Contracts','Options','Crypto ETF','Wallet Income','My Investments','Spot Orders']
const ACCOUNT_TYPES=[['trading','Trading (MAIN)'],['spot','Spot (SPOT)'],['finance','Finance (FINANCE)'],['loan','Loan (LOAN)']]
const EXCHANGE_ASSETS=['USDT','BTC','ETH','SOL','USDC']

export default function AccountPage({ i18n, user, onLogout, onUserRefresh }) {
  const {t}=i18n
  const navigate=useNavigate()
  const [summary,setSummary]=useState(null)
  const [orders,setOrders]=useState([])
  const [funding,setFunding]=useState([])
  const [assets,setAssets]=useState({})
  const [error,setError]=useState('')
  const [dialog,setDialog]=useState('')
  const [notice,setNotice]=useState('')
  const [transfer,setTransfer]=useState({from_account:'trading',to_account:'finance',amount:''})
  const [exchange,setExchange]=useState({account_type:'spot',from_asset:'USDT',to_asset:'BTC',quantity:''})

  const load=async()=>{
    try{
      const [s,o,f,a]=await Promise.all([
        api('/api/account/summary/'),
        api('/api/demo/orders/'),
        api('/api/account/funding-requests/'),
        api('/api/account/assets/'),
      ])
      setSummary(s);setOrders(o.orders||[]);setFunding(f.requests||[]);setAssets(a.assets||{})
    }catch(e){setError(e.message)}
  }
  useEffect(()=>{load()},[])

  const changePassword=async(e)=>{
    e.preventDefault()
    const fd=new FormData(e.currentTarget)
    try{
      await api('/api/account/change-password/',{method:'POST',body:JSON.stringify({current_password:fd.get('current_password'),new_password:fd.get('new_password')})})
      setDialog('');alert(t.passwordChanged)
    }catch(err){alert(err.message)}
  }

  const submitTransfer=async(e)=>{
    e.preventDefault();setNotice('')
    try{
      await api('/api/account/transfer/',{method:'POST',body:JSON.stringify(transfer)})
      setNotice('Sandbox account transfer completed.');await load();setTransfer(v=>({...v,amount:''}))
    }catch(err){setNotice(err.message)}
  }

  const submitExchange=async(e)=>{
    e.preventDefault();setNotice('')
    try{
      const d=await api('/api/account/flash-exchange/',{method:'POST',body:JSON.stringify(exchange)})
      setNotice(`Sandbox exchange completed: ${d.from_amount} ${d.from_asset} → ${d.to_amount} ${d.to_asset}.`)
      await load();setExchange(v=>({...v,quantity:''}))
    }catch(err){setNotice(err.message)}
  }

  const balance=summary?.balances||{trading:'0.00',spot:'0.00',finance:'0.00',loan:'0.00',total:'0.00'}
  const transferAvailable=Number(balance[transfer.from_account]||0)
  const exchangeAvailable=exchange.from_asset==='USDT'
    ? Number(balance[exchange.account_type]||0)
    : Number(assets?.[exchange.account_type]?.[exchange.from_asset]||0)

  return <main className="app-page account-page">
    <AppHeader i18n={i18n} user={user} onLogout={onLogout}/>
    <section className="account-shell">
      <select className="account-code" value={summary?.account_code||''} readOnly><option>{summary?.account_code||'------'}</option></select>

      <div className="balance-card">
        <h2>{balance.total} USDT</h2>
        <div>
          <span>{t.tradingBalance}: <b>{balance.trading} USDT</b></span>
          <span>{t.spotBalance}: <b>{balance.spot} USDT</b></span>
          <span>{t.financeBalance}: <b>{balance.finance} USDT</b></span>
          <span>{t.loan}: <b>{balance.loan} USDT</b></span>
        </div>
        <small className="balance-card-meta">{summary?.vip_label||'Regular'} · Sandbox withdrawals {summary?.withdrawals_blocked?'disabled':'enabled'}</small>
      </div>

      <div className="account-actions">
        <button onClick={()=>{setNotice('');setDialog('transfer')}}>{t.accountTransfer}</button>
        <button onClick={()=>{setNotice('');setDialog('exchange')}}>{t.flashExchange}</button>
        <button onClick={()=>navigate('/balance')}>{t.depositWithdrawal}</button>
        <button onClick={()=>setDialog('card')}>{t.bankCardWithdrawal}</button>
      </div>

      <h1>{t.order}</h1>
      <div className="order-tabs">{ORDER_TABS.map((label,i)=><button key={label} className={i===0?'active':''}>{t[`order_${i}`]||label}</button>)}</div>
      {orders.length?<div className="demo-orders">{orders.slice(0,12).map(o=><div key={o.id}><strong>{o.market_code}</strong><span>{o.mode}</span><span>{o.direction||'—'}</span><span>{o.duration}s</span><span>{o.investment} DEMO USDT</span><span className={`order-status ${o.status}`}>{o.status}</span><small>{new Date(o.created_at).toLocaleString()}</small></div>)}</div>:<p className="no-data">{t.noMoreData}</p>}

      {funding.length>0&&<><h2 className="account-subheading">Sandbox funding requests</h2><div className="funding-history">{funding.slice(0,10).map(item=><div key={item.id}><b>{item.kind}</b><span>{item.amount} USDT eq. · {item.asset}</span><span>{item.account_type}</span><span className={`status-pill ${item.status==='approved'?'active':item.status==='rejected'?'suspended':'pending'}`}>{item.status}</span><small>{new Date(item.created_at).toLocaleString()}</small></div>)}</div></>}

      <h1>{t.settings}</h1>
      <div className="settings-list">
        <button onClick={()=>setDialog('verification')}><span>{t.accountVerification}</span><b>{summary?.is_verified?t.verified:t.notVerified} ›</b></button>
        <button onClick={()=>navigate('/invite')}><span>{t.inviteFriends}</span><b>›</b></button>
        <button onClick={()=>setDialog('support')}><span>{t.contactWhatsapp}</span><b>›</b></button>
        <button onClick={()=>setDialog('support')}><span>{t.contactOnline}</span><b>›</b></button>
        <button onClick={()=>navigate('/help-center')}><span>{t.helpCenterFaq}</span><b>›</b></button>
        <button onClick={()=>setDialog('notifications')}><span>{t.notification}</span><b>›</b></button>
        <button onClick={()=>setDialog('password')}><span>{t.changePassword}</span><b>›</b></button>
        <button onClick={()=>setDialog('language')}><span>{t.changeLanguage}</span><b>›</b></button>
        <button onClick={onLogout}><span>{t.logout}</span><b>›</b></button>
      </div>
      {error&&<div className="form-error">{error}</div>}
    </section>
    <SiteFooter t={t}/>

    {dialog==='verification'&&<VerificationModal t={t} onClose={()=>setDialog('')} onDone={async()=>{setNotice(t.verificationSubmitted);await load();onUserRefresh?.()}}/>}

    {dialog&&dialog!=='verification'&&<div className="modal-backdrop" onMouseDown={()=>setDialog('')}>
      <div className={`simple-modal ${dialog==='transfer'||dialog==='exchange'?'account-reference-modal':''}`} onMouseDown={e=>e.stopPropagation()}>
        <button className="modal-close-x" onClick={()=>setDialog('')}>×</button>
        {dialog==='password'?<>
          <h2>{t.changePassword}</h2>
          <form onSubmit={changePassword} className="modal-form">
            <input name="current_password" type="password" placeholder={t.currentPassword} required/>
            <input name="new_password" type="password" placeholder={t.newPassword} required/>
            <button className="black-action">{t.save}</button>
          </form>
        </>:dialog==='transfer'?<>
          <h2>{t.accountTransfer}</h2>
          <form className="reference-transfer-form" onSubmit={submitTransfer}>
            <label><span>From Account:</span><select value={transfer.from_account} onChange={e=>setTransfer(v=>({...v,from_account:e.target.value}))}>{ACCOUNT_TYPES.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label>
            <label><span>To Account:</span><select value={transfer.to_account} onChange={e=>setTransfer(v=>({...v,to_account:e.target.value}))}>{ACCOUNT_TYPES.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label>
            <label><span>Currency:</span><select><option>USDT</option></select></label>
            <label><span>Quantity:</span><input value={transfer.amount} onChange={e=>setTransfer(v=>({...v,amount:e.target.value}))} placeholder="Enter transfer quantity" inputMode="decimal"/></label>
            <small className="available-line">Available: {transferAvailable.toFixed(2)} USDT</small>
            <div className="reference-modal-actions"><button type="button" className="swap-button" onClick={()=>setTransfer(v=>({...v,from_account:v.to_account,to_account:v.from_account}))}>⇅ Swap</button><button className="gold-pill">Confirm Transfer</button></div>
          </form>
          {notice&&<div className="inline-message">{notice}</div>}
        </>:dialog==='exchange'?<>
          <h2>{t.flashExchange}</h2>
          <form className="reference-transfer-form" onSubmit={submitExchange}>
            <div className="exchange-account-tabs">{['spot','finance'].map(a=><button type="button" key={a} className={exchange.account_type===a?'active':''} onClick={()=>setExchange(v=>({...v,account_type:a}))}>{a==='spot'?'Spot Account':'Finance Account'}</button>)}</div>
            <label><span>From:</span><select value={exchange.from_asset} onChange={e=>setExchange(v=>({...v,from_asset:e.target.value}))}>{EXCHANGE_ASSETS.map(a=><option key={a}>{a}</option>)}</select></label>
            <label><span>To:</span><select value={exchange.to_asset} onChange={e=>setExchange(v=>({...v,to_asset:e.target.value}))}>{EXCHANGE_ASSETS.map(a=><option key={a}>{a}</option>)}</select></label>
            <label><span>Quantity:</span><input value={exchange.quantity} onChange={e=>setExchange(v=>({...v,quantity:e.target.value}))} placeholder="Enter quantity" inputMode="decimal"/></label>
            <small className="available-line">Available: {exchangeAvailable.toFixed(8)} {exchange.from_asset}</small>
            <div className="reference-modal-actions"><button type="button" className="swap-button" onClick={()=>setExchange(v=>({...v,from_asset:v.to_asset,to_asset:v.from_asset}))}>⇅ Swap</button><button className="gold-pill">Exchange Now</button></div>
          </form>
          {notice&&<div className="inline-message">{notice}</div>}
        </>:<>
          <h2>{dialog==='card'?t.bankCardWithdrawal:dialog==='language'?t.changeLanguage:dialog==='notifications'?t.notification:t.demoMode}</h2>
          <p>{dialog==='language'?'Use the Language menu in the header to change the interface language.':dialog==='notifications'?'No new sandbox notifications.':t.demoOnlyMessage}</p>
          <button className="black-action" onClick={()=>setDialog('')}>{t.close}</button>
        </>}
      </div>
    </div>}
  </main>
}
