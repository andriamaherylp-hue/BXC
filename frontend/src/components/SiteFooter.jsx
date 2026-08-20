import { Link } from 'react-router-dom'
import Brand from './Brand'
import logoLight from '../assets/bxc/logo_light.svg'

export default function SiteFooter({ t }) {
  return <footer className="bxc-footer">
    <div className="footer-brand">
      <img className="footer-symbol" src={logoLight} alt="" />
      <Brand compact inverse/>
      <span className="sandbox-footnote">Sandbox</span>
    </div>
    <div><strong>{t.products}</strong><Link to="/market">{t.markets}</Link><a>{t.investmentLending}</a><Link to="/financial">{t.financial}</Link><Link to="/crypto-etf">{t.cryptoEtf}</Link></div>
    <div><strong>{t.company}</strong><a>{t.aboutUs}</a><a>{t.licenseSupervision}</a><Link to="/help-center">{t.helpCenter}</Link></div>
    <div><strong>{t.policies}</strong><a>{t.terms}</a><a>{t.privacy}</a><a>{t.onlineSupport}</a></div>
    <div className="footer-legal"><span>{t.legalInfo}</span><span>{t.disclaimer}</span><span>{t.riskWarning}</span><span>{t.aboutAdvertising}</span></div>
    <div className="footer-copy">© 2026 BXC Sandbox. {t.rightsReserved}</div>
  </footer>
}
