import { useEffect, useRef, useState } from 'react'
import { LANGUAGE_OPTIONS } from '../i18n'

export default function LanguageMenu({ language, setLanguage, t, dark = false }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const close = (event) => { if (ref.current && !ref.current.contains(event.target)) setOpen(false) }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [])
  return (
    <div className={`language-control ${dark ? 'dark' : ''}`} ref={ref}>
      <button className="language-button" onClick={() => setOpen(v => !v)} aria-expanded={open}>
        {t.language} <span>{open ? '⌃' : '⌄'}</span>
      </button>
      {open && (
        <div className="language-panel">
          <h3>{t.chooseLanguage}</h3>
          <div className="language-grid">
            {LANGUAGE_OPTIONS.map(([code, label]) => (
              <button key={code} className={language === code ? 'selected' : ''} onClick={() => { setLanguage(code); setOpen(false) }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
