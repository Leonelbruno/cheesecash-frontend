import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import ConfirmTransaction from './ConfirmTransaction'
import { api } from '../../services/api'

vi.mock('../../services/api', () => ({
  api: { get: vi.fn(), post: vi.fn(), put: vi.fn() },
}))

const mockGet = vi.mocked(api.get)

const tx = {
  id: 1,
  type: 'buy',
  from_currency: 'ARS',
  to_currency: 'USD',
  from_amount: '600000',
  to_amount: '405.40',
  status: 'success',
}

/** Renderiza en la ruta del enlace del correo, con /dashboard detrás. */
function renderCT(search = '?token=un-token') {
  return render(
    <MemoryRouter initialEntries={[`/confirm-transaction${search}`]}>
      <Routes>
        <Route path="/confirm-transaction" element={<ConfirmTransaction />} />
        <Route path="/dashboard" element={<p>panel</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ConfirmTransaction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGet.mockResolvedValue(tx)
  })

  it('confirma usando el token del enlace, sin sesión iniciada', async () => {
    renderCT()

    expect(await screen.findByText(/operación confirmada/i)).toBeInTheDocument()
    expect(mockGet).toHaveBeenCalledWith('/transactions/confirm/un-token', { auth: false })
  })

  it('muestra lo que se envió y lo que se recibió', async () => {
    renderCT()

    expect(await screen.findByText(/600\.000,00 ARS/)).toBeInTheDocument()
    expect(screen.getByText(/405,40 USD/)).toBeInTheDocument()
  })

  it('avisa si el enlace no trae token y no llama al backend', () => {
    renderCT('')

    expect(screen.getByText(/no se pudo confirmar/i)).toBeInTheDocument()
    expect(screen.getByText(/no incluye un token/i)).toBeInTheDocument()
    expect(mockGet).not.toHaveBeenCalled()
  })

  it('muestra el error del backend si el token venció', async () => {
    mockGet.mockRejectedValue(new Error('Token inválido o expirado'))

    renderCT()

    expect(await screen.findByText(/no se pudo confirmar/i)).toBeInTheDocument()
    expect(screen.getByText('Token inválido o expirado')).toBeInTheDocument()
  })

  it('no muestra los montos cuando la confirmación falla', async () => {
    mockGet.mockRejectedValue(new Error('Token inválido o expirado'))

    renderCT()
    await screen.findByText(/no se pudo confirmar/i)

    expect(screen.queryByText(/operación confirmada/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/600\.000,00 ARS/)).not.toBeInTheDocument()
  })

  it('lleva al panel desde el botón', async () => {
    renderCT()
    await screen.findByText(/operación confirmada/i)

    await userEvent.click(screen.getByRole('button', { name: /ir a mi billetera/i }))

    expect(screen.getByText('panel')).toBeInTheDocument()
  })
})