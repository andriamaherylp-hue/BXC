import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import SiteFooter from '../components/SiteFooter'
import MiniSparkline from '../components/MiniSparkline'
import MarketIcon from '../components/MarketIcon'
import { MARKET_DATA, MARKET_TABS } from '../data/markets'

export default function MarketPage({ i18n, user, onLogout }) {
  const {t}=i18n
  const [tab,setTab]=useState('crypto')
  const rows=useMemo(()=>MARKET_DATA[tab]||[],[tab])
  const featured=rows.slice(0,3)
  return <main className="app-page market-page">
    <AppHeader i18n={i18n} user={user} onLogout={onLogout}/>
    <section className="market-shell">
      <h1>{t.markets}</h1>
      <div className="market-tabs">{MARKET_TABS.map(([key,label])=><button key={key} className={tab===key?'active':''} onClick={()=>setTab(key)}>{t[`tab_${key}`]||label}</button>)}</div>
      <div className="featured-market-row">
        {featured.map((item,i)=><Link key={item.code} className={`featured-market-card ${i===0?'selected':''}`} to={`/market/${tab}/${encodeURIComponent(item.code)}`}>
          <MarketIcon item={item} large/><strong>{item.code}</strong><b>{item.price}</b><span className={item.change>=0?'positive':'negative'}>{item.change.toFixed(2)}%</span>
        </Link>)}
      </div>
      <div className="fake-scrollbar"><span/></div>
      <div className="market-table-head"><span>{t.name}</span><span>24h%</span><span>{t.chart}</span><span>{t.price}</span></div>
      <div className="market-list">
        {rows.map(item=><Link key={item.code} to={`/market/${tab}/${encodeURIComponent(item.code)}`} className="market-row">
          <div className="market-name"><MarketIcon item={item}/><strong>{item.code}</strong></div>
          <span className={item.change>=0?'positive':'negative'}>{item.change.toFixed(2)}%</span>
          <MiniSparkline values={item.spark} positive={item.change>=0}/>
          <span className="market-price">{item.price}</span>
        </Link>)}
      </div>
    </section>
    <SiteFooter t={t}/>
  </main>
}
