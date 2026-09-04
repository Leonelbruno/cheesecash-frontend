import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../services/api'
import { CURRENCIES, formatAmount } from '../../services/rates'

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

interface ApiTransfer {
  id: number
  from_wallet_id: number
  to_wallet_id: number
  currency: string
  amount: number
  status: string
  created_at: string
}

const fieldStyle: React.CSSProperties = {
  width: '100%', padding: '12px 14px', boxSizing: 'border-box',
  background: '#0f0d0b', border: `1px solid ${C.cardBorder}`, borderRadius: 10,
  color: C.text, fontFamily: 'Inter, sans-serif', fontSize: 14, outline: 'none',
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

export default function Transferir() {
  const navigate = useNavigate()

  const [toEmail, setToEmail] = useState('')
  const [currency, setCurrency] = useState('ARS')
  const [amount, setAmount] = useState('')

  const [balances, setBalances] = useState<ApiBalance[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<ApiTransfer | null>(null)

  useEffect(() => {
    let cancelled = false

    api
      .get<ApiBalance[]>('/wallet/balances')
      .then(data => { if (!cancelled) setBalances(Array.isArray(data) ? data : []) })
      .catch(() => { if (!cancelled) setBalances([]) })

    return () => { cancelled = true }
  }, [])

  const numericAmount = parseFloat(amount.replace(',', '.'))
  const hasAmount = !Number.isNaN(numericAmount) && numericAmount > 0

  const balance = balances.find(b => b.currency === currency)
  const available = balance ? parseFloat(balance.amount) : 0
  const insufficient = hasAmount && numericAmount > available

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(toEmail.trim())
  const canSubmit = emailOk && hasAmount && !insufficient && !submitting

  async function handleSubmit() {
    if (!canSubmit) return
    setSubmitting(true)
    setError('')

    try {
      const transfer = await api.post<ApiTransfer>('/transfers', {
        toEmail: toEmail.trim(),
        currency,
        amount: numericAmount,
      })
      setResult(transfer)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos enviar la transferencia')
    } finally {
      setSubmitting(false)
    }
  }

  // --- Monto alto: queda pendiente de confirmación por mail ---
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
            Por el monto de la transferencia te enviamos un link de confirmación a
            tu correo. Tu saldo todavía no se modificó. El link vence en 2 horas.
          </p>
        </div>
        <div style={{ width: '100%', background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: C.radius, padding: 24, textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
            <span style={microStyle}>Para</span>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: C.text, wordBreak: 'break-all' }}>{toEmail}</span>
          </div>
          <div style={{ height: 1, background: C.cardBorder }} />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={microStyle}>Monto</span>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: C.gold, fontWeight: 700 }}>
              {formatAmount(result.currency, Number(result.amount))} {result.currency}
            </span>
          </div>
        </div>
        <button onClick={() => navigate('/dashboard')} style={{ width: '100%', padding: '14px 0', borderRadius: 12, border: `1px solid ${C.cardBorder}`, background: 'transparent', color: C.text, fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
          Volver al inicio
        </button>
      </div>
    )
  }

  // --- Transferencia enviada ---
  if (result) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 24, maxWidth: 420, margin: '40px auto 0' }}>
        <div style={{ width: 96, height: 96, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(242,212,136,0.08)', border: '2px solid rgba(242,212,136,0.3)' }}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="22" stroke={C.gold} strokeWidth="2" />
            <polyline points="14 24 21 31 34 18" stroke={C.gold} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 24, color: C.text, margin: 0 }}>¡Transferencia enviada!</h2>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: C.muted, marginTop: 6 }}>El dinero ya está en la cuenta del destinatario</p>
        </div>
        <div style={{ width: '100%', background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: C.radius, padding: 24, textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
            <span style={microStyle}>Para</span>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: C.text, wordBreak: 'break-all' }}>{toEmail}</span>
          </div>
          <div style={{ height: 1, background: C.cardBorder }} />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={microStyle}>Monto</span>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: C.gold, fontWeight: 700 }}>
              {formatAmount(result.currency, Number(result.amount))} {result.currency}
            </span>
          </div>
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
        <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 24, color: C.text, margin: 0 }}>Transferir</h2>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: C.muted, marginTop: 4 }}>Enviá dinero a otra cuenta de Cheese Cash</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: C.radius, padding: 24 }}>
        <div>
          <label htmlFor="tr-email" style={labelStyle}>Email del destinatario</label>
          <input
            id="tr-email"
            type="email"
            autoComplete="off"
            placeholder="nombre@correo.com"
            value={toEmail}
            onChange={e => setToEmail(e.target.value)}
            style={fieldStyle}
          />
          <div style={{ ...microStyle, marginTop: 6, letterSpacing: 1, textTransform: 'none', fontSize: 11 }}>
            Tiene que tener una cuenta en Cheese Cash
          </div>
        </div>

        <div>
          <label htmlFor="tr-currency" style={labelStyle}>Moneda</label>
          <select id="tr-currency" value={currency} onChange={e => setCurrency(e.target.value)} style={fieldStyle}>
            {CURRENCIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <div style={{ ...microStyle, marginTop: 6 }}>
            Disponible: {formatAmount(currency, available)} {currency}
          </div>
        </div>

        <div>
          <label htmlFor="tr-amount" style={labelStyle}>Monto</label>
          <input
            id="tr-amount"
            type="number"
            min="0"
            step="any"
            placeholder={`0.00 ${currency}`}
            value={amount}
            onChange={e => setAmount(e.target.value)}
            style={{ ...fieldStyle, borderColor: insufficient ? C.danger : C.cardBorder }}
          />
          {insufficient && (
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: C.danger, marginTop: 6 }}>
              No te alcanza el saldo en {currency}
            </div>
          )}
        </div>

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
            cursor: !canSubmit ? 'not-allowed' : 'pointer',
          }}>
          {submitting ? 'Enviando…' : 'Enviar transferencia'}
        </button>
      </div>
    </div>
  )
}