import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { api } from './api'

const TOKEN_KEY = 'cc_token'

function mockFetch(status: number, body: unknown) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  })
}

describe('api', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.stubGlobal('fetch', mockFetch(200, { ok: true }))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('adjunta el token en el header Authorization', async () => {
    localStorage.setItem(TOKEN_KEY, 'un-token')
    const spy = mockFetch(200, {})
    vi.stubGlobal('fetch', spy)

    await api.get('/users/me')

    const [, options] = spy.mock.calls[0]
    expect(options.headers.Authorization).toBe('Bearer un-token')
  })

  it('no adjunta el token cuando auth es false', async () => {
    localStorage.setItem(TOKEN_KEY, 'un-token')
    const spy = mockFetch(200, {})
    vi.stubGlobal('fetch', spy)

    await api.post('/auth/login', { email: 'a@b.c' }, { auth: false })

    const [, options] = spy.mock.calls[0]
    expect(options.headers.Authorization).toBeUndefined()
  })

  it('serializa el body en los POST', async () => {
    const spy = mockFetch(201, {})
    vi.stubGlobal('fetch', spy)

    await api.post('/transactions', { fromAmount: 100 })

    const [, options] = spy.mock.calls[0]
    expect(options.method).toBe('POST')
    expect(JSON.parse(options.body)).toEqual({ fromAmount: 100 })
  })

  it('lanza el mensaje de error que manda el backend', async () => {
    vi.stubGlobal('fetch', mockFetch(400, { error: 'Saldo insuficiente' }))

    await expect(api.post('/transactions', {})).rejects.toThrow(
      'Saldo insuficiente',
    )
  })

  it('borra el token del storage ante un 401', async () => {
    localStorage.setItem(TOKEN_KEY, 'token-vencido')
    vi.stubGlobal('fetch', mockFetch(401, { error: 'No autenticado' }))

    await expect(api.get('/users/me')).rejects.toThrow()
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull()
  })
})