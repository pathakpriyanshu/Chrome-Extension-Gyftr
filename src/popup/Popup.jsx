import { useEffect, useState } from 'react'
import { detectBrand, SUPPORTED_BRANDS } from '../data/brands'
import { MOCK_VOUCHERS } from '../data/mockVouchers'
import {
  checkBrandEligibility,
  fetchBestOffers,
  calculateSavings,
  getLoginState,
} from '../data/mockApi'
import AuthScreen from './AuthScreen'
import WalletScreen from './WalletScreen'

const ORANGE = '#FF6B35'
const DARK = '#1A1A2E'

export default function Popup() {
  const [tabUrl, setTabUrl] = useState('')
  const [brand, setBrand] = useState(null)
  const [ready, setReady] = useState(false)

  // Flow: intro → analyzing → result → account
  const [phase, setPhase] = useState('intro')
  const [offer, setOffer] = useState(null) // { orderValue, savings, gyftrPrice, percent }

  // Account
  const [loggedIn, setLoggedIn] = useState(false)
  const [authMode, setAuthMode] = useState('login') // 'login' | 'signup'

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const url = tabs[0]?.url ?? ''
      setTabUrl(url)
      setBrand(detectBrand(url))
      const { loggedIn, mode } = await getLoginState()
      setLoggedIn(loggedIn)
      setAuthMode(mode)
      setReady(true)
    })
  }, [])

  if (!ready) {
    return (
      <Shell brand={null}>
        <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>
          <Spinner size={22} />
          <p style={{ marginTop: 12, fontSize: 13 }}>Loading…</p>
        </div>
      </Shell>
    )
  }

  if (!brand) {
    return (
      <Shell brand={null}>
        <BrowseFallback />
      </Shell>
    )
  }

  return (
    <Shell brand={brand}>
      {phase === 'intro' && (
        <IntroScreen brand={brand} onStart={() => setPhase('analyzing')} />
      )}
      {phase === 'analyzing' && (
        <AnalyzingScreen
          brand={brand}
          tabUrl={tabUrl}
          onDone={(computedOffer) => {
            setOffer(computedOffer)
            setPhase('result')
          }}
        />
      )}
      {phase === 'result' && (
        <ResultScreen
          brand={brand}
          offer={offer}
          onUseVoucher={() => setPhase('account')}
        />
      )}
      {phase === 'account' &&
        (loggedIn ? (
          <WalletScreen
            brand={brand}
            offer={offer}
            mode={authMode}
            onLogout={() => setLoggedIn(false)}
          />
        ) : (
          <AuthScreen
            brand={brand}
            onAuthed={(mode) => {
              setAuthMode(mode)
              setLoggedIn(true)
            }}
          />
        ))}
    </Shell>
  )
}

/* ----------------------------- Shell / Header ---------------------------- */

function Shell({ brand, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 480 }}>
      <div
        style={{
          background: `linear-gradient(135deg, ${ORANGE} 0%, #ff8c5a 100%)`,
          padding: '18px 16px 16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            style={{
              fontWeight: 900,
              fontSize: 20,
              color: '#fff',
              letterSpacing: '-0.5px',
            }}
          >
            GYFTR
          </span>
          <span
            style={{
              background: 'rgba(255,255,255,0.25)',
              color: '#fff',
              fontSize: 10,
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: 999,
            }}
          >
            VOUCHER ASSISTANT
          </span>
        </div>
        {brand ? (
          <div
            style={{
              fontSize: 13,
              color: 'rgba(255,255,255,0.92)',
              marginTop: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span style={{ fontSize: 15 }}>{brand.emoji}</span>
            You're on <strong>{brand.name}</strong> — let's find your savings
          </div>
        ) : (
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 8 }}>
            Open a supported store's checkout to unlock savings
          </div>
        )}
      </div>
      <div style={{ flex: 1, background: '#fafafa' }}>{children}</div>
    </div>
  )
}

/* ------------------------------- Intro ---------------------------------- */

function IntroScreen({ brand, onStart }) {
  return (
    <div style={{ padding: '28px 20px', textAlign: 'center' }} className="gyftr-fade-up">
      <div style={{ fontSize: 52, marginBottom: 8 }}>{brand.emoji}</div>
      <h2 style={{ fontSize: 17, color: DARK, margin: '0 0 6px' }}>
        Shopping on {brand.name}?
      </h2>
      <p style={{ fontSize: 13, color: '#777', lineHeight: 1.55, margin: '0 0 24px' }}>
        Pay for this order through GYFTR and get it for less. Let's check exactly
        how much you could save right now.
      </p>
      <button onClick={onStart} style={primaryBtn}>
        💰 How much can I save on this?
      </button>
      <p style={{ fontSize: 11, color: '#aaa', marginTop: 14 }}>
        Takes a few seconds · No sign-in needed to check
      </p>
    </div>
  )
}

