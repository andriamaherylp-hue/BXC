import { useEffect, useMemo, useState } from 'react'
import AppHeader from '../components/AppHeader'
import SiteFooter from '../components/SiteFooter'
import DemoQr from '../components/DemoQr'
import { api } from '../api'
import { EXCHANGE_RATES } from '../data/markets'

const ASSETS=['BTC','ETH','USDT','USDC','SOL']
const NETWORKS={BTC:'BTC-DEMO',ETH:'ETH-DEMO',USDT:'USDT-TRC20-DEMO',USDC:'USDC-ERC20-DEMO',SOL:'SOL-DEMO'}

export default function BalancePage({ i18n, user, onLogout }) {
  const {t}=i18n
  const [asset,setAsset]=useState('BTC')
  const [summary,setSummary]=useState(null)
  const [assets,setAssets]=useState({})
  const [requests,setRequests]=useState([])
  const [dialog,setDialog]=useState('')
  const [notice,setNotice]=useState('')
  const [withdrawQty,setWithdrawQty]=useState('')
  const load=async()=>{
    const [s,a,f]=await Promise.all([api('/api/account/summary/'),api('/api/account/assets/'),api('/api/account/funding-requests/')])
    setSummary(s);setAssets(a.assets||{});setRequests(f.requests||[])
  }
  useEffect(()=>{load().catch(e=>setNotice(e.message))},[])
  const rate=EXCHANGE_RATES[asset]||1
  const reference=`BXC-DEMO-${summary?.account_code||'------'}-${asset}`
  const spotUsdt=Number(summary?.balances?.spot||0)
  const holding=asset==='USDT'?spotUsdt:Number(assets?.spot?.[asset]||0)
  const total=Number(summary?.balances?.total||0)

  const submitDeposit=async(e)=>{
    e.preventDefault();const fd=new FormData(e.currentTarget)
    const qty=Number(fd.get('quantity'))
    if(!Number.isFinite(qty)||qty<=0){setNotice('Enter a valid sandbox quantity.');return}
    try{
      await api('/api/account/funding-requests/',{method:'POST',body:JSON.stringify({kind:'deposit',account_type:'spot',amount:(qty*rate).toFixed(2),asset,network:NETWORKS[asset],address:reference,note:`${qty} ${asset} sandbox deposit proof at reference rate ${rate}`})})
      setNotice('Sandbox deposit proof submitted for administrator review.');setDialog('');await load()
    }catch(err){setNotice(err.message)}
  }
  const submitWithdrawal=async(e)=>{
    e.preventDefault()
    const qty=Number(withdrawQty)
    const fd=new FormData(e.currentTarget)
    if(!Number.isFinite(qty)||qty<=0){setNotice('Enter a valid sandbox quantity.');return}
    if(qty>holding){setNotice('Insufficient sandbox asset balance.');return}
    try{
      await api('/api/account/funding-requests/',{method:'POST',body:JSON.stringify({kind:'withdrawal',account_type:'spot',amount:(qty*rate).toFixed(2),asset,network:NETWORKS[asset],address:fd.get('address'),note:`${qty} ${asset} sandbox withdrawal at reference rate ${rate}`})})
      setNotice('Sandbox withdrawal request submitted for administrator review.');setWithdrawQty('');await load()
    }catch(err){setNotice(err.message)}
  }
  const copy=()=>navigator.clipboard?.writeText(reference)

  return <main className="app-page balance-page">
    <AppHeader i18n={i18n} user={user} onLogout={onLogout}/>
    <section className="balance-shell">
      <div className="breadcrumb">BXC <span>›</span> NFTs <span>›</span> Balance</div>
      <div className="balance-title"><span>Balance</span><h1>{total.toFixed(2)} USDT</h1><button className="gold-pill" onClick={()=>setDialog('records')}>Transaction record</button></div>
      <div className="asset-tabs">{ASSETS.map(code=><button key={code} className={asset===code?'active':''} onClick={()=>setAsset(code)}>{code}</button>)}</div>
      <h2 className="asset-rate">1{asset}: {rate.toLocaleString(undefined,{maximumFractionDigits:2})} USDT</h2>
      <div className="deposit-card">
        <div className="demo-reference">{reference}</div>
        <button className="gold-pill small" onClick={copy}>Copy address</button>
        <DemoQr value={reference}/>
        <small>Sandbox reference only — not a blockchain deposit address.</small>
      </div>
      <button className="gold-pill proof-button" onClick={()=>setDialog('deposit')}>Submit deposit proof</button>

      <h1 className="withdraw-heading">Withdrawal</h1>
      <form className="withdraw-form" onSubmit={submitWithdrawal}>
        <label><span>Withdrawal method:</span><select value={asset} onChange={e=>setAsset(e.target.value)}>{ASSETS.map(a=><option key={a}>{a}</option>)}</select></label>
        <label><span>Available Balance:</span><b className="positive">{holding.toFixed(8)} {asset}</b></label>
        <label><span>Quantity ({asset}):</span><div className="withdraw-qty"><input value={withdrawQty} onChange={e=>setWithdrawQty(e.target.value)} inputMode="decimal" placeholder="Quantity..."/><button type="button" onClick={()=>setWithdrawQty(String(holding))}>All</button></div></label>
        <label><span>Withdrawal address:</span><input name="address" required placeholder="Sandbox destination reference..."/></label>
        <button className="gold-pill withdraw-button">Withdrawal now</button>
      </form>
      <p className="withdraw-note">Sandbox only. No real cryptocurrency is transferred. Requests require administrator review.</p>
      {notice&&<div className="inline-message balance-notice">{notice}</div>}
    </section>
    <SiteFooter t={t}/>

    {dialog==='deposit'&&<div className="modal-backdrop" onMouseDown={()=>setDialog('')}><div className="simple-modal compact-reference-modal" onMouseDown={e=>e.stopPropagation()}><button className="modal-close-x" onClick={()=>setDialog('')}>×</button><h2>Submit deposit proof</h2><p>Enter the quantity shown in your sandbox proof. The request remains a simulation.</p><form className="modal-form" onSubmit={submitDeposit}><input name="quantity" type="number" min="0.00000001" step="0.00000001" placeholder={`Quantity (${asset})`} required/><button className="gold-pill">Submit proof</button></form></div></div>}
    {dialog==='records'&&<div className="modal-backdrop" onMouseDown={()=>setDialog('')}><div className="simple-modal records-modal" onMouseDown={e=>e.stopPropagation()}><button className="modal-close-x" onClick={()=>setDialog('')}>×</button><h2>Transaction record</h2><div className="records-list">{requests.length?requests.map(r=><div key={r.id}><b>{r.kind}</b><span>{r.asset}</span><span>{r.amount} USDT eq.</span><span className={`status-pill ${r.status==='approved'?'active':r.status==='rejected'?'suspended':'pending'}`}>{r.status}</span></div>):<p>No sandbox transaction yet.</p>}</div></div></div>}
  </main>
}
