import AppHeader from '../components/AppHeader'
import SiteFooter from '../components/SiteFooter'

const FAQS = [
  ['Why do I need to register for an account?', 'Registering an account gives you access to BXC sandbox features and keeps your settings linked to your profile.'],
  ['What information is needed to register an account?', 'Only a username and password are required for a standard sandbox account.'],
  ['Will my registration information be kept confidential?', 'Passwords are stored using Django password hashing. Never share your password with anyone.'],
  ['Can I change my registration information?', 'You can change your password from Account settings. Your username is used as your login identifier.'],
  ['Can I register multiple accounts?', 'The application can support multiple distinct usernames. Each username must be unique.'],
]

export default function HelpCenterPage({ i18n, user, onLogout }) {
  const { t } = i18n
  return (
    <main className="app-page info-page">
      <AppHeader i18n={i18n} user={user} onLogout={onLogout} />
      <section className="info-shell help-shell">
        <div className="breadcrumb">BXC <span>›</span> FAQ</div>
        <h1>{t.helpCenter || 'Help Center'}</h1>
        <div className="faq-list">
          {FAQS.map(([question, answer]) => <article key={question}><h2>{question}</h2><p>{answer}</p></article>)}
        </div>
      </section>
      <SiteFooter t={t} />
    </main>
  )
}
