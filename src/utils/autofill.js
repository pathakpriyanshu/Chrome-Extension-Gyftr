import { GENERIC_COUPON_SELECTORS } from '../data/brands.js'

export function findCouponInput(brandSelectors = []) {
  const selectors = [...brandSelectors, ...GENERIC_COUPON_SELECTORS]

  for (const selector of selectors) {
    try {
      const el = document.querySelector(selector)
      if (el && el.offsetParent !== null) return el // visible element only
    } catch {
      // Invalid selector — skip
    }
  }
  return null
}

export function autofillCoupon(code, brandSelectors = []) {
  const input = findCouponInput(brandSelectors)
  if (!input) return { success: false, reason: 'no_input_found' }

  // Trigger React/Vue synthetic events so frameworks detect the change
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    'value'
  )?.set

  if (nativeInputValueSetter) {
    nativeInputValueSetter.call(input, code)
  } else {
    input.value = code
  }

  input.dispatchEvent(new Event('input', { bubbles: true }))
  input.dispatchEvent(new Event('change', { bubbles: true }))
  input.focus()

  // Try to find and click the apply/submit button near the input
  const applyBtn = findApplyButton(input)
  if (applyBtn) {
    setTimeout(() => applyBtn.click(), 300)
  }

  return { success: true, input, applyBtn }
}

function findApplyButton(inputEl) {
  const applyKeywords = /apply|submit|go|use|redeem|validate/i

  // Search within the closest form or container
  const container = inputEl.closest('form') ?? inputEl.parentElement?.parentElement ?? document

  const buttons = container.querySelectorAll('button, input[type="submit"], input[type="button"], [role="button"]')
  for (const btn of buttons) {
    if (applyKeywords.test(btn.textContent) || applyKeywords.test(btn.value)) {
      return btn
    }
  }
  return null
}
