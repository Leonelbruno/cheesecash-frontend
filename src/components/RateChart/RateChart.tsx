import { useCallback, useEffect, useRef, useState } from 'react'
import {
  CURRENCIES,
  getRate,
  getRateHistory,
  type RatePoint,
} from '../../services/rates'
import './RateChart.css'

/** Cada cuánto pedimos la cotización de ahora, en milisegundos. */
const LIVE_INTERVAL_MS = 30_000

/** Períodos que puede elegir el usuario. El backend acepta de 1 a 90 días. */
const RANGES = [
  { days: 7, label: '7D' },
  { days: 30, label: '30D' },
  { days: 90, label: '90D' },
] as const

const W = 600
const H = 180
const PAD = { top: 14, right: 8, bottom: 22, left: 8 }

interface RateChartProps {
  /** Moneda de origen. En Operar, la que entrega el usuario. */
  from: string
  /** Moneda de destino. */
  to: string
  /** Período inicial, en días. El usuario puede cambiarlo si selectable. */
  days?: number
  /**
   * Muestra los botones para elegir qué moneda ver contra `to`.
   * Se usa en el inicio; en Operar el par lo fija la operación.
   */
  selectable?: boolean
  /** Título sobre el gráfico. */
  title?: string
}

function formatRate(value: number): string {
  if (value >= 1000) {
    return value.toLocaleString('es-AR', { maximumFractionDigits: 0 })
  }
  if (value >= 1) {
    return value.toLocaleString('es-AR', { maximumFractionDigits: 2 })
  }
  return value.toLocaleString('es-AR', { maximumFractionDigits: 6 })
}

function formatDay(date: string): string {
  const [, m, d] = date.split('-')
  return `${d}/${m}`
}