/* ----------------------------- Analyzing -------------------------------- */

const STEPS = [
  {
    pending: 'Checking brand eligibility…',
    done: (b) => `Congrats! ${b.name} is available on GYFTR`,
  },
  {
    pending: 'Verifying the best offers for you…',
    done: () => 'Hold tight — finding you the biggest saving ✨',
  },
  {
    pending: 'Calculating your GYFTR price…',
    done: () => 'Savings unlocked! 🔓',
  },
]

function AnalyzingScreen({ brand, tabUrl, onDone }) {
  const [stepIndex, setStepIndex] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function run() {
      const elig = await checkBrandEligibility(tabUrl)
      if (cancelled) return
      setStepIndex(1)

      await fetchBestOffers(brand.id)
      if (cancelled) return
      setStepIndex(2)

      const computedOffer = await calculateSavings(brand.id)
      if (cancelled) return
      setStepIndex(3)

      await new Promise((r) => setTimeout(r, 650))
      if (!cancelled) onDone(computedOffer)
    }

    run()
    return () => {
      cancelled = true
    }
  }, [brand, tabUrl, onDone])

  return (
    <div style={{ padding: '26px 20px' }} className="gyftr-fade-up">
      <p
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: '#999',
          textTransform: 'uppercase',
          letterSpacing: 0.6,
          marginBottom: 18,
          textAlign: 'center',
        }}
      >
        Analysing your {brand.name} order
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {STEPS.map((step, i) => {
          const state = i < stepIndex ? 'done' : i === stepIndex ? 'active' : 'upcoming'
          return (
            <StepRow
              key={i}
              state={state}
              label={state === 'done' ? step.done(brand) : step.pending}
            />
          )
        })}
      </div>
    </div>
  )
}

function StepRow({ state, label }) {
  const isDone = state === 'done'
  const isActive = state === 'active'

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 14px',
        borderRadius: 12,
        background: isActive ? '#fff' : 'transparent',
        boxShadow: isActive ? '0 2px 10px rgba(0,0,0,0.06)' : 'none',
        opacity: state === 'upcoming' ? 0.4 : 1,
        transition: 'all 0.25s',
      }}
    >
      <div style={{ flexShrink: 0 }}>
        {isDone ? (
          <CheckCircle />
        ) : isActive ? (
          <Spinner size={20} />
        ) : (
          <div style={{ width: 20, height: 20, borderRadius: 999, border: '2px solid #ddd' }} />
        )}
      </div>
      <span
        style={{
          fontSize: 13.5,
          fontWeight: isActive ? 700 : 500,
          color: isDone ? '#22a355' : isActive ? DARK : '#999',
        }}
      >
        {label}
      </span>
    </div>
  )
}

/* ------------------------------- Result --------------------------------- */

function ResultScreen({ brand, offer, onUseVoucher }) {
  const { orderValue, savings, gyftrPrice, percent } = offer

  return (
    <div style={{ padding: '20px 20px' }} className="gyftr-fade-up">
      {/* Savings hero */}
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 12.5, color: '#888', fontWeight: 600 }}>
          🎉 Good news! On this order you save
        </div>
        <div
          className="gyftr-pop"
          style={{ fontSize: 46, fontWeight: 900, color: ORANGE, lineHeight: 1.1, margin: '4px 0' }}
        >
          ₹{savings.toLocaleString('en-IN')}
        </div>
        <div
          style={{
            display: 'inline-block',
            background: '#eafaf0',
            color: '#22a355',
            fontSize: 12,
            fontWeight: 700,
            padding: '3px 10px',
            borderRadius: 999,
          }}
        >
          {percent}% off with GYFTR
        </div>
      </div>

      {/* Price breakdown */}
      <div
        style={{
          background: '#fff',
          border: '1px solid #eee',
          borderRadius: 14,
          padding: '14px 16px',
          marginBottom: 16,
          boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
        }}
      >
        <Row
          label="Current cart value"
          value={`₹${orderValue.toLocaleString('en-IN')}`}
          valueStyle={{ color: '#999', textDecoration: 'line-through' }}
        />
        <Row
          label={`GYFTR saving (${percent}%)`}
          value={`− ₹${savings.toLocaleString('en-IN')}`}
          valueStyle={{ color: '#22a355', fontWeight: 700 }}
        />
        <div style={{ height: 1, background: '#f0f0f0', margin: '10px 0' }} />
        <Row
          label={<strong style={{ color: DARK }}>Your price via GYFTR</strong>}
          value={`₹${gyftrPrice.toLocaleString('en-IN')}`}
          valueStyle={{ color: ORANGE, fontWeight: 900, fontSize: 18 }}
        />
      </div>

      <button onClick={onUseVoucher} style={primaryBtn}>
        Use your GYFTR voucher →
      </button>
      <p style={{ fontSize: 11, color: '#aaa', textAlign: 'center', marginTop: 12, lineHeight: 1.5 }}>
        Pay for this order through GYFTR gift vouchers to lock in ₹
        {gyftrPrice.toLocaleString('en-IN')}
      </p>
    </div>
  )
}

