import { useState } from 'react'
import { api } from '../api'

const COUNTRY_CODES=['+1','+30','+31','+32','+33','+34','+36','+39','+40','+41','+43','+44','+45','+46','+47','+48','+49','+55','+60','+61','+64','+65','+66','+81','+82','+91','+351','+354','+355','+356','+357','+358','+359','+370','+371','+372','+373','+374','+375','+377','+378','+379','+380','+381','+382','+383','+385','+386','+387','+389','+420','+421','+423','+852','+886','+7']

export default function VerificationModal({ t, onClose, onDone }) {
  const [busy,setBusy]=useState(false)
  const [error,setError]=useState('')
  const submit=async(e)=>{
    e.preventDefault()
    setBusy(true);setError('')
    try{
      await api('/api/account/verification-request/',{method:'POST',body:JSON.stringify({requested:true})})
      onDone?.()
      onClose?.()
    }catch(err){setError(err.message)}finally{setBusy(false)}
  }
  return <div className="modal-backdrop" onMouseDown={onClose}>
    <div className="verification-modal account-verification-modal" onMouseDown={e=>e.stopPropagation()}>
      <button className="modal-close-x" onClick={onClose}>×</button>
      <h2>{t.startVerification}</h2>
      <form onSubmit={submit}>
        <label><span>{t.firstName}</span><input required/></label>
        <label><span>{t.lastName}</span><input required/></label>
        <label><span>{t.gender}</span><select required><option value="">—</option><option>Female</option><option>Male</option><option>Other</option></select></label>
        <label><span>{t.birthdate}</span><input type="date" required/></label>
        <label><span>{t.country}</span><input required/></label>
        <label><span>{t.address}</span><input required/></label>
        <label className="phone-verify"><span>{t.phone}</span><div><select>{COUNTRY_CODES.map(c=><option key={c}>{c}</option>)}</select><input placeholder={t.enterPhone}/></div></label>
        <label><span>{t.email}</span><input type="email" required/></label>
        <label><span>{t.document}</span><select required><option value="">—</option><option>{t.passport}</option><option>{t.idCard}</option></select></label>
        {error&&<div className="form-error verification-error">{error}</div>}
        <button className="gold-pill" type="submit" disabled={busy}>{busy?'…':t.continue}</button>
      </form>
    </div>
  </div>
}
