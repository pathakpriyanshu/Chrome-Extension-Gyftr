import { useState } from 'react'
import { getAccountVouchers, logout } from '../data/mockApi'
import { primaryBtn, Spinner } from './Popup'

const ORANGE = '#FF6B35'
const DARK = '#1A1A2E'

export default function WalletScreen({ brand, offer, mode, onLogout }) {
  const savedVouchers = getAccountVouchers(brand.id, mode)
  const hasSaved = savedVouchers.length > 0

  // action: null | 'applied' | 'buying'
  const [action, setAction] = useState(null)

  const savings = offer?.savings ?? 0
  const gyftrPrice = offer?.gyftrPrice ?? 0

  const buyOnGyftr = () => {
    setAction('buying')
    // In production this deep-links to the brand's GYFTR gift-card page
    window.open('https://www.gyftr.com', '_blank', 'noopener')
  }

  if (action === 'applied') {
    return (
      <Done
        emoji="✅"
        title="Voucher applied!"
        body={
          <>
            Your saved {brand.name} gift voucher is ready. Complete your order and
            you'll save <strong style={{ color: ORANGE }}>₹{savings.toLocaleString('en-IN')}</strong>.
          </>
        }
      />
    )
  }

  if (action === 'buying') {
    return (
      <Done
        emoji="🛍️"
        title="Opening GYFTR…"
        body={
          <>
            Buy your {brand.name} gift voucher on GYFTR for{' '}
            <strong style={{ color: ORANGE }}>₹{gyftrPrice.toLocaleString('en-IN')}</strong>, then
            pay with it at checkout to save ₹{savings.toLocaleString('en-IN')}.
          </>
        }
      />
    )
  }

  return (
    <div style={{ padding: '20px 20px' }} className="gyftr-fade-up">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
      >
        <div>
          <h2 style={{ fontSize: 16, color: DARK, margin: 0 }}>Your GYFTR wallet</h2>
          <div style={{ fontSize: 11.5, color: '#22a355', fontWeight: 600, marginTop: 2 }}>
            ● Signed in
          </div>
        </div>
        <button
          onClick={async () => {
            await logout()
            onLogout?.()
          }}
          style={{
            background: 'none',
            border: '1px solid #ddd',
            borderRadius: 8,
            padding: '5px 10px',
            fontSize: 11,
            color: '#888',
            cursor: 'pointer',
          }}
        >
          Log out
        </button>
      </div>

      {/* Saved voucher (returning users) */}
      {hasSaved && (
        <div
          style={{
            border: `1.5px solid ${ORANGE}`,
            borderRadius: 14,
            padding: '14px 16px',
            marginBottom: 14,
            background: '#fff9f7',
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, color: ORANGE, letterSpacing: 0.4 }}>
            ★ SAVED IN YOUR ACCOUNT
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: DARK, marginTop: 6 }}>
            {brand.emoji} {brand.name} gift voucher
          </div>
          <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
            {savedVouchers[0].label}
          </div>
          <button
            onClick={() => setAction('applied')}
            style={{ ...primaryBtn, marginTop: 12, padding: '12px' }}
          >
            Use saved voucher &amp; save ₹{savings.toLocaleString('en-IN')}
          </button>
        </div>
      )}

      {/* Buy a new gift card (always available) */}
      <div
        style={{
          border: '1px solid #eee',
          borderRadius: 14,
          padding: '14px 16px',
          background: '#fff',
          boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 700, color: DARK }}>
          {hasSaved ? 'Need more?' : `Buy a ${brand.name} gift voucher`}
        </div>
        <div style={{ fontSize: 12, color: '#666', marginTop: 4, lineHeight: 1.5 }}>
          Buy a ₹{offer?.orderValue?.toLocaleString('en-IN')} {brand.name} voucher on
          GYFTR for just{' '}
          <strong style={{ color: ORANGE }}>₹{gyftrPrice.toLocaleString('en-IN')}</strong> and use
          it at checkout.
        </div>
        <button
          onClick={buyOnGyftr}
          style={{
            ...(hasSaved ? secondaryBtn : primaryBtn),
            marginTop: 12,
            padding: '12px',
          }}
        >
          Buy on GYFTR &amp; save ₹{savings.toLocaleString('en-IN')} →
        </button>
      </div>

      <p style={{ fontSize: 10.5, color: '#aaa', textAlign: 'center', marginTop: 14 }}>
        Prototype · no real purchase is made
      </p>
    </div>
  )
}

function Done({ emoji, title, body }) {
  return (
    <div style={{ padding: '36px 24px', textAlign: 'center' }} className="gyftr-fade-up">
      <div className="gyftr-pop" style={{ fontSize: 54, marginBottom: 10 }}>
        {emoji}
      </div>
      <h2 style={{ fontSize: 18, color: DARK, margin: '0 0 8px' }}>{title}</h2>
      <p style={{ fontSize: 13, color: '#777', lineHeight: 1.6, margin: 0 }}>{body}</p>
    </div>
  )
}

const secondaryBtn = {
  width: '100%',
  background: '#fff',
  color: ORANGE,
  border: `1.5px solid ${ORANGE}`,
  borderRadius: 12,
  fontSize: 14,
  fontWeight: 800,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
}
