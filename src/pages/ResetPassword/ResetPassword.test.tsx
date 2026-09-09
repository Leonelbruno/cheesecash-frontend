import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import ResetPassword from './ResetPassword'
import { api } from '../../services/api'

vi.mock('../../services/api', () => ({
  api: { get: vi.fn(), post: vi.fn(), put: vi.fn() },
}))

const mockPost = vi.mocked(api.post)

function renderRP(search = '?token=un-token') {
  return render(
    <MemoryRouter initialEntries={[`/reset-password${search}`]}>
      <ResetPassword />
    </MemoryRouter>,
  )
}

describe('ResetPassword', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPost.mockResolvedValue({ message: 'ok' })
  })

  it('avisa si el enlace no trae token', () => {
    renderRP('')

    expect(screen.getByText(/enlace inválido/i)).toBeInTheDocument()
    expect(screen.queryByLabelText(/contraseña nueva/i)).not.toBeInTheDocument()
  })

  it('exige al menos 8 caracteres', async () => {
    renderRP()

    await userEvent.type(screen.getByLabelText(/contraseña nueva/i), 'corta')

    expect(screen.getByText(/te faltan 3 caracteres/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cambiar contraseña/i })).toBeDisabled()
  })

  it('no deja enviar si las contraseñas no coinciden', async () => {
    renderRP()

    await userEvent.type(screen.getByLabelText(/contraseña nueva/i), 'secreta123')
    await userEvent.type(screen.getByLabelText(/repetí la contraseña/i), 'otracosa123')

    expect(screen.getByText(/no coinciden/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cambiar contraseña/i })).toBeDisabled()
    expect(mockPost).not.toHaveBeenCalled()
  })

  it('manda el token del enlace junto con la contraseña nueva', async () => {
    renderRP()

    await userEvent.type(screen.getByLabelText(/contraseña nueva/i), 'secreta123')
    await userEvent.type(screen.getByLabelText(/repetí la contraseña/i), 'secreta123')
    await userEvent.click(screen.getByRole('button', { name: /cambiar contraseña/i }))

    expect(mockPost).toHaveBeenCalledWith(
      '/auth/reset-password',
      { token: 'un-token', newPassword: 'secreta123' },
      { auth: false },
    )
    expect(await screen.findByText(/contraseña actualizada/i)).toBeInTheDocument()
  })

  it('muestra el error si el token venció', async () => {
    mockPost.mockRejectedValue(new Error('Token inválido o expirado'))

    renderRP()

    await userEvent.type(screen.getByLabelText(/contraseña nueva/i), 'secreta123')
    await userEvent.type(screen.getByLabelText(/repetí la contraseña/i), 'secreta123')
    await userEvent.click(screen.getByRole('button', { name: /cambiar contraseña/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Token inválido o expirado')
    expect(screen.queryByText(/contraseña actualizada/i)).not.toBeInTheDocument()
  })
})