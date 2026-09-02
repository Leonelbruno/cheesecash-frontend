import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider } from './AuthContext'
import { useAuth } from './useAuth'
import { api } from '../services/api'

vi.mock('../services/api', () => ({
  api: { get: vi.fn(), post: vi.fn(), put: vi.fn() },
}))

const mockGet = vi.mocked(api.get)
const mockPost = vi.mocked(api.post)

const TOKEN_KEY = 'cc_token'

function Probe() {
  const { user, loading, login, logout } = useAuth()

  if (loading) return <p>cargando</p>

  return (
    <div>
      <p>{user ? user.fullName : 'sin sesion'}</p>
      <button onClick={() => login('gonza@test.com', 'secreta123')}>entrar</button>
      <button onClick={logout}>salir</button>
    </div>
  )
}

function renderProbe() {
  return render(
    <AuthProvider>
      <Probe />
    </AuthProvider>,
  )
}

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('arranca sin sesión cuando no hay token guardado', async () => {
    renderProbe()

    expect(await screen.findByText('sin sesion')).toBeInTheDocument()
    expect(mockGet).not.toHaveBeenCalled()
  })

  it('recupera la sesión si hay token válido', async () => {
    localStorage.setItem(TOKEN_KEY, 'token-valido')
    mockGet.mockResolvedValue({ id: 1, email: 'gonza@test.com', full_name: 'Gonzalo' })

    renderProbe()

    expect(await screen.findByText('Gonzalo')).toBeInTheDocument()
    expect(mockGet).toHaveBeenCalledWith('/users/me')
  })

  it('descarta el token si /users/me falla', async () => {
    localStorage.setItem(TOKEN_KEY, 'token-vencido')
    mockGet.mockRejectedValue(new Error('No autenticado'))

    renderProbe()

    expect(await screen.findByText('sin sesion')).toBeInTheDocument()
    await waitFor(() => expect(localStorage.getItem(TOKEN_KEY)).toBeNull())
  })

  it('guarda el token y el usuario al hacer login', async () => {
    mockPost.mockResolvedValue({
      token: 'token-nuevo',
      user: { id: 2, email: 'gonza@test.com', full_name: 'Gonzalo B' },
    })

    renderProbe()
    await screen.findByText('sin sesion')
    await userEvent.click(screen.getByRole('button', { name: 'entrar' }))

    expect(await screen.findByText('Gonzalo B')).toBeInTheDocument()
    expect(localStorage.getItem(TOKEN_KEY)).toBe('token-nuevo')
    expect(mockPost).toHaveBeenCalledWith(
      '/auth/login',
      { email: 'gonza@test.com', password: 'secreta123' },
      { auth: false },
    )
  })

  it('limpia token y usuario al hacer logout', async () => {
    localStorage.setItem(TOKEN_KEY, 'token-valido')
    mockGet.mockResolvedValue({ id: 1, email: 'gonza@test.com', full_name: 'Gonzalo' })

    renderProbe()
    await screen.findByText('Gonzalo')
    await userEvent.click(screen.getByRole('button', { name: 'salir' }))

    expect(await screen.findByText('sin sesion')).toBeInTheDocument()
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull()
  })
})