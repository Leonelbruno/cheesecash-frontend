import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import ForgotPassword from './ForgotPassword'
import { api } from '../../services/api'

vi.mock('../../services/api', () => ({
  api: { get: vi.fn(), post: vi.fn(), put: vi.fn() },
}))

const mockPost = vi.mocked(api.post)

function renderFP() {
  return render(<MemoryRouter><ForgotPassword /></MemoryRouter>)
}

describe('ForgotPassword', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPost.mockResolvedValue({ message: 'ok' })
  })

  it('no deja enviar con un email inválido', async () => {
    renderFP()

    await userEvent.type(screen.getByLabelText('Correo'), 'no-es-email')

    expect(screen.getByRole('button', { name: /enviar enlace/i })).toBeDisabled()
    expect(mockPost).not.toHaveBeenCalled()
  })

  it('manda el email al endpoint sin token de sesión', async () => {
    renderFP()

    await userEvent.type(screen.getByLabelText('Correo'), 'gonza@test.com')
    await userEvent.click(screen.getByRole('button', { name: /enviar enlace/i }))

    expect(mockPost).toHaveBeenCalledWith(
      '/auth/forgot-password',
      { email: 'gonza@test.com' },
      { auth: false },
    )
  })

  it('confirma el envío sin revelar si la cuenta existe', async () => {
    renderFP()

    await userEvent.type(screen.getByLabelText('Correo'), 'gonza@test.com')
    await userEvent.click(screen.getByRole('button', { name: /enviar enlace/i }))

    expect(await screen.findByText(/revisá tu correo/i)).toBeInTheDocument()
    expect(screen.getByText(/si ese email tiene una cuenta/i)).toBeInTheDocument()
  })

  it('muestra el error del backend', async () => {
    mockPost.mockRejectedValue(new Error('Demasiados intentos'))

    renderFP()

    await userEvent.type(screen.getByLabelText('Correo'), 'gonza@test.com')
    await userEvent.click(screen.getByRole('button', { name: /enviar enlace/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Demasiados intentos')
  })
})