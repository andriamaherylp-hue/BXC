import { Link, NavLink } from 'react-router-dom'
import Brand from './Brand'
import LanguageMenu from './LanguageMenu'

export default function AppHeader({ i18n, user, onLogout }) {
  const { language, setLanguage, t } = i18n
  const links = [
    ['/home', t.home],
    ['/market', t.market],
    ['/crypto-etf', t.cryptoEtf],
    ['/loan', t.loan],
    ['/financial', t.financial],
    ['/account', t.account],
  ]
  return <header className="app-header">
    <div className="app-header-left">
      <Link to="/home" aria-label="BXC home"><Brand compact/></Link>
      <span className="sandbox-badge">SANDBOX</span>
      <nav>
        {links.map(([to,label]) => <NavLink key={to} to={to} className={({isActive})=>isActive?'active':''}>{label}</NavLink>)}
      </nav>
    </div>
    <div className="app-header-right">
      <LanguageMenu language={language} setLanguage={setLanguage} t={t}/>
      {user?.is_staff && <Link className="header-action" to="/admin">{t.admin}</Link>}
      <button className="header-action logout-action" onClick={onLogout}>{t.logout}</button>
    </div>
  </header>
}
