import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Recargar from './Recargar'
import { api } from '../../services/api'

vi.mock('../../services/api', () => ({
  api: { get: vi.fn(), post: vi.fn(), put: vi.fn() },
}))

const mockGet = vi.mocked(api.get)
const mockPost = vi.mocked(api.post)

const deposits = [
  { id: 2, currency: 'ARS', amount: 50000, created_at: '2026-09-08T10:00:00Z' },
  { id: 1, currency: 'USD', amount: 100, created_at: '2026-09-07T10:00:00Z' },
]

function boton() {
  return screen.getByRole('button', { name: /confirmar recarga/i })
}

describe('Recargar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGet.mockResolvedValue(deposits)
    mockPost.mockResolvedValue({ id: 3, currency: 'ARS', amount: 1000 })
  })

  it('manda moneda y monto a POST /deposits', async () => {
    render(<Recargar />)

    await userEvent.type(screen.getByLabelText('Monto'), '25000')
    await userEvent.click(boton())

    expect(mockPost).toHaveBeenCalledWith('/deposits', {
      currency: 'ARS',
      amount: 25000,
    })
    expect(await screen.findByText(/acreditada con éxito/i)).toBeInTheDocument()
  })

  it('usa la moneda que este elegida', async () => {
    render(<Recargar />)

    await userEvent.click(screen.getByRole('button', { name: 'USD' }))
    await userEvent.type(screen.getByLabelText('Monto'), '100')
    await userEvent.click(boton())

    expect(mockPost).toHaveBeenCalledWith('/deposits', {
      currency: 'USD',
      amount: 100,
    })
  })

  it('los montos rápidos completan el campo', async () => {
    render(<Recargar />)

    await userEvent.click(screen.getByRole('button', { name: /50\.000 ARS/ }))

    expect(screen.getByLabelText('Monto')).toHaveValue(50000)
  })

  it('no deja recargar sin monto', () => {
    render(<Recargar />)

    expect(boton()).toBeDisabled()
    expect(mockPost).not.toHaveBeenCalled()
  })

  it('rechaza montos por encima del tope del backend', async () => {
    render(<Recargar />)

    await userEvent.type(screen.getByLabelText('Monto'), '9000000')

    expect(screen.getByText(/el máximo por recarga es/i)).toBeInTheDocument()
    expect(boton()).toBeDisabled()
    expect(mockPost).not.toHaveBeenCalled()
  })

  it('ningún monto rápido supera el tope de su moneda', async () => {
    render(<Recargar />)

    await userEvent.click(screen.getByRole('button', { name: 'BTC' }))
    await userEvent.click(screen.getByRole('button', { name: /0\.05 BTC/ }))

    expect(screen.queryByText(/el máximo por recarga es/i)).not.toBeInTheDocument()
    expect(boton()).not.toBeDisabled()
  })

  it('muestra el error que devuelve el backend', async () => {
    mockPost.mockRejectedValue(new Error('Wallet no encontrada'))

    render(<Recargar />)

    await userEvent.type(screen.getByLabelText('Monto'), '1000')
    await userEvent.click(boton())

    expect(await screen.findByText('Wallet no encontrada')).toBeInTheDocument()
  })

  it('lista las últimas recargas', async () => {
    render(<Recargar />)

    expect(await screen.findByText(/últimas recargas/i)).toBeInTheDocument()
    expect(screen.getByText(/\+ 50\.000 ARS/)).toBeInTheDocument()
    expect(screen.getByText(/\+ 100 USD/)).toBeInTheDocument()
    expect(mockGet).toHaveBeenCalledWith('/deposits')
  })

  it('no muestra la lista si todavía no hubo recargas', async () => {
    mockGet.mockResolvedValue([])

    render(<Recargar />)

    await vi.waitFor(() => expect(mockGet).toHaveBeenCalled())
    expect(screen.queryByText(/últimas recargas/i)).not.toBeInTheDocument()
  })

  it('refresca la lista después de acreditar', async () => {
    render(<Recargar />)
    await screen.findByText(/últimas recargas/i)

    await userEvent.type(screen.getByLabelText('Monto'), '1000')
    await userEvent.click(boton())

    await vi.waitFor(() => expect(mockGet).toHaveBeenCalledTimes(2))
  })
})