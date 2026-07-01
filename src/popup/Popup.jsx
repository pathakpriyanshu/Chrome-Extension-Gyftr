import { useEffect, useState } from 'react'
import { detectBrand, SUPPORTED_BRANDS } from '../data/brands'
import { MOCK_VOUCHERS } from '../data/mockVouchers'
import {
  checkBrandEligibility,
  fetchBestOffers,
  calculateSavings,
} from '../data/mockApi'
import AuthScreen from './AuthScreen'

const ORANGE = '#FF6B35'
const DARK = '#1A1A2E'

export default function Popup() {
  const [tabUrl, setTabUrl] = useState('')
  const [brand, setBrand] = useState(null)
  const [ready, setReady] = useState(false)

  // Flow: intro → analyzing → result → auth
  const [phase, setPhase] = useState('intro')

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const url = tabs[0]?.url ?? ''
      setTabUrl(url)
      setBrand(detectBrand(url)) // detect locally — no background round-trip
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

  // Not on a supported checkout page → show the browse/list fallback.
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
          onDone={() => setPhase('result')}
        />
      )}
      {phase === 'result' && (
        <ResultScreen brand={brand} onUseVoucher={() => setPhase('auth')} />
      )}
      {phase === 'auth' && <AuthScreen brand={brand} />}
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
          <div
            style={{
              fontSize: 13,
              color: 'rgba(255,255,255,0.85)',
              marginTop: 8,
            }}
          >
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
        GYFTR can check this order for gift-card vouchers and instant cashback —
        find out how much you could keep in your pocket.
      </p>
      <button
        onClick={onStart}
        style={{
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
        }}
      >
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
    done: () => 'Hold tight — locking in the top voucher ✨',
  },
  {
    pending: 'Calculating your maximum savings…',
    done: () => 'Savings unlocked! 🔓',
  },
]

function AnalyzingScreen({ brand, tabUrl, onDone }) {
  // stepIndex = the step currently in progress. Steps before it are "done".
  const [stepIndex, setStepIndex] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function run() {
      // Step 1 — eligibility
      const elig = await checkBrandEligibility(tabUrl)
      if (cancelled) return
      if (!elig.eligible) {
        onDone() // shouldn't happen (brand already detected), but be safe
        return
      }
      setStepIndex(1)

      // Step 2 — offers
      await fetchBestOffers(brand.id)
      if (cancelled) return
      setStepIndex(2)

      // Step 3 — savings
      await calculateSavings(brand.id)
      if (cancelled) return
      setStepIndex(3)

      // brief beat on the final tick before revealing the result
      await new Promise((r) => setTimeout(r, 650))
      if (!cancelled) onDone()
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
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: 999,
              border: '2px solid #ddd',
            }}
          />
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

function ResultScreen({ brand, onUseVoucher }) {
  const vouchers = MOCK_VOUCHERS[brand.id] ?? []
  // savings figure comes from the mock API's BRAND_OFFER; re-derive for display
  const savings = SAVINGS_DISPLAY[brand.id] ?? 0

  return (
    <div style={{ padding: '22px 20px' }} className="gyftr-fade-up">
      <div style={{ textAlign: 'center', marginBottom: 18 }}>
        <div style={{ fontSize: 12, color: '#888', fontWeight: 600 }}>
          🎉 Good news! You can save up to
        </div>
        <div
          className="gyftr-pop"
          style={{
            fontSize: 46,
            fontWeight: 900,
            color: ORANGE,
            lineHeight: 1.1,
            margin: '4px 0',
          }}
        >
          ₹{savings.toLocaleString('en-IN')}
        </div>
        <div style={{ fontSize: 12.5, color: '#666' }}>
          on your {brand.emoji} <strong>{brand.name}</strong> order with GYFTR
        </div>
      </div>

      {vouchers.map((v) => (
        <div
          key={v.code}
          style={{
            border: `1.5px dashed ${ORANGE}`,
            borderRadius: 12,
            padding: '12px 14px',
            marginBottom: 12,
            background: '#fff9f7',
          }}
        >
          <div
            style={{
              fontFamily: 'monospace',
              fontWeight: 800,
              fontSize: 16,
              color: ORANGE,
              letterSpacing: 1,
            }}
          >
            {v.code}
          </div>
          <div style={{ fontSize: 12, color: '#666', marginTop: 3 }}>{v.label}</div>
        </div>
      ))}

      <button
        onClick={onUseVoucher}
        style={{
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
          marginTop: 4,
        }}
      >
        Use Voucher &amp; Save →
      </button>
      <p style={{ fontSize: 11, color: '#aaa', textAlign: 'center', marginTop: 12 }}>
        Sign in to your GYFTR account to apply this at checkout
      </p>
    </div>
  )
}

// Mirror of BRAND_OFFER savings in mockApi (kept here for display only).
const SAVINGS_DISPLAY = {
  amazon: 500,
  flipkart: 320,
  myntra: 1995,
  nykaa: 210,
  ajio: 300,
  makemytrip: 2100,
  swiggy: 90,
  zomato: 65,
  croma: 1800,
  bigbasket: 180,
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
          { id: 'vouchers', label: 'My Vouchers' },
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
                border: `1.5px dashed ${ORANGE}`,
                borderRadius: 10,
                padding: '10px 12px',
                marginBottom: 10,
                background: '#fff9f7',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <span style={{ fontSize: 15 }}>{v.brand.emoji}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#555' }}>
                  {v.brand.name}
                </span>
              </div>
              <div
                style={{
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  fontSize: 15,
                  color: ORANGE,
                  letterSpacing: 1,
                }}
              >
                {v.code}
              </div>
              <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>{v.label}</div>
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
