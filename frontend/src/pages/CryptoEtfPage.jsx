import { useState } from 'react'
import AppHeader from '../components/AppHeader'
import SiteFooter from '../components/SiteFooter'
import MiniSparkline from '../components/MiniSparkline'
import MarketIcon from '../components/MarketIcon'
import { ETF_DATA } from '../data/markets'

export default function CryptoEtfPage({ i18n, user, onLogout }) {
  const {t}=i18n
  const [watch,setWatch]=useState(()=>new Set())
  const toggle=(code)=>setWatch(prev=>{const next=new Set(prev);next.has(code)?next.delete(code):next.add(code);return next})
  return <main className="app-page etf-page">
    <AppHeader i18n={i18n} user={user} onLogout={onLogout}/>
    <section className="etf-shell"><h1>{t.cryptoEtf}</h1>
      <div className="etf-head"><span>{t.name}</span><span>{t.spotPrice}</span><span>24h%</span><span>{t.chart}</span><span/></div>
      <div className="etf-list">{ETF_DATA.map(item=><div className="etf-row" key={item.code}>
        <div className="market-name"><MarketIcon item={item}/><strong>{item.code}</strong></div><span>{item.price}</span><span className={item.change>=0?'positive':'negative'}>{item.change.toFixed(2)}%</span><MiniSparkline values={item.spark} positive={item.change>=0}/><button className={watch.has(item.code)?'watched':''} onClick={()=>toggle(item.code)}>{watch.has(item.code)?'✓':'+'}</button>
      </div>)}</div>
    </section>
    <SiteFooter t={t}/>
  </main>
}
