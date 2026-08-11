import Brand from './Brand'

export default function SiteFooter({ t }) {
  return <footer className="bxc-footer">
    <div className="footer-brand"><Brand compact/><span className="sandbox-footnote">Sandbox</span></div>
    <div><strong>{t.products}</strong><a>{t.markets}</a><a>{t.investmentLending}</a><a>{t.financial}</a><a>{t.cryptoEtf}</a></div>
    <div><strong>{t.company}</strong><a>{t.aboutUs}</a><a>{t.licenseSupervision}</a><a>{t.helpCenter}</a></div>
    <div><strong>{t.policies}</strong><a>{t.terms}</a><a>{t.privacy}</a><a>{t.onlineSupport}</a></div>
    <div className="footer-legal"><span>{t.legalInfo}</span><span>{t.disclaimer}</span><span>{t.riskWarning}</span><span>{t.aboutAdvertising}</span></div>
    <div className="footer-copy">© 2026 BXC Sandbox. {t.rightsReserved}</div>
  </footer>
}
