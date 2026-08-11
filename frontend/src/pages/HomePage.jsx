import { Link } from 'react-router-dom'
import Brand from '../components/Brand'
import LanguageMenu from '../components/LanguageMenu'

function PhoneMock({ large=false }) {
  return <div className={`phone-mock ${large ? 'large' : ''}`}><div className="phone-top">● ●</div><div className="balance-box">155,846 USD</div><div className="chart-lines"><i/><i/><i/><i/><i/></div><div className="mock-buttons"><span/><span/></div><div className="mock-list">{[1,2,3,4].map(i=><b key={i}/>)}</div></div>
}

export default function HomePage({ i18n, user, onLogout }) {
  const {language,setLanguage,t}=i18n
  return <main className="site-page">
    <header className="site-header"><Brand compact/><nav><a>{t.home}</a><a>{t.market}</a><a>{t.cryptoEtf}</a><a>{t.loan}</a><a>{t.financial}</a><a>{t.account}</a></nav><div className="header-right"><LanguageMenu language={language} setLanguage={setLanguage} t={t}/>{user?.is_staff && <Link className="admin-link" to="/admin">{t.admin}</Link>}<button className="plain-button" onClick={onLogout}>{t.logout}</button></div></header>
    <section className="hero-section"><div className="hero-copy"><h1>{t.hero}</h1><button className="store-button"> &nbsp; App Store</button><div className="hero-points"><div><span>✧</span><div><strong>{t.application}</strong><p>{t.appText}</p></div></div><div><span>✧</span><div><strong>{t.assetAccess}</strong><p>{t.assetText}</p></div></div></div></div><div className="hero-phones"><PhoneMock/><PhoneMock large/></div></section>
    <section className="stats-card"><div><strong>$3.8 B</strong><span>{t.statVolume}</span></div><div><strong>350+</strong><span>{t.statAssets}</span></div><div><strong>1.2 M</strong><span>{t.statUsers}</span></div></section>
    <section className="feature-grid"><article className="feature-card dark-feature"><div className="feature-icon">●</div><strong>{t.features}</strong><p>Explore the latest account and interface improvements.</p></article><article className="feature-card outline-feature"><div className="feature-icon">♧</div><strong>{t.demo}</strong></article><article className="feature-card dark-feature small"><div className="feature-icon">▣</div><strong>{t.assets}</strong><button>{t.getStarted}</button></article><article className="feature-card dark-feature small align-right"><div className="feature-icon">▱</div><strong>{t.loans}</strong><button>{t.getStarted}</button></article></section>
    <footer className="site-footer"><div><Brand compact/></div><div><strong>Products</strong><a>Markets</a><a>Account</a><a>Digital assets</a></div><div><strong>Company</strong><a>About Us</a><a>Help Center</a><a>Support</a></div><div><strong>Policies</strong><a>Terms & Conditions</a><a>Privacy policy</a><a>Online Support</a></div><div className="footer-bottom">© 2026 DXC. All rights reserved.</div></footer>
  </main>
}
