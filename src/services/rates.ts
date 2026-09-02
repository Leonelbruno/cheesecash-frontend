import { api } from './api'

export const CURRENCIES = ['ARS', 'USD', 'EUR', 'BTC'] as const
export type Currency = (typeof CURRENCIES)[number]

export const CURRENCY_NAMES: Record<string, string> = {
  ARS: 'Peso Argentino',
  USD: 'Dólar Estadounidense',
  EUR: 'Euro',
  BTC: 'Bitcoin',
}

/** Cotización de un par puntual. GET /rates?from=X&to=Y */
export async function getRate(from: string, to: string): Promise<number> {
  if (from === to) return 1
  const res = await api.get<{ from: string; to: string; rate: number }>(
    `/rates?from=${from}&to=${to}`,
  )
  return res.rate
}

/** Tabla completa de cotizaciones contra USD. GET /rates */
export async function getAllRates(): Promise<Record<string, number>> {
  return api.get<Record<string, number>>('/rates')
}

/** Decimales según la moneda: BTC usa 8, el resto 2. */
export function decimalsFor(currency: string): number {
  return currency === 'BTC' ? 8 : 2
}

export function formatAmount(currency: string, value: number): string {
  if (Number.isNaN(value)) return '—'
  if (currency === 'BTC') return value.toFixed(8)
  return value.toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}