function Row({ label, value, valueStyle }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '4px 0',
      }}
    >
      <span style={{ fontSize: 13, color: '#666' }}>{label}</span>
      <span style={{ fontSize: 14, ...valueStyle }}>{value}</span>
    </div>
  )
}

/* --------------------------- Browse Fallback ---------------------------- */

function BrowseFallback() {
  const [tab, setTab] = useState('vouchers')
  const allVouchers = SUPPORTED_BRANDS.flatMap((b) =>
    (MOCK_VOUCHERS[b.id] ?? []).map((v) => ({ ...v, brand: b }))
  )

  return (
    <div>
      <div style={{ display: 'flex', borderBottom: '1px solid #ececec', background: '#fff' }}>
        {[
          { id: 'vouchers', label: 'Sample Offers' },
          { id: 'brands', label: 'Supported Brands' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              flex: 1,
              padding: '11px 0',
              border: 'none',
              background: 'none',
              fontWeight: tab === t.id ? 700 : 500,
              fontSize: 13,
              color: tab === t.id ? ORANGE : '#888',
              borderBottom: tab === t.id ? `2px solid ${ORANGE}` : '2px solid transparent',
              cursor: 'pointer',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ padding: 12 }}>
        {tab === 'vouchers' ? (
          allVouchers.map((v, i) => (
            <div
              key={i}
              style={{
                border: '1px solid #eee',
                borderRadius: 10,
                padding: '10px 12px',
                marginBottom: 10,
                background: '#fff',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <span style={{ fontSize: 15 }}>{v.brand.emoji}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#555' }}>
                  {v.brand.name}
                </span>
                <span
                  style={{
                    marginLeft: 'auto',
                    fontSize: 11,
                    fontWeight: 700,
                    color: ORANGE,
                  }}
                >
                  Save {v.brand.cashbackPercent}%
                </span>
              </div>
              <div style={{ fontSize: 12, color: '#666' }}>{v.label}</div>
            </div>
          ))
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {SUPPORTED_BRANDS.map((b) => (
              <div
                key={b.id}
                style={{
                  background: '#fff',
                  border: '1px solid #ececec',
                  borderRadius: 10,
                  padding: '10px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span style={{ fontSize: 20 }}>{b.emoji}</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: DARK }}>{b.name}</div>
                  <div style={{ fontSize: 10, color: ORANGE, fontWeight: 600 }}>
                    Save {b.cashbackPercent}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ------------------------------ Primitives ------------------------------ */

export const primaryBtn = {
  width: '100%',
  background: ORANGE,
  color: '#fff',
  border: 'none',
  borderRadius: 12,
  padding: '15px',
  fontSize: 15,
  fontWeight: 800,
  cursor: 'pointer',
  boxShadow: '0 6px 18px rgba(255,107,53,0.35)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
}

export function Spinner({ size = 20 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 999,
        border: `${Math.max(2, size / 10)}px solid #ffe0d3`,
        borderTopColor: ORANGE,
        animation: 'gyftr-spin 0.7s linear infinite',
      }}
    />
  )
}

function CheckCircle() {
  return (
    <div
      className="gyftr-pop"
      style={{
        width: 20,
        height: 20,
        borderRadius: 999,
        background: '#22a355',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontSize: 12,
        fontWeight: 900,
      }}
    >
      ✓
    </div>
  )
}
