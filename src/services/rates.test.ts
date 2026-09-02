import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getRate, getAllRates, decimalsFor, formatAmount } from './rates'
import { api } from './api'

vi.mock('./api', () => ({
  api: { get: vi.fn(), post: vi.fn(), put: vi.fn() },
}))

const mockGet = vi.mocked(api.get)

describe('getRate', () => {
  beforeEach(() => vi.clearAllMocks())

  it('devuelve 1 sin llamar a la API cuando las monedas son iguales', async () => {
    const rate = await getRate('USD', 'USD')

    expect(rate).toBe(1)
    expect(mockGet).not.toHaveBeenCalled()
  })

  it('pide la cotización al endpoint correcto', async () => {
    mockGet.mockResolvedValue({ from: 'USD', to: 'ARS', rate: 950 })

    const rate = await getRate('USD', 'ARS')

    expect(mockGet).toHaveBeenCalledWith('/rates?from=USD&to=ARS')
    expect(rate).toBe(950)
  })

  it('propaga el error si el backend falla', async () => {
    mockGet.mockRejectedValue(new Error('Servicio no disponible'))

    await expect(getRate('USD', 'ARS')).rejects.toThrow('Servicio no disponible')
  })
})

describe('getAllRates', () => {
  it('pide la tabla completa', async () => {
    mockGet.mockResolvedValue({ USD: 1, ARS: 950 })

    const rates = await getAllRates()

    expect(mockGet).toHaveBeenCalledWith('/rates')
    expect(rates.ARS).toBe(950)
  })
})

describe('decimalsFor', () => {
  it('usa 8 decimales para BTC y 2 para el resto', () => {
    expect(decimalsFor('BTC')).toBe(8)
    expect(decimalsFor('ARS')).toBe(2)
    expect(decimalsFor('USD')).toBe(2)
  })
})

describe('formatAmount', () => {
  it('formatea BTC con 8 decimales', () => {
    expect(formatAmount('BTC', 0.00012345)).toBe('0.00012345')
  })

  it('formatea fiat con separadores y 2 decimales', () => {
    // es-AR usa punto de miles y coma decimal
    expect(formatAmount('ARS', 1234.5)).toBe('1.234,50')
  })

  it('devuelve un guion cuando el valor no es un número', () => {
    expect(formatAmount('USD', Number.NaN)).toBe('—')
  })
})