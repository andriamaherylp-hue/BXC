import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api'
import Brand from '../components/Brand'
import LanguageMenu from '../components/LanguageMenu'

export default function LoginPage({ i18n, onLogin }) {
  const { language, setLanguage, t } = i18n
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()
  const submit = async (event) => {
    event.preventDefault(); setError(''); setBusy(true)
    try {
      const data = await api('/api/auth/login/', { method:'POST', body: JSON.stringify(form) })
      onLogin(data.user); navigate('/home')
    } catch (err) { setError(err.message || t.invalidLogin) }
    finally { setBusy(false) }
  }
  return (
    <main className="auth-page">
      <header className="auth-top"><Brand /><LanguageMenu language={language} setLanguage={setLanguage} t={t} /></header>
      <div className="auth-layout">
        <section className="auth-form-column">
          <h1>{t.welcome}</h1>
          <form onSubmit={submit} className="auth-form">
            <label className="outlined-field"><span>{t.username}:</span><input autoComplete="username" value={form.username} onChange={e => setForm({...form,username:e.target.value})} required /></label>
            <label className="outlined-field"><span>{t.password}:</span><input type="password" autoComplete="current-password" value={form.password} onChange={e => setForm({...form,password:e.target.value})} required /></label>
            {error && <div className="form-error">{error}</div>}
            <button className="gold-primary" disabled={busy}>{busy ? '…' : t.login}</button>
          </form>
          <p className="auth-link-row"><span>{t.noAccount}</span> <Link to="/register">{t.register}</Link></p>
          <a className="contact-link" href="mailto:support@example.com">{t.contact}</a>
        </section>
        <section className="auth-art login-art" aria-hidden="true">
          <div className="id-card card-left"><div className="avatar"/><div className="tiny-line"/></div>
          <div className="id-card card-main"><div className="avatar large"/><div className="tiny-line wide"/><div className="tiny-line"/></div>
          <div className="id-card card-right"><div className="avatar"/><div className="tiny-line"/></div>
          <div className="magnifier"><div className="lens"/><div className="handle"/></div>
        </section>
      </div>
      <footer className="auth-footer">© 2026 BXC Sandbox. All rights reserved.</footer>
    </main>
  )
}
