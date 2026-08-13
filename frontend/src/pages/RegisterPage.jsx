import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api'
import Brand from '../components/Brand'
import LanguageMenu from '../components/LanguageMenu'

export default function RegisterPage({ i18n, onLogin }) {
  const { language, setLanguage, t } = i18n
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()

  const submit = async (event) => {
    event.preventDefault()
    setError('')

    const username = form.username.trim()
    if (!username) {
      setError(t.usernameRequired || 'Username is required.')
      return
    }
    if (!form.password) {
      setError(t.passwordRequired || 'Password is required.')
      return
    }
    setBusy(true)
    try {
      const data = await api('/api/auth/register/', {
        method: 'POST',
        body: JSON.stringify({
          username,
          password: form.password,
          preferred_language: language,
        }),
      })
      onLogin(data.user)
      navigate('/home')
    } catch (err) {
      setError(err.message || t.registrationFailed || 'Unable to create account.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="auth-page register-page">
      <header className="auth-top">
        <Brand />
        <LanguageMenu language={language} setLanguage={setLanguage} t={t} />
      </header>

      <div className="auth-layout register-layout">
        <section className="auth-form-column register-column">
          <h1>{t.welcome}</h1>
          <div className="register-mode-pill">{t.registerUsername || 'Create your account'}</div>

          <form onSubmit={submit} className="auth-form compact-form">
            <label className="outlined-field">
              <span>{t.username}:</span>
              <input
                type="text"
                autoComplete="username"
                maxLength={150}
                value={form.username}
                onChange={(event) => setForm({ ...form, username: event.target.value })}
                required
              />
            </label>

            <label className="outlined-field">
              <span>{t.password}:</span>
              <input
                type="password"
                autoComplete="new-password"
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                required
              />
            </label>

            {error && <div className="form-error">{error}</div>}
            <button className="gold-primary" disabled={busy}>
              {busy ? '…' : t.signUp}
            </button>
          </form>

          <p className="auth-link-row">
            <span>{t.alreadyAccount}</span> <Link to="/">{t.login}</Link>
          </p>
        </section>

        <section className="auth-art signup-art" aria-hidden="true">
          <div className="signup-orbit">
            <div className="signup-card">
              <div className="person-icon" />
              <div className="profile-lines" />
            </div>
            <div className="plus-circle">+</div>
          </div>
          <h2>Sign up and embark on<br />your digital journey!</h2>
          <p>Complete your registration and open your BXC sandbox account immediately.</p>
        </section>
      </div>

      <footer className="auth-footer">© 2026 BXC Sandbox. All rights reserved.</footer>
    </main>
  )
}
