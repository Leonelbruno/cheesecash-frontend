import { useEffect, useState } from 'react'
import { api } from '../../services/api'

const C = {
  card: '#141210', cardBorder: 'rgba(232,196,104,0.14)',
  gold: '#f2d488', goldMid: '#d9a942',
  text: '#f6efdf', muted: '#9a927f', mutedDark: '#5c584c',
  green: '#4ade80', error: '#e2705f',
}

interface ApiTransaction {
  id: number
  wallet_id: number
  type: string
  from_currency: string
  to_currency: string
  from_amount: string
  to_amount: string
  exchange_rate_used: string
  status: string
  created_at: string
}

const TX_COLORS: Record<string, string> = {
  buy: 'rgba(74,222,128,0.12)',
  sell: 'rgba(226,112,95,0.12)',
  exchange: 'rgba(242,212,136,0.12)',
}
const TX_TEXT: Record<string, string> = {
  buy: '#4ade80', sell: '#e2705f', exchange: '#f2d488',
}
const TX_LABEL: Record<string, string> = {
  buy: 'Compra', sell: 'Venta', exchange: 'Intercambio',
}
const TX_EMOJI: Record<string, string> = {
  buy: '💰', sell: '📤', exchange: '🔄',
}

const FILTERS: { label: string; value: string }[] = [
  { label: 'Todas', value: 'all' },
  { label: 'Compra', value: 'buy' },
  { label: 'Venta', value: 'sell' },
  { label: 'Intercambio', value: 'exchange' },
]

function formatAmount(currency: string, amount: string) {
  const value = Number(amount)
  if (Number.isNaN(value)) return amount
  if (currency === 'BTC') return `${value.toFixed(8)} BTC`
  return `${value.toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currency}`
}

function formatRate(tx: ApiTransaction) {
  const rate = Number(tx.exchange_rate_used)
  if (Number.isNaN(rate)) return ''
  const decimals = rate < 1 ? 8 : 2
  return `1 ${tx.from_currency} = ${rate.toFixed(decimals)} ${tx.to_currency}`
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return {
    date: d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' }),
    time: d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
  }
}

export default function Historial() {
  const [active, setActive] = useState('all')
  const [transactions, setTransactions] = useState<ApiTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    api
      .get<ApiTransaction[]>('/transactions')
      .then((data) => {
        if (!cancelled) setTransactions(data)
      })
      .catch((err) => {
        if (!cancelled) setError((err as Error).message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const filtered = transactions.filter(
    (t) => active === 'all' || t.type === active,
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 680 }}>
      <div>
        <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 24, color: C.text, margin: 0 }}>Mis movimientos</h2>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: C.muted, marginTop: 4 }}>Historial completo de operaciones</p>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {FILTERS.map((f) => (
          <button key={f.value} onClick={() => setActive(f.value)} style={{
            padding: '6px 16px', borderRadius: 20, cursor: 'pointer', transition: 'all 0.15s',
            border: `1px solid ${active === f.value ? C.goldMid : C.cardBorder}`,
            background: active === f.value ? `linear-gradient(135deg, ${C.gold}, ${C.goldMid})` : 'transparent',
            color: active === f.value ? '#161311' : C.muted,
            fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 13,
          }}>
            {f.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {loading && (
          <div style={{ padding: '64px 0', textAlign: 'center', fontFamily: 'Inter, sans-serif', fontSize: 14, color: C.mutedDark }}>
            Cargando movimientos…
          </div>
        )}

        {!loading && error && (
          <div style={{ padding: '32px 20px', textAlign: 'center', fontFamily: 'Inter, sans-serif', fontSize: 14, color: C.error, background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 14 }}>
            {error}
          </div>
        )}

        {!loading && !error && filtered.map((t) => {
          const { date, time } = formatDate(t.created_at)
          return (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, background: '#1a1510', flexShrink: 0 }}>
                {TX_EMOJI[t.type] ?? '💱'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 6, background: TX_COLORS[t.type] ?? 'rgba(154,146,127,0.12)', color: TX_TEXT[t.type] ?? C.muted }}>
                  {TX_LABEL[t.type] ?? t.type}
                </span>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, marginTop: 4, color: C.mutedDark }}>
                  {t.from_currency} → {t.to_currency} · {date} · {time}
                </div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, marginTop: 2, color: C.mutedDark }}>
                  {formatRate(t)}
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 600, color: C.text }}>
                  {formatAmount(t.to_currency, t.to_amount)}
                </div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: C.mutedDark }}>
                  {formatAmount(t.from_currency, t.from_amount)}
                </div>
              </div>
            </div>
          )
        })}

        {!loading && !error && filtered.length === 0 && (
          <div style={{ padding: '64px 0', textAlign: 'center', fontFamily: 'Inter, sans-serif', fontSize: 14, color: C.mutedDark }}>
            {transactions.length === 0
              ? 'Todavía no tenés movimientos'
              : 'Sin movimientos para este filtro'}
          </div>
        )}
      </div>
    </div>
  )
}