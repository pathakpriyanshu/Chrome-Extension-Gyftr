import { useEffect, useState } from 'react'
import { SUPPORTED_BRANDS } from '../data/brands'
import { MOCK_VOUCHERS } from '../data/mockVouchers'

export default function Popup() {
  const [currentBrand, setCurrentBrand] = useState(null)
  const [activeTab, setActiveTab] = useState('vouchers') // 'vouchers' | 'brands'

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const url = tabs[0]?.url ?? ''
      chrome.runtime.sendMessage({ type: 'GET_BRAND_STATE', url }, (response) => {
        if (response?.brand) setCurrentBrand(response.brand)
      })
    })
  }, [])

  const allVouchers = SUPPORTED_BRANDS.flatMap((b) =>
    (MOCK_VOUCHERS[b.id] ?? []).map((v) => ({ ...v, brand: b }))
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #FF6B35 0%, #ff8c5a 100%)',
          padding: '20px 16px 16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <span style={{ fontWeight: 900, fontSize: 20, color: '#fff', letterSpacing: '-0.5px' }}>
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
        {currentBrand ? (
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', marginTop: 6 }}>
            {currentBrand.emoji} On <strong>{currentBrand.name}</strong> checkout —{' '}
            {(MOCK_VOUCHERS[currentBrand.id] ?? []).length > 0
              ? `${(MOCK_VOUCHERS[currentBrand.id] ?? []).length} voucher(s) ready to apply`
              : `save up to ${currentBrand.cashbackPercent}% via GYFTR`}
          </div>
        ) : (
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 6 }}>
            Navigate to a supported checkout page to use your vouchers
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #ececec', background: '#fff' }}>
        {[
          { id: 'vouchers', label: 'My Vouchers' },
          { id: 'brands', label: 'Supported Brands' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              padding: '10px 0',
              border: 'none',
              background: 'none',
              fontWeight: activeTab === tab.id ? 700 : 500,
              fontSize: 13,
              color: activeTab === tab.id ? '#FF6B35' : '#888',
              borderBottom: activeTab === tab.id ? '2px solid #FF6B35' : '2px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
        {activeTab === 'vouchers' ? (
          allVouchers.length > 0 ? (
            allVouchers.map((v, i) => <PopupVoucherCard key={i} voucher={v} />)
          ) : (
            <EmptyState message="No vouchers saved yet. Buy gift cards on GYFTR to unlock vouchers." />
          )
        ) : (
          <BrandGrid />
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          borderTop: '1px solid #ececec',
          padding: '10px 16px',
          display: 'flex',
          justifyContent: 'center',
          background: '#fff',
        }}
      >
        <a
          href="https://www.gyftr.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: '#FF6B35',
            fontSize: 12,
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Shop on GYFTR.com →
        </a>
      </div>
    </div>
  )
}

function PopupVoucherCard({ voucher }) {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(voucher.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      style={{
        border: '1.5px dashed #FF6B35',
        borderRadius: 10,
        padding: '10px 12px',
        marginBottom: 10,
        background: '#fff9f7',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        <span style={{ fontSize: 16 }}>{voucher.brand.emoji}</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#555' }}>{voucher.brand.name}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
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
            Expires{' '}
            {new Date(voucher.expiry).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </div>
        </div>
        <button
          onClick={copy}
          style={{
            background: copied ? '#22c55e' : '#FF6B35',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '6px 12px',
            fontSize: 11,
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'background 0.2s',
            whiteSpace: 'nowrap',
          }}
        >
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
    </div>
  )
}

function BrandGrid() {
  return (
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
            <div style={{ fontSize: 12, fontWeight: 600, color: '#1A1A2E' }}>{b.name}</div>
            <div style={{ fontSize: 10, color: '#FF6B35', fontWeight: 600 }}>
              Save {b.cashbackPercent}%
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState({ message }) {
  return (
    <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999' }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>🎟️</div>
      <p style={{ fontSize: 13, lineHeight: 1.6 }}>{message}</p>
    </div>
  )
}
