import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import Notifications from './Notifications'
import { api } from '../../services/api'
import { connectSocket } from '../../services/socket'

vi.mock('../../services/api', () => ({
  api: { get: vi.fn(), post: vi.fn(), put: vi.fn() },
}))
vi.mock('../../services/socket', () => ({
  connectSocket: vi.fn(),
}))

const mockGet = vi.mocked(api.get)
const mockConnect = vi.mocked(connectSocket)

/** Socket falso: guarda los handlers para poder dispararlos desde el test. */
function fakeSocket() {
  const handlers: Record<string, (payload: unknown) => void> = {}
  return {
    on: vi.fn((event: string, cb: (payload: unknown) => void) => { handlers[event] = cb }),
    off: vi.fn(),
    disconnect: vi.fn(),
    emitToClient: (event: string, payload: unknown) => {
      act(() => handlers[event]?.(payload))
    },
  }
}

let socket: ReturnType<typeof fakeSocket>

describe('Notifications', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.setItem('cc_token', 'un-token')
    socket = fakeSocket()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockConnect.mockReturnValue(socket as any)
    mockGet.mockResolvedValue([{ wallet_id: 7, currency: 'ARS', amount: '1000' }])
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('no conecta si no hay sesión', () => {
    localStorage.clear()

    render(<Notifications />)

    expect(mockConnect).not.toHaveBeenCalled()
  })

  it('conecta pasando el token guardado', async () => {
    render(<Notifications />)

    expect(mockConnect).toHaveBeenCalledWith('un-token')
  })

  it('avisa cuando se completa una operación', async () => {
    render(<Notifications />)

    socket.emitToClient('transaction:completed', {
      id: 1, type: 'buy', from_currency: 'ARS', to_currency: 'USD',
      from_amount: '10000', to_amount: '10.5', status: 'success',
    })

    expect(await screen.findByText(/compra confirmada/i)).toBeInTheDocument()
    expect(screen.getByText(/10,50 USD/)).toBeInTheDocument()
  })

  it('distingue la transferencia recibida de la enviada', async () => {
    render(<Notifications />)
    // esperamos a que el componente haya guardado su wallet_id (7)
    await vi.waitFor(() => expect(mockGet).toHaveBeenCalled())
    await act(async () => { await Promise.resolve() })

    socket.emitToClient('transfer:completed', {
      id: 2, from_wallet_id: 9, to_wallet_id: 7,
      currency: 'ARS', amount: '5000', status: 'success',
    })

    expect(await screen.findByText(/recibiste una transferencia/i)).toBeInTheDocument()
  })

  it('cierra la conexión al desmontar', () => {
    const { unmount } = render(<Notifications />)

    unmount()

    expect(socket.disconnect).toHaveBeenCalled()
  })
})