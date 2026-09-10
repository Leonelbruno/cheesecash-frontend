import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Configuracion from './Configuracion'
import { api } from '../../services/api'
import { AuthContext, type AuthContextType } from '../../context/auth-context'

vi.mock('../../services/api', () => ({
  api: { get: vi.fn(), post: vi.fn(), put: vi.fn() },
}))

const mockGet = vi.mocked(api.get)
const mockPut = vi.mocked(api.put)

const thresholds = {
  threshold_ars: '500000.00',
  threshold_usd: '500.00',
  threshold_eur: '500.00',
  threshold_btc_usd: '1000.00',
}

const refreshUser = vi.fn().mockResolvedValue(undefined)

const ctx: AuthContextType = {
  user: { id: 1, email: 'gonza@test.com', fullName: 'Gonzalo Bastias', baseCurrency: 'USD' },
  loading: false,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  refreshUser,
}

function renderConfig() {
  return render(
    <AuthContext.Provider value={ctx}>
      <Configuracion />
    </AuthContext.Provider>,
  )
}

describe('Configuracion', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    mockGet.mockImplementation((path: string) => {
      if (path === '/users/me/thresholds') return Promise.resolve(thresholds)
      if (path === '/users/me/pin') return Promise.resolve({ pin: 'A1B2C3' })
      return Promise.reject(new Error(`sin stub para ${path}`))
    })
    mockPut.mockResolvedValue({ message: 'ok' })
  })

  afterEach(() => localStorage.clear())

  // ── Cuenta ──
  it('muestra los datos de la cuenta y el PIN', async () => {
    renderConfig()

    expect(await screen.findAllByText('A1B2C3')).not.toHaveLength(0)
    expect(screen.getByText('gonza@test.com')).toBeInTheDocument()
    expect(screen.getAllByText('Gonzalo Bastias').length).toBeGreaterThan(0)
  })

  // ── Nombre ──
  it('el boton de nombre arranca deshabilitado si no cambio nada', async () => {
    renderConfig()
    await screen.findByText('gonza@test.com')

    expect(screen.getByRole('button', { name: /guardar nombre/i })).toBeDisabled()
  })

  it('guarda el nombre y refresca la sesion', async () => {
    renderConfig()
    await screen.findByText('gonza@test.com')

    const input = screen.getByLabelText(/nombre completo/i)
    await userEvent.clear(input)
    await userEvent.type(input, 'Gonzalo B')
    await userEvent.click(screen.getByRole('button', { name: /guardar nombre/i }))

    expect(mockPut).toHaveBeenCalledWith('/users/me', {
      fullName: 'Gonzalo B',
      baseCurrency: 'USD',
    })
    expect(refreshUser).toHaveBeenCalled()
  })

  // ── Contraseña ──
  it('no deja cambiar la contraseña sin la actual', async () => {
    renderConfig()
    await screen.findByText('gonza@test.com')

    await userEvent.type(screen.getByLabelText('Nueva'), 'secreta123')
    await userEvent.type(screen.getByLabelText('Repetir'), 'secreta123')

    expect(screen.getByRole('button', { name: /cambiar contraseña/i })).toBeDisabled()
  })

  it('no deja cambiar la contraseña si las nuevas no coinciden', async () => {
    renderConfig()
    await screen.findByText('gonza@test.com')

    await userEvent.type(screen.getByLabelText(/contraseña actual/i), 'vieja123')
    await userEvent.type(screen.getByLabelText('Nueva'), 'secreta123')
    await userEvent.type(screen.getByLabelText('Repetir'), 'otracosa123')

    expect(screen.getByText(/no coinciden/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cambiar contraseña/i })).toBeDisabled()
  })

  it('manda las dos contraseñas y limpia el formulario', async () => {
    renderConfig()
    await screen.findByText('gonza@test.com')

    await userEvent.type(screen.getByLabelText(/contraseña actual/i), 'vieja123')
    await userEvent.type(screen.getByLabelText('Nueva'), 'secreta123')
    await userEvent.type(screen.getByLabelText('Repetir'), 'secreta123')
    await userEvent.click(screen.getByRole('button', { name: /cambiar contraseña/i }))

    expect(mockPut).toHaveBeenCalledWith('/users/me/password', {
      currentPassword: 'vieja123',
      newPassword: 'secreta123',
    })
    expect(await screen.findByText(/contraseña actualizada/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/contraseña actual/i)).toHaveValue('')
  })

  it('muestra el error si la contraseña actual es incorrecta', async () => {
    mockPut.mockRejectedValue(new Error('Contraseña actual incorrecta'))

    renderConfig()
    await screen.findByText('gonza@test.com')

    await userEvent.type(screen.getByLabelText(/contraseña actual/i), 'malísima')
    await userEvent.type(screen.getByLabelText('Nueva'), 'secreta123')
    await userEvent.type(screen.getByLabelText('Repetir'), 'secreta123')
    await userEvent.click(screen.getByRole('button', { name: /cambiar contraseña/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Contraseña actual incorrecta')
  })

  // ── Moneda base ──
  it('guarda la moneda base en la cuenta, no en el navegador', async () => {
    renderConfig()
    await screen.findByText('gonza@test.com')

    const grupo = screen.getByRole('group', { name: /moneda base/i })
    await userEvent.click(within(grupo).getByRole('button', { name: 'ARS' }))

    expect(mockPut).toHaveBeenCalledWith('/users/me', {
      fullName: 'Gonzalo Bastias',
      baseCurrency: 'ARS',
    })
    expect(refreshUser).toHaveBeenCalled()
  })

  it('no llama al servidor si se elige la moneda que ya estaba', async () => {
    renderConfig()
    await screen.findByText('gonza@test.com')

    const grupo = screen.getByRole('group', { name: /moneda base/i })
    await userEvent.click(within(grupo).getByRole('button', { name: 'USD' }))

    expect(mockPut).not.toHaveBeenCalled()
  })

  // ── Umbrales ──
  it('carga los umbrales guardados', async () => {
    renderConfig()

    expect(await screen.findByLabelText(/pesos/i)).toHaveValue(500000)
    expect(mockGet).toHaveBeenCalledWith('/users/me/thresholds')
  })

  it('manda las claves que espera el backend, distintas a las del GET', async () => {
    renderConfig()
    const ars = await screen.findByLabelText(/pesos/i)

    await userEvent.clear(ars)
    await userEvent.type(ars, '750000')
    await userEvent.click(screen.getByRole('button', { name: /guardar umbrales/i }))

    expect(mockPut).toHaveBeenCalledWith('/users/me/thresholds', {
      ars: 750000,
      usd: 500,
      eur: 500,
      btcUsd: 1000,
    })
  })

  it('no deja guardar un umbral en cero', async () => {
    renderConfig()
    const usd = await screen.findByLabelText(/dólares/i)

    await userEvent.clear(usd)
    await userEvent.type(usd, '0')

    expect(screen.getByRole('button', { name: /guardar umbrales/i })).toBeDisabled()
  })
})