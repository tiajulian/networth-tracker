// Uses frankfurter.app — free, no API key needed
let cachedRate: { rate: number; fetchedAt: number } | null = null
const CACHE_TTL_MS = 6 * 60 * 60 * 1000 // 6 hours

export async function getIDRtoAUD(): Promise<number> {
  if (cachedRate && Date.now() - cachedRate.fetchedAt < CACHE_TTL_MS) {
    return cachedRate.rate
  }
  try {
    const res = await fetch('https://api.frankfurter.app/latest?from=IDR&to=AUD')
    const data = await res.json()
    const rate = data.rates.AUD as number
    cachedRate = { rate, fetchedAt: Date.now() }
    return rate
  } catch {
    // fallback to a rough rate if API is unreachable
    return 0.000094
  }
}

export function formatAUD(amount: number): string {
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 }).format(amount)
}

export function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount)
}

export function formatCurrency(amount: number, currency: 'AUD' | 'IDR'): string {
  return currency === 'AUD' ? formatAUD(amount) : formatIDR(amount)
}
