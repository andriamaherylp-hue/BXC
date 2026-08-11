import AppHeader from '../components/AppHeader'

export default function FeaturesPage({ i18n, user, onLogout }) {
  const {t}=i18n
  return <main className="app-page content-page">
    <AppHeader i18n={i18n} user={user} onLogout={onLogout}/>
    <div className="breadcrumb">BXC <span>›</span> {t.newFeatures}</div>
    <section className="feature-article">
      <h1>{t.newFeatures}</h1>
      <p>{t.featuresWelcome}</p>
      <div className="sandbox-note">{t.sandboxNote}</div>
    </section>
  </main>
}
