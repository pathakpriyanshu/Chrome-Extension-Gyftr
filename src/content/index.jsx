import { createRoot } from 'react-dom/client'
import { detectBrand } from '../data/brands'
import { getVouchersForBrand } from '../data/mockVouchers'
import FloatingWidget from './FloatingWidget'

let rootInstance = null
let containerEl = null

function mountWidget(brand, vouchers) {
  if (!containerEl) {
    containerEl = document.createElement('div')
    containerEl.id = 'gyftr-widget-root'
    document.body.appendChild(containerEl)
  }

  if (!rootInstance) {
    rootInstance = createRoot(containerEl)
  }

  rootInstance.render(<FloatingWidget brand={brand} vouchers={vouchers} />)
}

function unmountWidget() {
  if (rootInstance) {
    rootInstance.unmount()
    rootInstance = null
  }
  if (containerEl) {
    containerEl.remove()
    containerEl = null
  }
}

function init() {
  const brand = detectBrand(window.location.href)
  if (!brand) return

  const vouchers = getVouchersForBrand(brand.id)
  mountWidget(brand, vouchers)
}

// Listen for background script messages (navigation updates)
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'BRAND_DETECTED') {
    const { brand, vouchers } = message
    if (brand) {
      mountWidget(brand, vouchers)
    } else {
      unmountWidget()
    }
  }
})

// Run on initial load
init()
