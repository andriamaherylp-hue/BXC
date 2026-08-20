import AppHeader from '../components/AppHeader'
import SiteFooter from '../components/SiteFooter'

const FAQ_EN=[
  ['Why do I need to register for an account?','Registering an account lets you use the sandbox features more conveniently and keeps your account settings associated with your username.'],
  ['What information is needed to register an account?','A username and password are required. Additional profile information is only requested when you choose account verification.'],
  ['Will my registration information be kept confidential?','Passwords are handled by Django authentication and are not stored in plain text. Do not share your password with other people.'],
  ['Can I change my registration information?','You can change your password from the Account page. Some account identifiers are intentionally fixed.'],
  ['Can I register multiple accounts?','The sandbox can support multiple accounts, but each username must be unique.'],
]
const FAQ_FR=[
  ['Pourquoi dois-je créer un compte ?',"La création d’un compte vous permet d’utiliser plus facilement les fonctions de démonstration et de conserver les paramètres associés à votre nom d’utilisateur."],
  ['Quelles informations sont nécessaires pour créer un compte ?', "Un nom d’utilisateur et un mot de passe sont requis. Les informations de profil supplémentaires ne sont demandées que si vous lancez la vérification du compte."],
  ["Mes informations d’inscription resteront-elles confidentielles ?","Les mots de passe sont gérés par l’authentification Django et ne sont pas stockés en clair. Ne communiquez jamais votre mot de passe."],
  ["Puis-je modifier mes informations d’inscription ?","Vous pouvez modifier votre mot de passe depuis la page Compte. Certains identifiants de compte restent fixes."],
  ["Puis-je enregistrer plusieurs comptes ?","Le bac à sable peut prendre en charge plusieurs comptes, mais chaque nom d’utilisateur doit être unique."],
]

export default function HelpCenterPage({ i18n, user, onLogout }) {
  const {t,language}=i18n
  const rows=language==='fr'?FAQ_FR:FAQ_EN
  return <main className="app-page content-page help-page">
    <AppHeader i18n={i18n} user={user} onLogout={onLogout}/>
    <section className="help-shell">
      <div className="breadcrumb">BXC <span>›</span> FAQ</div>
      <h1>{t.helpCenter}</h1>
      <div className="faq-list">{rows.map(([q,a])=><article key={q}><h3>{q}</h3><p>{a}</p></article>)}</div>
    </section>
    <SiteFooter t={t}/>
  </main>
}