export default function RateChart({
  from,
  to,
  days = 7,
  selectable = false,
  title,
}: RateChartProps) {
  const [pick, setPick] = useState(from)
  const [range, setRange] = useState(days)
  const activeFrom = selectable ? pick : from
  const activeDays = selectable ? range : days

  const [hover, setHover] = useState<number | null>(null)
  const [livePulse, setLivePulse] = useState(false)

  // Guardamos el par junto con sus datos. Así, mientras llega la serie del
  // par nuevo, sabemos que lo que tenemos en mano es de otro par y mostramos
  // el estado de carga sin necesidad de un setState extra.
  const [data, setData] = useState<{
    pair: string
    points: RatePoint[]
    error: string
  }>({ pair: '', points: [], error: '' })

  const pair = `${activeFrom}/${to}/${activeDays}`
  const ready = data.pair === pair
  const points = ready ? data.points : []
  const error = ready ? data.error : ''
  const loading = !ready

  // El par vigente en un ref: el intervalo se arma una sola vez y lee de acá,
  // así no se reinicia cada vez que el usuario cambia de moneda.
  const pairRef = useRef({ from: activeFrom, to })

  useEffect(() => {
    pairRef.current = { from: activeFrom, to }
  }, [activeFrom, to])

  useEffect(() => {
    let cancelled = false

    getRateHistory(activeFrom, to, activeDays)
      .then(points => {
        if (!cancelled) setData({ pair, points, error: '' })
      })
      .catch(err => {
        if (cancelled) return
        setData({
          pair,
          points: [],
          error: err instanceof Error ? err.message : 'No pudimos cargar la cotización',
        })
      })

    return () => { cancelled = true }
  }, [activeFrom, to, activeDays, pair])

  /** Agrega o actualiza el punto de hoy con la cotización del momento. */
  const tick = useCallback(async () => {
    const { from: f, to: t } = pairRef.current

    try {
      const rate = await getRate(f, t)
      const today = new Date().toISOString().slice(0, 10)

      setData(prev => {
        if (prev.points.length === 0) return prev
        const last = prev.points[prev.points.length - 1]

        const points =
          last.date === today
            ? [...prev.points.slice(0, -1), { date: today, rate }]
            : [...prev.points, { date: today, rate }]

        return { ...prev, points }
      })

      setLivePulse(true)
      setTimeout(() => setLivePulse(false), 900)
    } catch {
      // Un fallo puntual no rompe el gráfico: se queda con lo último bueno.
    }
  }, [])

  useEffect(() => {
    const id = setInterval(tick, LIVE_INTERVAL_MS)
    return () => clearInterval(id)
  }, [tick])

  const rates = points.map(p => p.rate)
  const rawMin = Math.min(...rates)
  const rawMax = Math.max(...rates)
  const mid = (rawMin + rawMax) / 2

  // Sin esto, una variación del 0,3% ocuparía todo el alto y la curva
  // parecería un precipicio. Le damos al eje un ancho mínimo del 4% del
  // valor, así lo plano se ve plano y lo movido se ve movido.
  const MIN_SPAN_RATIO = 0.04
  const naturalSpan = rawMax - rawMin
  const minSpan = Math.abs(mid) * MIN_SPAN_RATIO
  const span = Math.max(naturalSpan * 1.4, minSpan) || 1
  const min = mid - span / 2

  const innerW = W - PAD.left - PAD.right
  const innerH = H - PAD.top - PAD.bottom

  const coords = points.map((p, i) => ({
    x: PAD.left + (points.length === 1 ? innerW / 2 : (i / (points.length - 1)) * innerW),
    y: PAD.top + innerH - ((p.rate - min) / span) * innerH,
    ...p,
  }))

  const line = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ')
  const area = coords.length
    ? `${line} L${coords[coords.length - 1].x.toFixed(1)},${H - PAD.bottom} L${coords[0].x.toFixed(1)},${H - PAD.bottom} Z`
    : ''

  const first = points[0]?.rate
  const current = points[points.length - 1]?.rate
  const change = first && current ? ((current - first) / first) * 100 : 0
  const shown = hover !== null ? coords[hover] : coords[coords.length - 1]

  return (
    <div className="rate-chart">
      <div className="rate-chart-head">
        <div>
          <p className="rate-chart-title">
            {title ?? `1 ${activeFrom} en ${to}`}
          </p>
          {shown && (
            <p className="rate-chart-value">
              <span className={livePulse ? 'rate-chart-figure is-live' : 'rate-chart-figure'}>
                {formatRate(shown.rate)} {to}
              </span>
              {hover !== null && (
                <span className="rate-chart-date">{formatDay(shown.date)}</span>
              )}
            </p>
          )}
        </div>

        {points.length > 1 && (
          <span className={change >= 0 ? 'rate-chart-delta is-up' : 'rate-chart-delta is-down'}>
            {change >= 0 ? '▲' : '▼'} {Math.abs(change).toFixed(2)}%
          </span>
        )}
      </div>

      {selectable && (
        <div className="rate-chart-controls">
          <div className="rate-chart-picker" role="group" aria-label="Elegir moneda">
            {CURRENCIES.filter(c => c !== to).map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setPick(c)}
                aria-pressed={activeFrom === c}
                className={activeFrom === c ? 'is-active' : undefined}>
                {c}
              </button>
            ))}
          </div>

          <div className="rate-chart-picker" role="group" aria-label="Elegir período">
            {RANGES.map(r => (
              <button
                key={r.days}
                type="button"
                onClick={() => setRange(r.days)}
                aria-pressed={activeDays === r.days}
                className={activeDays === r.days ? 'is-active' : undefined}>
                {r.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading && <p className="rate-chart-msg">Cargando cotización…</p>}

      {!loading && error && (
        <p className="rate-chart-msg is-error" role="alert">{error}</p>
      )}

      {!loading && !error && points.length === 0 && (
        <p className="rate-chart-msg">Todavía no hay datos para este par.</p>
      )}

      {!loading && !error && points.length > 0 && (
        <svg
          className="rate-chart-svg"
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          role="img"
          aria-label={`Evolución de ${activeFrom} en ${to} en los últimos ${activeDays} días`}
          onMouseLeave={() => setHover(null)}>
          <defs>
            <linearGradient id="rate-chart-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f2d488" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#f2d488" stopOpacity="0" />
            </linearGradient>
          </defs>

          {area && <path d={area} fill="url(#rate-chart-fill)" />}
          <path d={line} className="rate-chart-line" />

          {shown && <circle cx={shown.x} cy={shown.y} r="4" className="rate-chart-dot" />}

          {hover !== null && (
            <line
              x1={coords[hover].x} y1={PAD.top}
              x2={coords[hover].x} y2={H - PAD.bottom}
              className="rate-chart-guide"
            />
          )}

          {/* Zonas invisibles para detectar sobre qué punto está el mouse */}
          {coords.map((c, i) => (
            <rect
              key={c.date}
              x={c.x - innerW / (coords.length * 2)}
              y={0}
              width={innerW / coords.length}
              height={H}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
            />
          ))}
        </svg>
      )}

      {!loading && !error && points.length > 1 && (
        <div className="rate-chart-axis">
          <span>{formatDay(points[0].date)}</span>
          <span>{activeDays} días</span>
          <span>{formatDay(points[points.length - 1].date)}</span>
        </div>
      )}
    </div>
  )
}