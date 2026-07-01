export const SUPPORTED_BRANDS = [
  {
    id: 'amazon',
    name: 'Amazon',
    emoji: '📦',
    checkoutPatterns: [/amazon\.in\/(checkout|gp\/buy)/i],
    couponSelectors: ['#couponTextInput', 'input[name="claimedCode"]', 'input[placeholder*="coupon" i]'],
    cashbackPercent: 5,
  },
  {
    id: 'flipkart',
    name: 'Flipkart',
    emoji: '🛍️',
    checkoutPatterns: [/flipkart\.com\/checkout/i],
    couponSelectors: ['input[placeholder*="coupon" i]', 'input[placeholder*="promo" i]', '#couponInput'],
    cashbackPercent: 7,
  },
  {
    id: 'myntra',
    name: 'Myntra',
    emoji: '👗',
    // Also matches the local test-checkout.html file for development testing
    checkoutPatterns: [/myntra\.com\/checkout/i, /myntra\.com\/payment/i, /test-checkout\.html/i],
    couponSelectors: ['#couponInput', 'input[placeholder*="coupon" i]', 'input[data-testid*="coupon" i]'],
    cashbackPercent: 8,
  },
  {
    id: 'nykaa',
    name: 'Nykaa',
    emoji: '💄',
    checkoutPatterns: [/nykaa\.com\/checkout/i, /nykaa\.com\/cart/i],
    couponSelectors: ['input[placeholder*="coupon" i]', 'input[placeholder*="promo" i]'],
    cashbackPercent: 10,
  },
  {
    id: 'ajio',
    name: 'AJIO',
    emoji: '👔',
    checkoutPatterns: [/ajio\.com\/checkout/i],
    couponSelectors: ['input[placeholder*="coupon" i]', '#promoCode'],
    cashbackPercent: 6,
  },
  {
    id: 'makemytrip',
    name: 'MakeMyTrip',
    emoji: '✈️',
    checkoutPatterns: [/makemytrip\.com\/(hotel|flights|bus).*checkout/i, /makemytrip\.com\/review/i],
    couponSelectors: ['input[placeholder*="coupon" i]', 'input[placeholder*="promo" i]', '#couponCode'],
    cashbackPercent: 4,
  },
  {
    id: 'swiggy',
    name: 'Swiggy',
    emoji: '🍔',
    checkoutPatterns: [/swiggy\.com\/checkout/i, /swiggy\.com\/cart/i],
    couponSelectors: ['input[placeholder*="coupon" i]', 'input[placeholder*="promo" i]'],
    cashbackPercent: 5,
  },
  {
    id: 'zomato',
    name: 'Zomato',
    emoji: '🍕',
    checkoutPatterns: [/zomato\.com\/.*order/i],
    couponSelectors: ['input[placeholder*="coupon" i]', 'input[placeholder*="promo" i]'],
    cashbackPercent: 5,
  },
  {
    id: 'croma',
    name: 'Croma',
    emoji: '📱',
    checkoutPatterns: [/croma\.com\/checkout/i],
    couponSelectors: ['input[placeholder*="coupon" i]', '#couponCode', 'input[name*="coupon" i]'],
    cashbackPercent: 3,
  },
  {
    id: 'bigbasket',
    name: 'BigBasket',
    emoji: '🛒',
    checkoutPatterns: [/bigbasket\.com\/.*checkout/i],
    couponSelectors: ['input[placeholder*="coupon" i]', 'input[placeholder*="promo" i]'],
    cashbackPercent: 4,
  },
]

// Generic coupon selectors as fallback
export const GENERIC_COUPON_SELECTORS = [
  'input[name*="coupon" i]',
  'input[name*="promo" i]',
  'input[name*="discount" i]',
  'input[name*="voucher" i]',
  'input[id*="coupon" i]',
  'input[id*="promo" i]',
  'input[id*="discount" i]',
  'input[id*="voucher" i]',
  'input[placeholder*="coupon" i]',
  'input[placeholder*="promo" i]',
  'input[placeholder*="enter code" i]',
  'input[placeholder*="gift card" i]',
  'input[aria-label*="coupon" i]',
  'input[aria-label*="promo" i]',
]

export function detectBrand(url) {
  for (const brand of SUPPORTED_BRANDS) {
    if (brand.checkoutPatterns.some((pattern) => pattern.test(url))) {
      return brand
    }
  }
  return null
}
