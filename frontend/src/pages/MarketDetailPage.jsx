import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import TradingChart from '../components/TradingChart'
import MarketIcon from '../components/MarketIcon'
import { findMarket } from '../data/markets'
import { api } from '../api'

export default function MarketDetailPage({ i18n, user, onLogout }) {
  const {t}=i18n
  const {category,code}=useParams()
  const market=useMemo(()=>findMarket(category,code),[category,code])
  const [mode,setMode]=useState('options')
  const [duration,setDuration]=useState(60)
  const [investment,setInvestment]=useState('')
  const [message,setMessage]=useState('')
  const [busy,setBusy]=useState(false)
  if(!market) return <main className="app-page"><AppHeader i18n={i18n} user={user} onLogout={onLogout}/><p className="not-found">Market not found. <Link to="/market">← {t.market}</Link></p></main>
  const submit=async()=>{
    const amount=Number(investment)
    if(!Number.isFinite(amount)||amount<=0){setMessage(t.enterDemoAmount);return}
    setBusy(true);setMessage('')
    try{
      await api('/api/demo/orders/',{method:'POST',body:JSON.stringify({market_code:market.code,category,mode,duration,investment:amount})})
      setMessage(t.demoOrderSaved)
      setInvestment('')
    }catch(e){setMessage(e.message)}finally{setBusy(false)}
  }
  return <main className="app-page market-detail-page">
    <AppHeader i18n={i18n} user={user} onLogout={onLogout}/>
    <section className="detail-shell">
      <div className="breadcrumb">BXC <span>›</span> {category} <span>›</span> {market.code}</div>
      <div className="detail-title"><MarketIcon item={market} large/><h1>{market.code}</h1><span>⌄</span></div>
      <TradingChart market={market}/>
      <div className="trade-controls">
        <div className="trade-mode-tabs">
          {['options','futures',...(category==='crypto'?['spot']:[])].map(key=><button key={key} className={mode===key?'active':''} onClick={()=>setMode(key)}>{t[key]||key}</button>)}
        </div>
        <div className="trade-time-block"><label>{t.time}</label><div className="duration-row">{[[60,80],[90,85],[120,90],[180,95]].map(([seconds,ret])=><button key={seconds} className={duration===seconds?'active':''} onClick={()=>setDuration(seconds)}><b>{seconds}s</b><small>{ret}% {t.returnLabel}</small></button>)}</div></div>
        <label className="investment-input"><span>{t.investment}</span><input value={investment} onChange={e=>setInvestment(e.target.value)} inputMode="decimal"/><b>USDT</b></label>
        <div className="demo-trade-summary"><span>{t.available}: 10,000.00 DEMO USDT</span><span>{t.fee}: 0.00 DEMO USDT</span></div>
        <button className="black-action" onClick={submit} disabled={busy}>{busy?t.saving:t.placeDemoOrder}</button>
        {message&&<div className="inline-message">{message}</div>}
        <p className="sandbox-disclaimer">{t.demoTradeDisclaimer}</p>
      </div>
    </section>
  </main>
}
