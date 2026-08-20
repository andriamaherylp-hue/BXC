import { Link } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import SiteFooter from '../components/SiteFooter'
import iphone1 from '../assets/bxc/home_iphone1.svg'
import iphone2 from '../assets/bxc/home_iphone2.svg'
import appStore from '../assets/bxc/app_store.svg'

export default function HomePage({ i18n, user, onLogout }) {
  const { t }=i18n
  return <main className="app-page home-page">
    <AppHeader i18n={i18n} user={user} onLogout={onLogout}/>
    <section className="home-hero reference-home">
      <div className="home-copy">
        <h1>{t.heroHeadline}</h1>
        <button className="app-store-button">
          <img src={appStore} alt="" />
          <span><small>{t.availableOn}</small><b>App Store</b></span>
        </button>
        <div className="home-point-list">
          <div><span className="twinkle">✧</span><div><h3>{t.application}</h3><p>{t.applicationText}</p></div></div>
          <div><span className="twinkle">✧</span><div><h3>{t.cryptoDeposit}</h3><p>{t.cryptoDepositText}</p></div></div>
        </div>
      </div>
      <div className="home-visual reference-phone-art" aria-hidden="true">
        <img className="home-phone-image small" src={iphone1} alt="" />
        <img className="home-phone-image large" src={iphone2} alt="" />
      </div>
    </section>

    <section className="home-stats">
      <div><strong>$3.8 B</strong><span>{t.averageVolume}</span></div>
      <div><strong>350+</strong><span>{t.cryptocurrenciesListed}</span></div>
      <div><strong>1.2 M</strong><span>{t.registeredUsers}</span></div>
    </section>

    <section className="home-feature-grid">
      <Link to="/features" className="feature-banner dark"><span className="feature-arrow">➜</span><h3>{t.newFeatures}</h3><p>{t.newFeaturesText}</p></Link>
      <Link to="/account" className="feature-banner demo"><span className="bell-icon">♧</span><h3>{t.demoAccount}</h3></Link>
      <Link to="/market" className="feature-square dark"><span className="feature-line-icon">⌁</span><small>{t.lowFees}</small><h3>{t.tradeAll}</h3><p>{t.tradeAllText}</p><button>{t.getStarted}</button></Link>
      <Link to="/loan" className="feature-square dark right"><span className="feature-line-icon">▱</span><small>{t.lowInterest}</small><h3>{t.cryptoLoans}</h3><p>{t.cryptoLoansText}</p><button>{t.getStarted}</button></Link>
    </section>
    <SiteFooter t={t}/>
  </main>
}
