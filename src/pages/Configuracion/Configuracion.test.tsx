import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Configuracion from './Configuracion'
import { api } from '../../services/api'

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

describe('Configuracion', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGet.mockResolvedValue(thresholds)
  })

  it('carga los umbrales guardados en el formulario', async () => {
    render(<Configuracion />)

    expect(await screen.findByLabelText(/pesos argentinos/i)).toHaveValue(500000)
    expect(screen.getByLabelText(/dólares/i)).toHaveValue(500)
    expect(screen.getByLabelText(/bitcoin/i)).toHaveValue(1000)
    expect(mockGet).toHaveBeenCalledWith('/users/me/thresholds')
  })

  it('manda las claves que espera el backend, distintas a las del GET', async () => {
    mockPut.mockResolvedValue({ message: 'ok' })

    render(<Configuracion />)
    const ars = await screen.findByLabelText(/pesos argentinos/i)

    await userEvent.clear(ars)
    await userEvent.type(ars, '750000')
    await userEvent.click(screen.getByRole('button', { name: /guardar cambios/i }))

    expect(mockPut).toHaveBeenCalledWith('/users/me/thresholds', {
      ars: 750000,
      usd: 500,
      eur: 500,
      btcUsd: 1000,
    })
    expect(await screen.findByRole('status')).toHaveTextContent(/guardados/i)
  })

  it('no deja guardar con un umbral en cero', async () => {
    render(<Configuracion />)
    const usd = await screen.findByLabelText(/dólares/i)

    await userEvent.clear(usd)
    await userEvent.type(usd, '0')

    expect(screen.getByRole('button', { name: /guardar cambios/i })).toBeDisabled()
    expect(mockPut).not.toHaveBeenCalled()
  })

  it('muestra el error del backend si falla al guardar', async () => {
    mockPut.mockRejectedValue(new Error('Umbral inválido'))

    render(<Configuracion />)
    await screen.findByLabelText(/pesos argentinos/i)

    await userEvent.click(screen.getByRole('button', { name: /guardar cambios/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Umbral inválido')
  })

  it('avisa si no puede cargar los umbrales', async () => {
    mockGet.mockRejectedValue(new Error('Usuario no encontrado'))

    render(<Configuracion />)

    expect(await screen.findByRole('alert')).toHaveTextContent('Usuario no encontrado')
  })
})