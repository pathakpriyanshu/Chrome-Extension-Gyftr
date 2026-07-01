// Mock GYFTR backend. Every function returns a Promise with an artificial
// delay so the UI can show a realistic multi-step "checking..." experience.
// Swap these out for real GYFTR API calls later — the signatures stay the same.

import { detectBrand } from './brands'
import { getVouchersForBrand } from './mockVouchers'

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// Mock order values + headline savings per brand (backend would compute this
// from the live cart total in production).
const BRAND_OFFER = {
  amazon: { orderValue: 4299, savings: 500 },
  flipkart: { orderValue: 3199, savings: 320 },
  myntra: { orderValue: 13299, savings: 1995 },
  nykaa: { orderValue: 1899, savings: 210 },
  ajio: { orderValue: 2499, savings: 300 },
  makemytrip: { orderValue: 18499, savings: 2100 },
  swiggy: { orderValue: 649, savings: 90 },
  zomato: { orderValue: 489, savings: 65 },
  croma: { orderValue: 42999, savings: 1800 },
  bigbasket: { orderValue: 1799, savings: 180 },
}

/** Step 1 — is this brand supported / does the user qualify? */
export async function checkBrandEligibility(url) {
  await delay(1300)
  const brand = detectBrand(url)
  return { eligible: Boolean(brand), brand }
}

/** Step 2 — fetch the best available voucher(s) for the brand. */
export async function fetchBestOffers(brandId) {
  await delay(1500)
  const vouchers = getVouchersForBrand(brandId)
  return { vouchers }
}

/** Step 3 — calculate the price you'd pay via GYFTR and how much you save. */
export async function calculateSavings(brandId) {
  await delay(1100)
  const offer = BRAND_OFFER[brandId] ?? { orderValue: 0, savings: 0 }
  const percent = offer.orderValue
    ? Math.round((offer.savings / offer.orderValue) * 100)
    : 0
  return {
    orderValue: offer.orderValue,
    savings: offer.savings,
    gyftrPrice: offer.orderValue - offer.savings,
    percent,
  }
}

/** Mock auth — pretends to send an OTP / create an account. */
export async function mockAuth({ mode, mobile }) {
  await delay(1400)
  if (!/^\d{10}$/.test(mobile ?? '')) {
    return { ok: false, error: 'Enter a valid 10-digit mobile number' }
  }
  await chrome.storage.local.set({ gyftr_logged_in: true, gyftr_mode: mode })
  return { ok: true, mode }
}

/** Is the user already signed into their GYFTR account? */
export async function getLoginState() {
  const { gyftr_logged_in, gyftr_mode } = await chrome.storage.local.get([
    'gyftr_logged_in',
    'gyftr_mode',
  ])
  return { loggedIn: Boolean(gyftr_logged_in), mode: gyftr_mode ?? 'login' }
}

export async function logout() {
  await chrome.storage.local.remove(['gyftr_logged_in', 'gyftr_mode'])
}

/**
 * Saved GYFTR gift-card vouchers already in the user's account for this brand.
 * New sign-ups start empty (they'll buy one); returning users have one saved.
 */
export function getAccountVouchers(brandId, mode) {
  if (mode === 'signup') return []
  return getVouchersForBrand(brandId).slice(0, 1)
}
