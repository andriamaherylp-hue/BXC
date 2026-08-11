import { useMemo, useState } from 'react'
import AppHeader from '../components/AppHeader'
import SiteFooter from '../components/SiteFooter'
import { api } from '../api'

const COUNTRY_CODES=['+1','+30','+31','+32','+33','+34','+36','+39','+40','+41','+43','+44','+45','+46','+47','+48','+49','+55','+60','+61','+64','+65','+66','+81','+82','+91','+351','+354','+355','+356','+357','+358','+359','+370','+371','+372','+373','+374','+375','+377','+378','+379','+380','+381','+382','+383','+385','+386','+387','+389','+420','+421','+423','+852','+886','+7']

export default function LoanPage({ i18n, user, onLogout, onUserRefresh }) {
  const {t}=i18n
  const [amount,setAmount]=useState('')
  const [days,setDays]=useState(3)
  const [verifyOpen,setVerifyOpen]=useState(false)
  const [message,setMessage]=useState('')
  const interest=useMemo(()=>{const n=Number(amount)||0;return (n*.001*Number(days)).toFixed(2)},[amount,days])
  const submitDemo=()=>{setMessage(user?.is_verified?t.demoLoanRecorded:t.verifyFirst)}
  const submitVerification=async(e)=>{
    e.preventDefault();setMessage('')
    try{await api('/api/account/verification-request/',{method:'POST',body:JSON.stringify({requested:true})});setVerifyOpen(false);setMessage(t.verificationSubmitted);onUserRefresh?.()}catch(err){setMessage(err.message)}
  }
  return <main className="app-page loan-page">
    <AppHeader i18n={i18n} user={user} onLogout={onLogout}/>
    <section className="loan-shell">
      <h1>5,000,000 USDT</h1><p>{t.verifyIdentityLoan}</p><button className="gold-pill" onClick={()=>setVerifyOpen(true)}>{t.startVerification}</button>
      <div className="loan-form">
        <label><input placeholder={t.wantBorrow} value={amount} onChange={e=>setAmount(e.target.value)}/><span>USDT</span></label>
        <small>{t.loanRange}</small>
        <label className="term-row"><span>{t.loanTerm}</span><select value={days} onChange={e=>setDays(Number(e.target.value))}><option value="3">3 Days</option><option value="7">7 Days</option><option value="15">15 Days</option><option value="30">30 Days</option></select></label>
        <div className="loan-math"><span>{t.dailyInterest}</span><b>0.1%</b><span>{t.totalInterest}</span><b>{interest} USDT</b></div>
        <p>{t.loanDemoNotice}</p><button className="black-action" onClick={submitDemo}>{t.simulateBorrow}</button>{message&&<div className="inline-message">{message}</div>}
      </div>
    </section>
    <SiteFooter t={t}/>
    {verifyOpen&&<div className="modal-backdrop" onMouseDown={()=>setVerifyOpen(false)}><div className="verification-modal" onMouseDown={e=>e.stopPropagation()}><h2>{t.startVerification}</h2><form onSubmit={submitVerification}>
      <label><span>{t.firstName}</span><input required/></label><label><span>{t.lastName}</span><input required/></label>
      <label><span>{t.gender}</span><select required><option value="">—</option><option>Female</option><option>Male</option><option>Other</option></select></label><label><span>{t.birthdate}</span><input type="date" required/></label>
      <label><span>{t.country}</span><input required/></label><label><span>{t.address}</span><input required/></label>
      <label className="phone-verify"><span>{t.phone}</span><div><select>{COUNTRY_CODES.map(c=><option key={c}>{c}</option>)}</select><input placeholder={t.enterPhone}/></div></label><label><span>{t.email}</span><input type="email" required/></label>
      <label><span>{t.document}</span><select required><option value="">—</option><option>{t.passport}</option><option>{t.idCard}</option></select></label>
      <p className="privacy-copy">{t.verificationPrivacy}</p><button className="gold-pill" type="submit">{t.continue}</button>
    </form></div></div>}
  </main>
}
