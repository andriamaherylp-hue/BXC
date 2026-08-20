import { useMemo, useState } from 'react'
import AppHeader from '../components/AppHeader'
import SiteFooter from '../components/SiteFooter'
import inviteArt from '../assets/bxc/login_art.svg'

export default function InvitePage({ i18n, user, onLogout }) {
  const {t}=i18n
  const [copied,setCopied]=useState(false)
  const link=useMemo(()=>`${window.location.origin}/register?ref=${encodeURIComponent(user?.account_code||user?.username||'BXC')}`,[user])
  const copy=async()=>{try{await navigator.clipboard.writeText(link);setCopied(true);setTimeout(()=>setCopied(false),1600)}catch(_){}}
  return <main className="app-page content-page invite-page">
    <AppHeader i18n={i18n} user={user} onLogout={onLogout}/>
    <section className="invite-shell">
      <div className="breadcrumb">BXC <span>›</span> {t.inviteFriends}</div>
      <h1>{t.inviteFriends}</h1>
      <img className="invite-art" src={inviteArt} alt="" aria-hidden="true"/>
      <p className="invite-lead">Invite your friends and family to explore the BXC sandbox together.</p>
      <div className="invite-steps">
        <div><strong>Register #1</strong><span>Open the registration page and create a sandbox account.</span></div>
        <div><strong>Explore #2</strong><span>Open the markets, finance and account demo modules.</span></div>
        <div><strong>Trade #3</strong><span>Use demo orders without moving real funds.</span></div>
      </div>
      <div className="invite-link-card"><input readOnly value={link}/><button className="gold-pill" onClick={copy}>{copied?'Copied':'Copy'}</button></div>
    </section>
    <SiteFooter t={t}/>
  </main>
}
