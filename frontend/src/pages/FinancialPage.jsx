import { useState } from 'react'
import AppHeader from '../components/AppHeader'
import SiteFooter from '../components/SiteFooter'

const PRODUCTS=[
  ['VIP0 AI Finance',3,'0.46%-0.58%','10,000 - 100,000'],
  ['VIP1 AI Finance',7,'0.54%-0.77%','100,000 - 500,000'],
  ['VIP2 AI Finance',15,'0.63%-1.47%','300,000 - 5,000,000'],
  ['VIP3 AI Finance',30,'0.83%-2.07%','500,000 - 10,000,000'],
  ['VIP4 AI Finance',60,'1.05%-3.23%','1,000,000 - 100,000,000'],
]

export default function FinancialPage({ i18n, user, onLogout }) {
  const {t}=i18n
  const [tab,setTab]=useState('products'), [selected,setSelected]=useState(null)
  return <main className="app-page financial-page"><AppHeader i18n={i18n} user={user} onLogout={onLogout}/>
    <section className="financial-shell"><h1>{t.financialProducts}</h1><div className="financial-tabs"><button className={tab==='products'?'active':''} onClick={()=>setTab('products')}>{t.productList}</button><button className={tab==='mine'?'active':''} onClick={()=>setTab('mine')}>{t.myInvestments}</button></div>
      {tab==='products'?<div className="financial-table"><div className="financial-head"><span>{t.product}</span><span>{t.cycleDays}</span><span>{t.dailyRate}</span><span>{t.investmentRange}</span><span/></div>{PRODUCTS.map(p=><div className="financial-row" key={p[0]}><span>{p[0]}</span><span>{p[1]}</span><span className="negative">{p[2]}</span><span>{p[3]}</span><button onClick={()=>setSelected(p)}>+</button></div>)}</div>:<div className="empty-state"><h3>{t.noDemoInvestments}</h3><p>{t.demoFinancialDisclaimer}</p></div>}
    </section><SiteFooter t={t}/>
    {selected&&<div className="modal-backdrop" onMouseDown={()=>setSelected(null)}><div className="simple-modal" onMouseDown={e=>e.stopPropagation()}><h2>{selected[0]}</h2><p>{t.cycleDays}: <b>{selected[1]}</b></p><p>{t.dailyRate}: <b>{selected[2]}</b></p><p>{t.investmentRange}: <b>{selected[3]} USDT</b></p><div className="sandbox-note">{t.demoFinancialDisclaimer}</div><button className="black-action" onClick={()=>setSelected(null)}>{t.close}</button></div></div>}
  </main>
}
