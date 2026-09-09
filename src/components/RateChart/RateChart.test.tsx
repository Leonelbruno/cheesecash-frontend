import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RateChart from './RateChart'
import { getRateHistory, getRate } from '../../services/rates'

vi.mock('../../services/rates', async importOriginal => {
  const real = await importOriginal<typeof import('../../services/rates')>()
  return { ...real, getRateHistory: vi.fn(), getRate: vi.fn() }
})

const mockHistory = vi.mocked(getRateHistory)
const mockRate = vi.mocked(getRate)

const serie = [
  { date: '2026-09-01', rate: 1000 },
  { date: '2026-09-02', rate: 1100 },
  { date: '2026-09-03', rate: 1200 },
]

describe('RateChart', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockHistory.mockResolvedValue(serie)
    mockRate.mockResolvedValue(1250)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('pide el histórico del par que recibe', async () => {
    render(<RateChart from="USD" to="ARS" days={7} />)

    await screen.findByText(/1\.200 ARS/)
    expect(mockHistory).toHaveBeenCalledWith('USD', 'ARS', 7)
  })

  it('muestra la última cotización de la serie', async () => {
    render(<RateChart from="USD" to="ARS" />)

    expect(await screen.findByText(/1\.200 ARS/)).toBeInTheDocument()
  })

  it('calcula la variación entre el primer y el último punto', async () => {
    render(<RateChart from="USD" to="ARS" />)

    // de 1000 a 1200 es +20%
    expect(await screen.findByText(/20\.00%/)).toBeInTheDocument()
  })

  it('marca la variación como negativa cuando la serie baja', async () => {
    mockHistory.mockResolvedValue([
      { date: '2026-09-01', rate: 1200 },
      { date: '2026-09-02', rate: 900 },
    ])

    render(<RateChart from="USD" to="ARS" />)

    const delta = await screen.findByText(/25\.00%/)
    expect(delta.className).toContain('is-down')
  })

  it('sin selector no muestra los botones de moneda', async () => {
    render(<RateChart from="USD" to="ARS" />)
    await screen.findByText(/1\.200 ARS/)

    expect(screen.queryByRole('group', { name: /elegir moneda/i })).not.toBeInTheDocument()
  })

  it('con selector permite cambiar de moneda y vuelve a pedir la serie', async () => {
    render(<RateChart from="USD" to="ARS" selectable />)
    await screen.findByText(/1\.200 ARS/)

    await userEvent.click(screen.getByRole('button', { name: 'EUR' }))

    expect(mockHistory).toHaveBeenLastCalledWith('EUR', 'ARS', 7)
  })

  it('no ofrece como origen la misma moneda de destino', async () => {
    render(<RateChart from="USD" to="ARS" selectable />)
    await screen.findByText(/1\.200 ARS/)

    expect(screen.queryByRole('button', { name: 'ARS' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'BTC' })).toBeInTheDocument()
  })

  it('avisa cuando el backend falla', async () => {
    mockHistory.mockRejectedValue(new Error('Moneda no soportada'))

    render(<RateChart from="USD" to="ARS" />)

    expect(await screen.findByRole('alert')).toHaveTextContent('Moneda no soportada')
  })

  it('avisa cuando el par no tiene datos', async () => {
    mockHistory.mockResolvedValue([])

    render(<RateChart from="USD" to="ARS" />)

    expect(await screen.findByText(/todavía no hay datos/i)).toBeInTheDocument()
  })

  it('actualiza la cotización en vivo sin volver a pedir el histórico', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })

    render(<RateChart from="USD" to="ARS" />)
    await vi.waitFor(() => expect(mockHistory).toHaveBeenCalled())

    await act(async () => {
      await vi.advanceTimersByTimeAsync(30_000)
    })

    expect(mockRate).toHaveBeenCalledWith('USD', 'ARS')
    expect(mockHistory).toHaveBeenCalledTimes(1)
  })

  it('con selector permite cambiar el período y vuelve a pedir la serie', async () => {
    render(<RateChart from="USD" to="ARS" selectable />)
    await screen.findByText(/1\.200 ARS/)

    await userEvent.click(screen.getByRole('button', { name: '30D' }))

    expect(mockHistory).toHaveBeenLastCalledWith('USD', 'ARS', 30)
  })

  it('arranca en el período que recibe por prop', async () => {
    render(<RateChart from="USD" to="ARS" days={90} selectable />)
    await screen.findByText(/1\.200 ARS/)

    expect(mockHistory).toHaveBeenCalledWith('USD', 'ARS', 90)
    expect(screen.getByRole('button', { name: '90D' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('sin selector no muestra los botones de período', async () => {
    render(<RateChart from="USD" to="ARS" />)
    await screen.findByText(/1\.200 ARS/)

    expect(screen.queryByRole('group', { name: /elegir período/i })).not.toBeInTheDocument()
  })

  it('mantiene la moneda elegida al cambiar de período', async () => {
    render(<RateChart from="USD" to="ARS" selectable />)
    await screen.findByText(/1\.200 ARS/)

    await userEvent.click(screen.getByRole('button', { name: 'BTC' }))
    await userEvent.click(screen.getByRole('button', { name: '30D' }))

    expect(mockHistory).toHaveBeenLastCalledWith('BTC', 'ARS', 30)
  })
})