import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../services/api'
import {
  CURRENCIES,
  getRate,
  decimalsFor,
  formatAmount,
} from '../../services/rates'

const C = {
  card: '#141210', cardBorder: 'rgba(232,196,104,0.14)',
  gold: '#f2d488', goldMid: '#d9a942',
  text: '#f6efdf', muted: '#9a927f', mutedDark: '#5c584c',
  danger: '#e2705f',
  radius: '18px',
}

interface ApiBalance {
  id: number
  wallet_id: number
  currency: string
  amount: string
}

interface ApiTransaction {
  id: number
  type: string
  from_currency: string
  to_currency: string
  from_amount: string
  to_amount: string
  exchange_rate_used: string
  status: string
  created_at: string
}

type Tab = 'comprar' | 'vender' | 'intercambiar'

const TABS: { id: Tab; label: string }[] = [
  { id: 'comprar', label: 'Comprar' },
  { id: 'vender', label: 'Vender' },
  { id: 'intercambiar', label: 'Intercambiar' },
]

const TX_TYPE: Record<Tab, string> = {
  comprar: 'buy',
  vender: 'sell',
  intercambiar: 'exchange',
}

const fieldStyle: React.CSSProperties = {
  width: '100%', padding: '12px 14px', boxSizing: 'border-box',
  background: '#0f0d0b', border: `1px solid ${C.cardBorder}`, borderRadius: 10,
  color: C.text, fontFamily: 'Inter, sans-serif', fontSize: 14,
  outline: 'none',
}
const labelStyle: React.CSSProperties = {
  fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
  textTransform: 'uppercase', letterSpacing: 3, color: C.muted,
  display: 'block', marginBottom: 6,
}
const microStyle: React.CSSProperties = {
  fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
  textTransform: 'uppercase', letterSpacing: 3, color: C.muted,
}

