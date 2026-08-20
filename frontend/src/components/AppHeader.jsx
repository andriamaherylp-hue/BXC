import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import Brand from './Brand'
import LanguageMenu from './LanguageMenu'

export default function AppHeader({ i18n, user, onLogout }) {
  const { language, setLanguage, t } = i18n
  const [mobileOpen,setMobileOpen]=useState(false)
  const links = [
    ['/home', t.home],
    ['/market', t.market],
    ['/crypto-etf', t.cryptoEtf],
    ['/loan', t.loan],
    ['/financial', t.financial],
    ['/account', t.account],
  ]
  const close=()=>setMobileOpen(false)

  return <header className="app-header">
    <div className="app-header-left">
      <Link to="/home" aria-label="BXC home" onClick={close}><Brand compact/></Link>
      <span className="sandbox-badge">SANDBOX</span>
      <nav className="desktop-nav">
        {links.map(([to,label]) => <NavLink key={to} to={to} className={({isActive})=>isActive?'active':''}>{label}</NavLink>)}
      </nav>
    </div>
    <div className="app-header-right desktop-actions">
      <LanguageMenu language={language} setLanguage={setLanguage} t={t}/>
      {user?.is_staff && <Link className="header-action" to="/admin">{t.admin}</Link>}
      <button className="header-action logout-action" onClick={onLogout}>{t.logout}</button>
    </div>
    <button className="mobile-menu-button" aria-label="Open menu" onClick={()=>setMobileOpen(v=>!v)}>
      <span/><span/><span/>
    </button>
    {mobileOpen&&<div className="mobile-menu-panel">
      <div className="mobile-menu-top"><Brand compact/><button onClick={close}>×</button></div>
      <nav>{links.map(([to,label])=><NavLink key={to} to={to} onClick={close}>{label}</NavLink>)}</nav>
      <div className="mobile-menu-bottom">
        <LanguageMenu language={language} setLanguage={setLanguage} t={t}/>
        {user?.is_staff&&<Link to="/admin" onClick={close}>{t.admin}</Link>}
        <button onClick={onLogout}>{t.logout}</button>
      </div>
    </div>}
  </header>
}
