import { useState } from 'react'
import { mockAuth } from '../data/mockApi'
import { Spinner } from './Popup'

const ORANGE = '#FF6B35'
const DARK = '#1A1A2E'

export default function AuthScreen({ brand, onAuthed }) {
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [name, setName] = useState('')
  const [mobile, setMobile] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | error
  const [error, setError] = useState('')

  const submit = async () => {
    setStatus('loading')
    setError('')
    const res = await mockAuth({ mode, mobile })
    if (res.ok) {
      onAuthed(res.mode) // hand off to the wallet
    } else {
      setError(res.error)
      setStatus('error')
    }
  }

  const isSignup = mode === 'signup'

  return (
    <div style={{ padding: '22px 20px' }} className="gyftr-fade-up">
      <h2 style={{ fontSize: 17, color: DARK, margin: '0 0 4px', textAlign: 'center' }}>
        {isSignup ? 'Create your GYFTR account' : 'Login to apply your voucher'}
      </h2>
      <p
        style={{
          fontSize: 12.5,
          color: '#888',
          textAlign: 'center',
          margin: '0 0 20px',
        }}
      >
        {isSignup
          ? 'Join GYFTR to unlock instant savings'
          : 'One step away from your savings'}
      </p>

      {/* Toggle */}
      <div
        style={{
          display: 'flex',
          background: '#f0f0f0',
          borderRadius: 10,
          padding: 3,
          marginBottom: 18,
        }}
      >
        {[
          { id: 'login', label: 'Login' },
          { id: 'signup', label: 'New user? Sign up' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setMode(t.id)
              setStatus('idle')
              setError('')
            }}
            style={{
              flex: 1,
              padding: '9px 0',
              border: 'none',
              borderRadius: 8,
              background: mode === t.id ? '#fff' : 'transparent',
              boxShadow: mode === t.id ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
              fontSize: 12.5,
              fontWeight: mode === t.id ? 700 : 500,
              color: mode === t.id ? ORANGE : '#888',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isSignup && (
        <Field label="Full name">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Priyanshu Pathak"
            style={inputStyle}
          />
        </Field>
      )}

      <Field label="Mobile number">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span
            style={{
              padding: '11px 12px',
              background: '#f5f5f5',
              border: '1.5px solid #ddd',
              borderRight: 'none',
              borderRadius: '9px 0 0 9px',
              fontSize: 14,
              color: '#555',
              fontWeight: 600,
            }}
          >
            +91
          </span>
          <input
            value={mobile}
            onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
            placeholder="10-digit number"
            inputMode="numeric"
            style={{ ...inputStyle, borderRadius: '0 9px 9px 0' }}
          />
        </div>
      </Field>

      {status === 'error' && (
        <p style={{ color: '#ef4444', fontSize: 12, fontWeight: 600, margin: '2px 0 12px' }}>
          {error}
        </p>
      )}

      <button
        onClick={submit}
        disabled={status === 'loading'}
        style={{
          width: '100%',
          background: ORANGE,
          color: '#fff',
          border: 'none',
          borderRadius: 12,
          padding: '14px',
          fontSize: 15,
          fontWeight: 800,
          cursor: status === 'loading' ? 'default' : 'pointer',
          opacity: status === 'loading' ? 0.85 : 1,
          boxShadow: '0 6px 18px rgba(255,107,53,0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          marginTop: 4,
        }}
      >
        {status === 'loading' ? (
          <>
            <Spinner size={16} />
            {isSignup ? 'Creating account…' : 'Sending OTP…'}
          </>
        ) : isSignup ? (
          'Create account & continue'
        ) : (
          'Continue'
        )}
      </button>

      <p style={{ fontSize: 10.5, color: '#aaa', textAlign: 'center', marginTop: 14, lineHeight: 1.5 }}>
        By continuing you agree to GYFTR's Terms & Privacy Policy.
        <br />
        This is a prototype — no real OTP is sent.
      </p>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label
        style={{
          display: 'block',
          fontSize: 12,
          fontWeight: 600,
          color: '#555',
          marginBottom: 6,
        }}
      >
        {label}
      </label>
      {children}
    </div>
  )
}

const inputStyle = {
  flex: 1,
  width: '100%',
  border: '1.5px solid #ddd',
  borderRadius: 9,
  padding: '11px 13px',
  fontSize: 14,
  outline: 'none',
  color: DARK,
}
