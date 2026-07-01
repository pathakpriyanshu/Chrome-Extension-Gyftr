import { detectBrand } from '../data/brands.js'
import { getVouchersForBrand } from '../data/mockVouchers.js'

// Listen for tab URL changes and badge the extension icon
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete' || !tab.url) return

  const brand = detectBrand(tab.url)
  if (!brand) {
    chrome.action.setBadgeText({ text: '', tabId })
    return
  }

  const vouchers = getVouchersForBrand(brand.id)

  if (vouchers.length > 0) {
    chrome.action.setBadgeText({ text: `${vouchers.length}`, tabId })
    chrome.action.setBadgeBackgroundColor({ color: '#FF6B35', tabId })
  } else {
    // Show a "%" badge to indicate cashback is available
    chrome.action.setBadgeText({ text: '%', tabId })
    chrome.action.setBadgeBackgroundColor({ color: '#1A1A2E', tabId })
  }

  // Notify the content script about the detected brand
  try {
    await chrome.tabs.sendMessage(tabId, {
      type: 'BRAND_DETECTED',
      brand,
      vouchers,
    })
  } catch {
    // Content script may not be ready yet; it will request state on mount
  }
})

// Respond to content script asking for current brand state
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_BRAND_STATE') {
    chrome.tabs.get(sender.tab.id, async (tab) => {
      const brand = detectBrand(tab.url)
      if (!brand) {
        sendResponse({ brand: null, vouchers: [] })
        return
      }
      const vouchers = getVouchersForBrand(brand.id)
      sendResponse({ brand, vouchers })
    })
    return true // async response
  }
})
