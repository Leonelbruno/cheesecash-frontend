import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import ConfirmTransfer from './ConfirmTransfer'
import { api } from '../../services/api'

vi.mock('../../services/api', () => ({
  api: { get: vi.fn(), post: vi.fn(), put: vi.fn() },
}))

const mockGet = vi.mocked(api.get)

const transfer = { id: 1, currency: 'ARS', amount: 600000, status: 'success' }

/** Renderiza en la ruta del enlace del correo, con /dashboard detrás. */
function renderCT(search = '?token=un-token') {
  return render(
    <MemoryRouter initialEntries={[`/confirm-transfer${search}`]}>
      <Routes>
        <Route path="/confirm-transfer" element={<ConfirmTransfer />} />
        <Route path="/dashboard" element={<p>panel</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ConfirmTransfer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGet.mockResolvedValue(transfer)
  })

  it('confirma usando el token del enlace, sin sesión iniciada', async () => {
    renderCT()

    expect(await screen.findByText(/transferencia confirmada/i)).toBeInTheDocument()
    expect(mockGet).toHaveBeenCalledWith('/transfers/confirm/un-token', { auth: false })
  })

  it('muestra el monto acreditado', async () => {
    renderCT()

    expect(await screen.findByText(/600\.000,00 ARS/)).toBeInTheDocument()
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

  it('no muestra el monto cuando la confirmación falla', async () => {
    mockGet.mockRejectedValue(new Error('Token inválido o expirado'))

    renderCT()
    await screen.findByText(/no se pudo confirmar/i)

    expect(screen.queryByText(/transferencia confirmada/i)).not.toBeInTheDocument()
  })

  it('lleva al panel desde el botón', async () => {
    renderCT()
    await screen.findByText(/transferencia confirmada/i)

    await userEvent.click(screen.getByRole('button', { name: /ir a mi billetera/i }))

    expect(screen.getByText('panel')).toBeInTheDocument()
  })
})