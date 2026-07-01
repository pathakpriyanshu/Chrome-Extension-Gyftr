// Mock voucher data — replace with real GYFTR API calls later
export const MOCK_VOUCHERS = {
  amazon: [
    { code: 'GYFTR500', label: '₹500 off on orders above ₹2000', expiry: '2026-07-31', type: 'flat' },
  ],
  flipkart: [
    { code: 'GFTR10FK', label: '10% off up to ₹300', expiry: '2026-08-15', type: 'percent' },
  ],
  myntra: [
    { code: 'GYFTRMYN15', label: '15% off on fashion', expiry: '2026-09-01', type: 'percent' },
  ],
  nykaa: [
    { code: 'GYFTR200NK', label: '₹200 off on beauty', expiry: '2026-07-20', type: 'flat' },
  ],
  ajio: [
    { code: 'GYFTR12AJ', label: '12% off on apparel', expiry: '2026-08-31', type: 'percent' },
  ],
  makemytrip: [
    { code: 'GYFTRMMT800', label: '₹800 off on hotels', expiry: '2026-10-31', type: 'flat' },
  ],
  swiggy: [
    { code: 'GYFTRSWG75', label: '₹75 off on orders above ₹300', expiry: '2026-07-15', type: 'flat' },
  ],
  zomato: [
    { code: 'GYFTRZMTO50', label: '₹50 off on orders above ₹199', expiry: '2026-07-15', type: 'flat' },
  ],
  croma: [
    { code: 'GYFTRCROMA5', label: '5% off on electronics', expiry: '2026-09-30', type: 'percent' },
  ],
  bigbasket: [
    { code: 'GYFTRBB150', label: '₹150 off on groceries above ₹800', expiry: '2026-07-25', type: 'flat' },
  ],
}

export function getVouchersForBrand(brandId) {
  return MOCK_VOUCHERS[brandId] ?? []
}
