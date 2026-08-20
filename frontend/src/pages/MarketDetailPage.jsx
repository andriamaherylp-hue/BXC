import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import SiteFooter from '../components/SiteFooter'
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

  const submit=async(direction)=>{
    const amount=Number(investment)
    if(!Number.isFinite(amount)||amount<=0){setMessage(t.enterDemoAmount);return}
    setBusy(true);setMessage('')
    try{
      await api('/api/demo/orders/',{method:'POST',body:JSON.stringify({market_code:market.code,category,mode,direction,duration,investment:amount})})
      setMessage(`${direction==='call'?'Call/Long':'Put/Short'} demo order saved.`)
      setInvestment('')
    }catch(e){setMessage(e.message)}finally{setBusy(false)}
  }

  return <main className="app-page market-detail-page">
    <AppHeader i18n={i18n} user={user} onLogout={onLogout}/>
    <section className="detail-shell reference-detail-shell">
      <div className="breadcrumb">BXC <span>›</span> {category} <span>›</span> {market.code}</div>
      <div className="detail-title"><MarketIcon item={market} large/><h1>{market.code}</h1><span>⌄</span></div>
      <TradingChart market={market}/>
      <div className="trade-controls">
        <div className="trade-mode-tabs">
          {['options','futures',...(category==='crypto'?['spot']:[])].map(key=><button key={key} className={mode===key?'active':''} onClick={()=>setMode(key)}>{t[key]||key}</button>)}
        </div>
        <div className="trade-time-block"><label>{t.time}</label><div className="duration-row">{[[60,80],[90,85],[120,90],[180,95]].map(([seconds,ret])=><button key={seconds} className={duration===seconds?'active':''} onClick={()=>setDuration(seconds)}><b>{seconds}s</b><small>{ret}% {t.returnLabel}</small></button>)}</div></div>
        <label className="investment-input"><span>{t.investment}</span><input value={investment} onChange={e=>setInvestment(e.target.value)} inputMode="decimal"/><b>USDT</b></label>
        <div className="demo-trade-summary"><span>{t.available}: {Number(user?.balances?.trading||0).toFixed(2)} USDT</span><span>{t.fee}: 0.00 USDT</span></div>
        <div className="direction-actions"><button className="gold-pill" onClick={()=>submit('call')} disabled={busy}>Call/Long</button><button className="outline-action" onClick={()=>submit('put')} disabled={busy}>Put/Short</button></div>
        {message&&<div className="inline-message">{message}</div>}
        <p className="sandbox-disclaimer">{t.demoTradeDisclaimer}</p>
      </div>
    </section>
    <SiteFooter t={t}/>
  </main>
}
