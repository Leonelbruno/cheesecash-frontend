import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Operar from './Operar'
import { api } from '../../services/api'

vi.mock('../../services/api', () => ({
  api: { get: vi.fn(), post: vi.fn(), put: vi.fn() },
}))

const mockGet = vi.mocked(api.get)
const mockPost = vi.mocked(api.post)

const balances = [
  { id: 1, wallet_id: 1, currency: 'ARS', amount: '1000000.00' },
  { id: 2, wallet_id: 1, currency: 'USD', amount: '500.00' },
]

function stubGets() {
  mockGet.mockImplementation((path: string) => {
    if (path === '/wallet/balances') return Promise.resolve(balances)
    if (path.startsWith('/rates')) {
      return Promise.resolve({ from: 'ARS', to: 'USD', rate: 0.001 })
    }
    return Promise.reject(new Error(`sin stub para ${path}`))
  })
}

function renderOperar() {
  return render(
    <MemoryRouter>
      <Operar />
    </MemoryRouter>,
  )
}

describe('Operar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    stubGets()
  })

  it('muestra el saldo disponible de la moneda origen', async () => {
    renderOperar()

    expect(await screen.findByText(/disponible: 1\.000\.000,00 ARS/i)).toBeInTheDocument()
  })

  it('solo ofrece las monedas que soporta el backend', async () => {
    renderOperar()
    await screen.findByText(/disponible/i)

    const opciones = screen.getAllByRole('option').map(o => o.textContent)

    expect(opciones).not.toContain('USDT')
    expect(opciones).not.toContain('BRL')
    expect(opciones).toContain('ARS')
    expect(opciones).toContain('BTC')
  })

  it('manda el payload que espera POST /transactions', async () => {
    mockPost.mockResolvedValue({
      id: 10, type: 'buy', from_currency: 'ARS', to_currency: 'USD',
      from_amount: '10000', to_amount: '10', exchange_rate_used: '0.001',
      status: 'success', created_at: '2026-09-01T00:00:00Z',
    })

    renderOperar()
    await screen.findByText(/disponible/i)

    await userEvent.type(screen.getByLabelText('Monto'), '10000')
    await userEvent.click(screen.getByRole('button', { name: /confirmar operación/i }))

    expect(mockPost).toHaveBeenCalledWith('/transactions', {
      type: 'buy',
      fromCurrency: 'ARS',
      toCurrency: 'USD',
      fromAmount: 10000,
    })
    expect(await screen.findByText(/operación realizada/i)).toBeInTheDocument()
  })

  it('usa el type que corresponde a la pestaña elegida', async () => {
    mockPost.mockResolvedValue({
      id: 11, type: 'exchange', from_currency: 'ARS', to_currency: 'USD',
      from_amount: '5000', to_amount: '5', exchange_rate_used: '0.001',
      status: 'success', created_at: '2026-09-01T00:00:00Z',
    })

    renderOperar()
    await screen.findByText(/disponible/i)

    await userEvent.click(screen.getByRole('button', { name: 'Intercambiar' }))
    await userEvent.type(screen.getByLabelText('Monto'), '5000')
    await userEvent.click(screen.getByRole('button', { name: /confirmar operación/i }))

    expect(mockPost).toHaveBeenCalledWith(
      '/transactions',
      expect.objectContaining({ type: 'exchange' }),
    )
  })

  it('bloquea el envío si el monto supera el saldo', async () => {
    renderOperar()
    await screen.findByText(/disponible/i)

    await userEvent.type(screen.getByLabelText('Monto'), '9999999')

    expect(screen.getByText(/no te alcanza el saldo/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /confirmar operación/i })).toBeDisabled()
    expect(mockPost).not.toHaveBeenCalled()
  })

  it('muestra el mensaje de error que devuelve el backend', async () => {
    mockPost.mockRejectedValue(new Error('Saldo insuficiente'))

    renderOperar()
    await screen.findByText(/disponible/i)

    await userEvent.type(screen.getByLabelText('Monto'), '1000')
    await userEvent.click(screen.getByRole('button', { name: /confirmar operación/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Saldo insuficiente')
    expect(screen.queryByText(/operación realizada/i)).not.toBeInTheDocument()
  })

  it('avisa que falta confirmar por email cuando la operación queda pendiente', async () => {
    mockPost.mockResolvedValue({
      id: 12, type: 'buy', from_currency: 'ARS', to_currency: 'USD',
      from_amount: '600000', to_amount: '600', exchange_rate_used: '0.001',
      status: 'pending', created_at: '2026-09-01T00:00:00Z',
    })

    renderOperar()
    await screen.findByText(/disponible/i)

    await userEvent.type(screen.getByLabelText('Monto'), '600000')
    await userEvent.click(screen.getByRole('button', { name: /confirmar operación/i }))

    expect(await screen.findByText(/confirmá por email/i)).toBeInTheDocument()
    expect(screen.getByText(/tu saldo todavía no se modificó/i)).toBeInTheDocument()
    expect(screen.queryByText(/operación realizada/i)).not.toBeInTheDocument()
  })
})