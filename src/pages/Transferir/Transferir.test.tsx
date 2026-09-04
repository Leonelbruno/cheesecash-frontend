import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Transferir from './Transferir'
import { api } from '../../services/api'

vi.mock('../../services/api', () => ({
  api: { get: vi.fn(), post: vi.fn(), put: vi.fn() },
}))

const mockGet = vi.mocked(api.get)
const mockPost = vi.mocked(api.post)

const balances = [
  { id: 1, wallet_id: 1, currency: 'ARS', amount: '50000.00' },
  { id: 2, wallet_id: 1, currency: 'USD', amount: '100.00' },
]

function renderT() {
  return render(<MemoryRouter><Transferir /></MemoryRouter>)
}

describe('Transferir', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGet.mockResolvedValue(balances)
  })

  it('muestra el saldo disponible de la moneda elegida', async () => {
    renderT()
    expect(await screen.findByText(/disponible: 50\.000,00 ARS/i)).toBeInTheDocument()
  })

  it('no ofrece monedas que el backend no soporta', async () => {
    renderT()
    await screen.findByText(/disponible/i)
    const opciones = screen.getAllByRole('option').map(o => o.textContent)
    expect(opciones).not.toContain('USDT')
    expect(opciones).not.toContain('BRL')
  })

  it('no deja enviar con un email inválido', async () => {
    renderT()
    await screen.findByText(/disponible/i)

    await userEvent.type(screen.getByLabelText(/email del destinatario/i), 'no-es-un-email')
    await userEvent.type(screen.getByLabelText('Monto'), '1000')

    expect(screen.getByRole('button', { name: /enviar transferencia/i })).toBeDisabled()
    expect(mockPost).not.toHaveBeenCalled()
  })

  it('manda el payload que espera POST /transfers', async () => {
    mockPost.mockResolvedValue({
      id: 1, from_wallet_id: 1, to_wallet_id: 2,
      currency: 'ARS', amount: 1000, status: 'success',
      created_at: '2026-09-03T00:00:00Z',
    })

    renderT()
    await screen.findByText(/disponible/i)

    await userEvent.type(screen.getByLabelText(/email del destinatario/i), 'jere@test.com')
    await userEvent.type(screen.getByLabelText('Monto'), '1000')
    await userEvent.click(screen.getByRole('button', { name: /enviar transferencia/i }))

    expect(mockPost).toHaveBeenCalledWith('/transfers', {
      toEmail: 'jere@test.com',
      currency: 'ARS',
      amount: 1000,
    })
    expect(await screen.findByText(/transferencia enviada/i)).toBeInTheDocument()
  })

  it('bloquea el envío si el monto supera el saldo', async () => {
    renderT()
    await screen.findByText(/disponible/i)

    await userEvent.type(screen.getByLabelText(/email del destinatario/i), 'jere@test.com')
    await userEvent.type(screen.getByLabelText('Monto'), '999999')

    expect(screen.getByText(/no te alcanza el saldo/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /enviar transferencia/i })).toBeDisabled()
  })

  it('muestra el error del backend cuando el destinatario no existe', async () => {
    mockPost.mockRejectedValue(new Error('El destinatario no existe'))

    renderT()
    await screen.findByText(/disponible/i)

    await userEvent.type(screen.getByLabelText(/email del destinatario/i), 'nadie@test.com')
    await userEvent.type(screen.getByLabelText('Monto'), '500')
    await userEvent.click(screen.getByRole('button', { name: /enviar transferencia/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent('El destinatario no existe')
  })

  it('avisa que falta confirmar por email cuando queda pendiente', async () => {
    mockPost.mockResolvedValue({
      id: 2, from_wallet_id: 1, to_wallet_id: 2,
      currency: 'ARS', amount: 40000, status: 'pending',
      created_at: '2026-09-03T00:00:00Z',
    })

    renderT()
    await screen.findByText(/disponible/i)

    await userEvent.type(screen.getByLabelText(/email del destinatario/i), 'jere@test.com')
    await userEvent.type(screen.getByLabelText('Monto'), '40000')
    await userEvent.click(screen.getByRole('button', { name: /enviar transferencia/i }))

    expect(await screen.findByText(/confirmá por email/i)).toBeInTheDocument()
    expect(screen.getByText(/tu saldo todavía no se modificó/i)).toBeInTheDocument()
    expect(screen.queryByText(/transferencia enviada/i)).not.toBeInTheDocument()
  })
})