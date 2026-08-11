import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api'
import Brand from '../components/Brand'
import LanguageMenu from '../components/LanguageMenu'

const PHONE_CODES = ['+49', '+55', '+60', '+61', '+64', '+65', '+66', '+81', '+91', '+852', '+886', '+1', '+82', '+33', '+39', '+34', '+44', '+31', '+32', '+41', '+43', '+45', '+46', '+47', '+358', '+351', '+30', '+353', '+36', '+420', '+421', '+48', '+40', '+359', '+385', '+386', '+372', '+371', '+370', '+356', '+357', '+354', '+423', '+377', '+378', '+379', '+381', '+382', '+383', '+387', '+389', '+355', '+374', '+375', '+380', '+373', '+7']

function formatCountdown(seconds) {
  const value = Math.max(0, Number(seconds) || 0)
  return `00:${String(value).padStart(2, '0')}`
}

export default function RegisterPage({ i18n, onLogin }) {
  const { language, setLanguage, t } = i18n
  const [mode, setMode] = useState('phone')
  const [countryCode, setCountryCode] = useState('+1')
  const [form, setForm] = useState({ destination:'', username:'', password:'', confirmPassword:'', code:'' })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [sendingCode, setSendingCode] = useState(false)
  const [codeSeconds, setCodeSeconds] = useState(0)
  const [codeRequested, setCodeRequested] = useState(false)
  const navigate = useNavigate()

  const destination = useMemo(() => (
    mode === 'phone'
      ? `${countryCode}${form.destination.replace(/\s+/g,'')}`
      : form.destination.trim()
  ), [mode, countryCode, form.destination])

  useEffect(() => {
    if (codeSeconds <= 0) return undefined
    const timer = window.setInterval(() => {
      setCodeSeconds(current => Math.max(0, current - 1))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [codeSeconds])

  useEffect(() => {
    if (codeRequested && codeSeconds === 0) {
      setMessage('')
    }
  }, [codeRequested, codeSeconds])

  const resetVerification = () => {
    setCodeSeconds(0)
    setCodeRequested(false)
    setMessage('')
    setError('')
    setForm(current => ({ ...current, code:'' }))
  }

  const updateDestination = (value) => {
    if (codeRequested) resetVerification()
    setForm(current => ({ ...current, destination:value, code:'' }))
  }

  const changeMode = () => {
    const nextMode = mode === 'phone' ? 'email' : 'phone'
    setMode(nextMode)
    setForm({destination:'',username:'',password:'',confirmPassword:'',code:''})
    setMessage('')
    setError('')
    setCodeSeconds(0)
    setCodeRequested(false)
  }

  const sendCode = async () => {
    setError('')
    setMessage('')
    if (!form.destination.trim()) return setError(mode === 'email' ? 'Email required.' : 'Phone number required.')
    if (codeSeconds > 0 || sendingCode) return

    setSendingCode(true)
    try {
      const data = await api('/api/auth/register/request-code/', {
        method:'POST',
        body:JSON.stringify({mode, destination}),
      })
      const seconds = Math.max(1, Number(data.expires_in || data.resend_in || 60))
      setCodeRequested(true)
      setCodeSeconds(seconds)
      setMessage(data.dev_code ? `${t.codeSent} DEV: ${data.dev_code}` : t.codeSent)
    } catch (err) {
      const retry = Number(err.payload?.retry_after || 0)
      if (retry > 0) {
        setCodeRequested(true)
        setCodeSeconds(retry)
      }
      setError(err.message)
    } finally {
      setSendingCode(false)
    }
  }

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')

    if (!codeRequested || codeSeconds <= 0) {
      setError(t.codeExpired || 'Verification code expired. Request a new code.')
      return
    }
    if (!form.code.trim()) {
      setError(t.enterVerificationCode || 'Enter the verification code sent to you.')
      return
    }

    setBusy(true)
    try {
      const data = await api('/api/auth/register/', {
        method:'POST',
        body:JSON.stringify({
          mode,
          destination,
          username:form.username,
          password:form.password,
          confirm_password:form.confirmPassword,
          code:form.code,
          preferred_language:language,
        }),
      })
      setMessage(t.accountCreated)
      onLogin(data.user)
      navigate('/home')
    } catch (err) {
      setError(err.message)
      if (/expired/i.test(err.message || '')) setCodeSeconds(0)
    } finally {
      setBusy(false)
    }
  }

  const sendLabel = sendingCode
    ? (t.sendingCode || 'Sending…')
    : codeSeconds > 0
      ? formatCountdown(codeSeconds)
      : codeRequested
        ? (t.resendCode || 'Resend')
        : t.send

  return (
    <main className="auth-page register-page">
      <header className="auth-top"><Brand /><LanguageMenu language={language} setLanguage={setLanguage} t={t} /></header>
      <div className="auth-layout register-layout">
        <section className="auth-form-column register-column">
          <h1>{t.welcome}</h1>
          <button className="register-mode-pill" onClick={changeMode}>
            {mode === 'phone' ? t.registerEmail : t.registerPhone}
          </button>

          <form onSubmit={submit} className="auth-form compact-form">
            {mode === 'phone' ? (
              <label className="outlined-field phone-field">
                <span>{t.phone}:</span>
                <div className="phone-inner">
                  <select value={countryCode} onChange={e=>{ setCountryCode(e.target.value); if (codeRequested) resetVerification() }}>
                    {PHONE_CODES.map(code => <option key={code}>{code}</option>)}
                  </select>
                  <input inputMode="tel" placeholder="66666666" value={form.destination} onChange={e=>updateDestination(e.target.value)} required />
                </div>
              </label>
            ) : (
              <label className="outlined-field">
                <span>{t.email}:</span>
                <input type="email" placeholder="name@gmail.com" value={form.destination} onChange={e=>updateDestination(e.target.value)} required />
              </label>
            )}

            <label className="outlined-field"><span>{t.username}</span><input value={form.username} onChange={e=>setForm({...form,username:e.target.value})} required /></label>
            <label className="outlined-field"><span>{t.password}:</span><input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required /></label>
            <label className="outlined-field"><span>{t.confirmPassword}:</span><input type="password" value={form.confirmPassword} onChange={e=>setForm({...form,confirmPassword:e.target.value})} required /></label>

            <label className="outlined-field verification-field">
              <span>{t.verificationCode}:</span>
              <input inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={form.code} onChange={e=>setForm({...form,code:e.target.value.replace(/\D/g,'').slice(0,6)})} required />
              <button type="button" disabled={sendingCode || codeSeconds > 0} onClick={sendCode}>{sendLabel}</button>
            </label>

            {codeRequested && codeSeconds > 0 && (
              <div className="verification-countdown" role="status">
                {(t.codeExpiresIn || 'Verification code expires in')} <strong>{formatCountdown(codeSeconds)}</strong>
              </div>
            )}
            {codeRequested && codeSeconds === 0 && (
              <div className="verification-expired">{t.codeExpired || 'Verification code expired. Request a new code.'}</div>
            )}

            {error && <div className="form-error">{error}</div>}
            {message && <div className="form-success">{message}</div>}
            <button className="gold-primary" disabled={busy || !codeRequested || codeSeconds <= 0}>{busy ? '…' : t.signUp}</button>
          </form>

          <p className="auth-link-row"><span>{t.alreadyAccount}</span> <Link to="/">{t.login}</Link></p>
        </section>

        <section className="auth-art signup-art" aria-hidden="true">
          <div className="signup-orbit"><div className="signup-card"><div className="person-icon"/><div className="profile-lines"/></div><div className="plus-circle">+</div></div>
          <h2>Sign up and embark on<br/>your digital journey!</h2>
          <p>Complete your registration and unlock a clean, responsive account experience designed for modern web access.</p>
        </section>
      </div>
      <footer className="auth-footer">© 2026 BXC Sandbox. All rights reserved.</footer>
    </main>
  )
}
