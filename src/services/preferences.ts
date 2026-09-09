
const BASE_CURRENCY_KEY = 'cc_base_currency'
 
export const BASE_CURRENCIES = ['ARS', 'USD', 'EUR'] as const
export type BaseCurrency = (typeof BASE_CURRENCIES)[number]
 
const DEFAULT_BASE_CURRENCY: BaseCurrency = 'USD'
 
export function getBaseCurrency(): BaseCurrency {
  const saved = localStorage.getItem(BASE_CURRENCY_KEY)
 
  return BASE_CURRENCIES.includes(saved as BaseCurrency)
    ? (saved as BaseCurrency)
    : DEFAULT_BASE_CURRENCY
}
 
export function setBaseCurrency(currency: BaseCurrency): void {
  localStorage.setItem(BASE_CURRENCY_KEY, currency)
}