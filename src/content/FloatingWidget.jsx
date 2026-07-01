import { useState } from 'react'
import { autofillCoupon } from '../utils/autofill'

const GYFTR_LOGO = (
  <span style={{ fontWeight: 800, fontSize: 13, letterSpacing: '-0.5px', color: '#FF6B35' }}>
    GYF<span style={{ color: '#1A1A2E' }}>TR</span>
  </span>
)

export default function FloatingWidget({ brand, vouchers }) {
  const [expanded, setExpanded] = useState(false)
  const [applyState, setApplyState] = useState({}) // { [code]: 'idle' | 'success' | 'not_found' }
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  const hasVouchers = vouchers.length > 0

  const handleApply = (voucher) => {
    const result = autofillCoupon(voucher.code, brand.couponSelectors)
    setApplyState((prev) => ({
      ...prev,
      [voucher.code]: result.success ? 'success' : 'not_found',
    }))
  }

  // Collapsed pill
  if (!expanded) {
    return (
      <div
        onClick={() => setExpanded(true)}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 2147483647,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: '#fff',
          border: '2px solid #FF6B35',
          borderRadius: 999,
          padding: '8px 16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          cursor: 'pointer',
          fontFamily: 'system-ui, sans-serif',
          userSelect: 'none',
          transition: 'transform 0.15s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.04)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        {GYFTR_LOGO}
        <span style={{ fontSize: 13, fontWeight: 600, color: '#1A1A2E' }}>
          {hasVouchers
            ? `${vouchers.length} voucher${vouchers.length > 1 ? 's' : ''} available`
            : `Save ${brand.cashbackPercent}% with GYFTR`}
        </span>
        <span
          style={{
            background: '#FF6B35',
            color: '#fff',
            borderRadius: 999,
            fontSize: 11,
            fontWeight: 700,
            padding: '2px 8px',
          }}
        >
          {hasVouchers ? 'APPLY' : 'HOW?'}
        </span>
      </div>
    )
  }

  // Expanded card
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 2147483647,
        width: 320,
        background: '#fff',
        borderRadius: 16,
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        fontFamily: 'system-ui, sans-serif',
        overflow: 'hidden',
        border: '1.5px solid #f0f0f0',
      }}
    >
      {/* Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #FF6B35 0%, #ff8c5a 100%)',
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 20 }}>{brand.emoji}</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#fff' }}>
              {brand.name} {hasVouchers ? 'Vouchers' : 'Cashback'}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)', marginTop: 1 }}>
              via {GYFTR_LOGO}
            </div>
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            borderRadius: 999,
            color: '#fff',
            width: 24,
            height: 24,
            cursor: 'pointer',
            fontSize: 14,
            lineHeight: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          ×
        </button>
      </div>

      {/* Body */}
      <div style={{ padding: 16 }}>
        {hasVouchers ? (
          <>
            <p style={{ fontSize: 12, color: '#666', margin: '0 0 12px', fontWeight: 500 }}>
              Your saved GYFTR vouchers for {brand.name}:
            </p>
            {vouchers.map((v) => (
              <VoucherCard
                key={v.code}
                voucher={v}
                state={applyState[v.code] ?? 'idle'}
                onApply={() => handleApply(v)}
              />
            ))}
          </>
        ) : (
          <CashbackPromo brand={brand} />
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          borderTop: '1px solid #f5f5f5',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <button
          onClick={() => setExpanded(false)}
          style={{
            background: 'none',
            border: 'none',
            color: '#999',
            fontSize: 12,
            cursor: 'pointer',
            padding: 0,
          }}
        >
          ← Minimize
        </button>
        <span style={{ fontSize: 11, color: '#bbb' }}>Powered by GYFTR</span>
      </div>
    </div>
  )
}

function VoucherCard({ voucher, state, onApply }) {
  return (
    <div
      style={{
        border: '1.5px dashed #FF6B35',
        borderRadius: 10,
        padding: '10px 12px',
        marginBottom: 10,
        background: '#fff9f7',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: 'monospace',
            fontWeight: 700,
            fontSize: 15,
            color: '#FF6B35',
            letterSpacing: 1,
          }}
        >
          {voucher.code}
        </div>
        <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>{voucher.label}</div>
        <div style={{ fontSize: 10, color: '#aaa', marginTop: 2 }}>
          Expires {new Date(voucher.expiry).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </div>
      </div>
      <ApplyButton state={state} onClick={onApply} />
    </div>
  )
}

function ApplyButton({ state, onClick }) {
  if (state === 'success') {
    return (
      <div style={{ fontSize: 12, color: '#22c55e', fontWeight: 600, whiteSpace: 'nowrap' }}>
        ✓ Applied!
      </div>
    )
  }
  if (state === 'not_found') {
    return (
      <div style={{ fontSize: 11, color: '#ef4444', fontWeight: 600, textAlign: 'center', maxWidth: 72 }}>
        No field found. Paste manually.
      </div>
    )
  }
  return (
    <button
      onClick={onClick}
      style={{
        background: '#FF6B35',
        color: '#fff',
        border: 'none',
        borderRadius: 8,
        padding: '6px 14px',
        fontSize: 12,
        fontWeight: 700,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        transition: 'opacity 0.15s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
    >
      Apply
    </button>
  )
}

function CashbackPromo({ brand }) {
  return (
    <div style={{ textAlign: 'center', padding: '4px 0 8px' }}>
      <div style={{ fontSize: 36, marginBottom: 8 }}>{brand.emoji}</div>
      <div
        style={{
          fontSize: 22,
          fontWeight: 800,
          color: '#FF6B35',
          lineHeight: 1.1,
          marginBottom: 6,
        }}
      >
        Save up to {brand.cashbackPercent}%
      </div>
      <p style={{ fontSize: 13, color: '#555', margin: '0 0 14px', lineHeight: 1.5 }}>
        Buy {brand.name} gift cards on <strong>GYFTR</strong> and use them at checkout to save instantly.
      </p>
      <a
        href="https://www.gyftr.com"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-block',
          background: '#FF6B35',
          color: '#fff',
          textDecoration: 'none',
          borderRadius: 8,
          padding: '9px 20px',
          fontSize: 13,
          fontWeight: 700,
        }}
      >
        Buy on GYFTR →
      </a>
    </div>
  )
}