export default function Operar() {
  const navigate = useNavigate()

  const [tab, setTab] = useState<Tab>('comprar')
  const [from, setFrom] = useState('ARS')
  const [to, setTo] = useState('USD')
  const [amount, setAmount] = useState('')

  const [balances, setBalances] = useState<ApiBalance[]>([])
  const [rateInfo, setRateInfo] = useState<{ pair: string; rate: number | null }>({
    pair: '',
    rate: null,
  })

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<ApiTransaction | null>(null)

  const loadBalances = useCallback(() => {
    api
      .get<ApiBalance[]>('/wallet/balances')
      .then(data => setBalances(Array.isArray(data) ? data : []))
      .catch(() => setBalances([]))
  }, [])

  useEffect(() => {
    let cancelled = false

    api
      .get<ApiBalance[]>('/wallet/balances')
      .then(data => { if (!cancelled) setBalances(Array.isArray(data) ? data : []) })
      .catch(() => { if (!cancelled) setBalances([]) })

    return () => { cancelled = true }
  }, [])

  // Cotización real del par elegido
  useEffect(() => {
    let cancelled = false
    const pair = `${from}/${to}`

    getRate(from, to)
      .then(r => { if (!cancelled) setRateInfo({ pair, rate: r }) })
      .catch(() => { if (!cancelled) setRateInfo({ pair, rate: null }) })

    return () => { cancelled = true }
  }, [from, to])

  const currentPair = `${from}/${to}`
  const rateLoaded = rateInfo.pair === currentPair
  const rate = rateLoaded ? rateInfo.rate : null
  const rateError = rateLoaded && rateInfo.rate === null

  const numericAmount = parseFloat(amount.replace(',', '.'))
  const hasAmount = !Number.isNaN(numericAmount) && numericAmount > 0

  const fromBalance = balances.find(b => b.currency === from)
  const available = fromBalance ? parseFloat(fromBalance.amount) : 0
  const insufficient = hasAmount && numericAmount > available

  const preview = hasAmount && rate !== null
    ? (numericAmount * rate).toFixed(decimalsFor(to))
    : ''

  const canSubmit = hasAmount && !insufficient && !submitting && rate !== null

  async function handleSubmit() {
    if (!canSubmit) return
    setSubmitting(true)
    setError('')

    try {
      const tx = await api.post<ApiTransaction>('/transactions', {
        type: TX_TYPE[tab],
        fromCurrency: from,
        toCurrency: to,
        fromAmount: numericAmount,
      })
      setResult(tx)
      if (tx.status !== 'pending') loadBalances()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos procesar la operación')
    } finally {
      setSubmitting(false)
    }
  }

  // --- Operación de monto alto: queda pendiente de confirmación por mail ---
  if (result && result.status === 'pending') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 24, maxWidth: 420, margin: '40px auto 0' }}>
        <div style={{ width: 96, height: 96, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(242,212,136,0.08)', border: `2px solid ${C.cardBorder}` }}>
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="m22 7-10 6L2 7" />
          </svg>
        </div>
        <div>
          <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 24, color: C.text, margin: 0 }}>Confirmá por email</h2>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: C.muted, marginTop: 8, lineHeight: 1.5 }}>
            Por el monto de la operación te enviamos un link de confirmación a tu correo.
            Tu saldo todavía no se modificó. El link vence en 2 horas.
          </p>
        </div>
        <div style={{ width: '100%', background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: C.radius, padding: 24, textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={microStyle}>Enviás</span>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: C.text }}>
              {formatAmount(result.from_currency, Number(result.from_amount))} {result.from_currency}
            </span>
          </div>
          <div style={{ height: 1, background: C.cardBorder }} />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={microStyle}>Recibís</span>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: C.gold, fontWeight: 700 }}>
              {formatAmount(result.to_currency, Number(result.to_amount))} {result.to_currency}
            </span>
          </div>
        </div>
        <button onClick={() => navigate('/dashboard')} style={{ width: '100%', padding: '14px 0', borderRadius: 12, border: `1px solid ${C.cardBorder}`, background: 'transparent', color: C.text, fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
          Volver al inicio
        </button>
      </div>
    )
  }

  // --- Operación confirmada ---
  if (result) {
    const usedRate = Number(result.exchange_rate_used)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 24, maxWidth: 420, margin: '40px auto 0' }}>
        <div style={{ width: 96, height: 96, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(242,212,136,0.08)', border: '2px solid rgba(242,212,136,0.3)' }}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="22" stroke={C.gold} strokeWidth="2" />
            <polyline points="14 24 21 31 34 18" stroke={C.gold} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 24, color: C.text, margin: 0 }}>¡Operación realizada!</h2>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: C.muted, marginTop: 6 }}>Tu transacción fue procesada con éxito</p>
        </div>
        <div style={{ width: '100%', background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: C.radius, padding: 24, textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            ['Tipo', result.type === 'buy' ? 'Compra' : result.type === 'sell' ? 'Venta' : 'Intercambio'],
            ['Enviaste', `${formatAmount(result.from_currency, Number(result.from_amount))} ${result.from_currency}`],
            ['Recibiste', `${formatAmount(result.to_currency, Number(result.to_amount))} ${result.to_currency}`],
            ['Tasa', usedRate > 0 ? `1 ${result.to_currency} = ${(1 / usedRate).toFixed(4)} ${result.from_currency}` : '—'],
          ].map(([label, val], i, arr) => (
            <div key={i}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={microStyle}>{label}</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: i === 2 ? C.gold : C.text, fontWeight: i === 2 ? 700 : 500 }}>{val}</span>
              </div>
              {i < arr.length - 1 && <div style={{ height: 1, background: C.cardBorder, marginTop: 16 }} />}
            </div>
          ))}
        </div>
        <button onClick={() => navigate('/dashboard')} style={{ width: '100%', padding: '14px 0', borderRadius: 12, border: 'none', background: `linear-gradient(135deg, ${C.gold}, ${C.goldMid})`, color: '#161311', fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
          Volver al inicio
        </button>
      </div>
    )
  }

  // --- Formulario ---
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 460 }}>
      <div>
        <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 24, color: C.text, margin: 0 }}>Operar</h2>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: C.muted, marginTop: 4 }}>Comprá, vendé e intercambiá divisas</p>
      </div>

      {/* Tabs */}
      <div style={{ position: 'relative', display: 'flex', padding: 4, background: C.card, borderRadius: 14, border: `1px solid ${C.cardBorder}` }}>
        <div style={{
          position: 'absolute', top: 4, bottom: 4, borderRadius: 10,
          width: `calc(${100 / 3}% - 2px)`,
          background: `linear-gradient(135deg, ${C.gold}, ${C.goldMid})`,
          transition: 'transform 0.2s',
          transform: `translateX(${TABS.findIndex(t => t.id === tab) * 100}%)`,
        }} />
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, padding: '10px 0', position: 'relative', zIndex: 1,
            background: 'transparent', border: 'none', borderRadius: 10,
            fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: 14,
            color: tab === t.id ? '#161311' : C.muted, cursor: 'pointer', transition: 'color 0.2s',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Form */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: C.radius, padding: 24 }}>
        <div>
          <label htmlFor="op-from" style={labelStyle}>
            {tab === 'comprar' ? 'Comprás con' : tab === 'vender' ? 'Moneda a vender' : 'Origen'}
          </label>
          <select id="op-from" value={from} onChange={e => setFrom(e.target.value)} style={fieldStyle}>
            {CURRENCIES.filter(c => c !== to).map(c => <option key={c}>{c}</option>)}
          </select>
          <div style={{ ...microStyle, marginTop: 6 }}>
            Disponible: {formatAmount(from, available)} {from}
          </div>
        </div>

        <div>
          <label htmlFor="op-to" style={labelStyle}>{tab === 'comprar' ? 'Recibís en' : 'Destino'}</label>
          <select id="op-to" value={to} onChange={e => setTo(e.target.value)} style={fieldStyle}>
            {CURRENCIES.filter(c => c !== from).map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="op-amount" style={labelStyle}>Monto</label>
          <input
            id="op-amount"
            type="number"
            min="0"
            step="any"
            placeholder={`0.00 ${from}`}
            value={amount}
            onChange={e => setAmount(e.target.value)}
            style={{
              ...fieldStyle,
              borderColor: insufficient ? C.danger : C.cardBorder,
            }}
          />
          {insufficient && (
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: C.danger, marginTop: 6 }}>
              No te alcanza el saldo en {from}
            </div>
          )}
        </div>

        {hasAmount && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#0f0d0b', border: '1px solid rgba(242,212,136,0.2)', borderRadius: 12 }}>
            <div>
              <div style={{ ...microStyle, marginBottom: 2 }}>Tasa</div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: C.goldMid }}>
                {rateError ? 'no disponible' : rate === null ? '…' : `1 ${to} = ${(1 / rate).toFixed(4)} ${from}`}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ ...microStyle, marginBottom: 2 }}>Recibís</div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: 20, color: C.gold }}>
                {preview ? `${preview} ${to}` : '—'}
              </div>
            </div>
          </div>
        )}

        {error && (
          <div role="alert" style={{ padding: '12px 14px', borderRadius: 10, background: 'rgba(226,112,95,0.1)', border: `1px solid ${C.danger}`, color: C.danger, fontFamily: 'Inter, sans-serif', fontSize: 13 }}>
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          style={{
            padding: '14px 0', borderRadius: 12, border: 'none',
            background: !canSubmit ? 'rgba(242,212,136,0.2)' : `linear-gradient(135deg, ${C.gold}, ${C.goldMid})`,
            color: !canSubmit ? C.mutedDark : '#161311',
            fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 15,
            cursor: !canSubmit ? 'not-allowed' : 'pointer', transition: 'opacity 0.2s',
          }}>
          {submitting ? 'Procesando…' : 'Confirmar operación'}
        </button>
      </div>
    </div>
  )
}