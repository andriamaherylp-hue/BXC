import { useEffect, useMemo, useState } from 'react'
import AppHeader from '../components/AppHeader'
import SiteFooter from '../components/SiteFooter'
import { api } from '../api'

export default function InviteFriendsPage({ i18n, user, onLogout }) {
  const { t } = i18n
  const [accountCode, setAccountCode] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let alive = true
    api('/api/account/summary/')
      .then((data) => { if (alive) setAccountCode(data.account_code || '') })
      .catch(() => {})
    return () => { alive = false }
  }, [])

  const inviteUrl = useMemo(() => {
    const base = typeof window !== 'undefined' ? window.location.origin : ''
    return `${base}/register${accountCode ? `?ref=${encodeURIComponent(accountCode)}` : ''}`
  }, [accountCode])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch (_) {
      setCopied(false)
    }
  }

  return (
    <main className="app-page info-page">
      <AppHeader i18n={i18n} user={user} onLogout={onLogout} />
      <section className="info-shell invite-shell">
        <div className="breadcrumb">BXC <span>›</span> Invite friends</div>
        <h1>Invite Your Friends</h1>
        <div className="invite-illustration" aria-hidden="true">
          <div className="mini-profile-card"><span /></div>
          <div className="mini-profile-card main"><span /></div>
          <div className="mini-profile-card"><span /></div>
        </div>
        <p className="invite-copy">Invite friends and family to explore the BXC sandbox experience together.</p>
        <div className="invite-steps">
          <article><strong>Register #1</strong><span>Create a sandbox account.</span></article>
          <article><strong>Explore #2</strong><span>Review the account and market tools.</span></article>
          <article><strong>Demo #3</strong><span>Try simulated trading features.</span></article>
        </div>
        <div className="invite-link-box"><code>{inviteUrl}</code><button type="button" onClick={copy}>{copied ? 'Copied' : 'Copy'}</button></div>
      </section>
      <SiteFooter t={t} />
    </main>
  )
}
