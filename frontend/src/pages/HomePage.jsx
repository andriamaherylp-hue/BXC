import { Link } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import SiteFooter from '../components/SiteFooter'

function PhoneMock({ detail=false }) {
  return <div className={`home-phone ${detail?'detail-phone':''}`}>
    <div className="home-phone-status"><span>9:41</span><span>◔ ◔ ▰</span></div>
    <div className="home-phone-title">{detail?'BTC/USD':'Markets'}</div>
    {detail ? <>
      <div className="phone-summary"><b>133,546 USDT</b><small>-2.46%</small></div>
      <div className="phone-candle-grid">{Array.from({length:23}).map((_,i)=><i key={i} className={i%3===0?'green':''} style={{height:`${30+((i*17)%90)}px`}}/>)}</div>
      <div className="phone-bottom-buttons"><span>Futures</span><span>Options</span></div>
      <div className="phone-black-row"/><div className="phone-black-row"/><div className="phone-black-row"/>
    </> : <>
      <div className="phone-tabs"><b>Watchlist</b><span>Forex</span><span>Crypto</span></div>
      <div className="phone-asset-cards"><span>BTC<br/><b>$17,147</b></span><span>ETH<br/><b>$1,262</b></span><span>DASH<br/><b>$46.68</b></span></div>
      <div className="phone-list">{Array.from({length:5}).map((_,i)=><div key={i}><span>BTC</span><em className={i%2?'red':'green'}>⌁⌁⌁</em><small>$17,147</small></div>)}</div>
    </>}
  </div>
}

export default function HomePage({ i18n, user, onLogout }) {
  const { t }=i18n
  return <main className="app-page home-page">
    <AppHeader i18n={i18n} user={user} onLogout={onLogout}/>
    <section className="home-hero">
      <div className="home-copy">
        <h1>{t.heroHeadline}</h1>
        <button className="app-store-button"><span>●</span><span><small>{t.availableOn}</small><b>App Store</b></span></button>
        <div className="home-point-list">
          <div><span className="twinkle">✧</span><div><h3>{t.application}</h3><p>{t.applicationText}</p></div></div>
          <div><span className="twinkle">✧</span><div><h3>{t.cryptoDeposit}</h3><p>{t.cryptoDepositText}</p></div></div>
        </div>
      </div>
      <div className="home-visual"><PhoneMock/><PhoneMock detail/></div>
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
