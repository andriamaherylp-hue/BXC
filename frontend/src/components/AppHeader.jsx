import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import Brand from './Brand'
import LanguageMenu from './LanguageMenu'

export default function AppHeader({ i18n, user, onLogout }) {
  const { language, setLanguage, t } = i18n
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const links = [
    ['/home', t.home],
    ['/market', t.market],
    ['/crypto-etf', t.cryptoEtf],
    ['/loan', t.loan],
    ['/financial', t.financial],
    ['/account', t.account],
  ]

  useEffect(() => setMenuOpen(false), [location.pathname])
  useEffect(() => {
    document.body.classList.toggle('mobile-menu-open', menuOpen)
    return () => document.body.classList.remove('mobile-menu-open')
  }, [menuOpen])

  return (
    <header className="app-header">
      <div className="app-header-left">
        <Link to="/home" aria-label="BXC home"><Brand compact /></Link>
        <span className="sandbox-badge">SANDBOX</span>
        <nav className="desktop-nav" aria-label="Primary navigation">
          {links.map(([to, label]) => (
            <NavLink key={to} to={to} className={({ isActive }) => isActive ? 'active' : ''}>{label}</NavLink>
          ))}
        </nav>
      </div>

      <div className="app-header-right desktop-header-actions">
        <LanguageMenu language={language} setLanguage={setLanguage} t={t} />
        {user?.is_staff && <Link className="header-action" to="/admin">{t.admin}</Link>}
        <button className="header-action logout-action" onClick={onLogout}>{t.logout}</button>
      </div>

      <button
        type="button"
        className="mobile-menu-toggle"
        aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((value) => !value)}
      >
        <span />
        <span />
        <span />
      </button>

      {menuOpen && (
        <div className="mobile-nav-backdrop" onMouseDown={() => setMenuOpen(false)}>
          <aside className="mobile-nav-drawer" onMouseDown={(event) => event.stopPropagation()}>
            <div className="mobile-nav-top">
              <Brand compact />
              <button type="button" className="mobile-nav-close" onClick={() => setMenuOpen(false)} aria-label="Close navigation">×</button>
            </div>
            <nav aria-label="Mobile navigation">
              {links.map(([to, label]) => (
                <NavLink key={to} to={to} className={({ isActive }) => isActive ? 'active' : ''}>{label}</NavLink>
              ))}
              {user?.is_staff && <NavLink to="/admin">{t.admin}</NavLink>}
            </nav>
            <div className="mobile-nav-language">
              <LanguageMenu language={language} setLanguage={setLanguage} t={t} />
            </div>
            <button type="button" className="mobile-nav-logout" onClick={onLogout}>{t.logout}</button>
          </aside>
        </div>
      )}
    </header>
  )
}
