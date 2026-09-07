import { useState } from 'react'
import { api } from '../../services/api'

const C = {
  card: '#141210', cardBorder: 'rgba(232,196,104,0.14)',
  gold: '#f2d488', goldMid: '#d9a942',
  text: '#f6efdf', muted: '#9a927f', mutedDark: '#5c584c',
  green: '#4ade80', error: '#e2705f',
}

const CURRENCIES = ['ARS', 'USD', 'EUR', 'BTC']

const CURRENCY_LABELS: Record<string, string> = {
  ARS: 'Peso Argentino',
  USD: 'Dólar Estadounidense',
  EUR: 'Euro',
  BTC: 'Bitcoin',
}

const QUICK_AMOUNTS: Record<string, number[]> = {
  ARS: [10000, 50000, 100000, 500000],
  USD: [10, 50, 100, 500],
  EUR: [10, 50, 100, 500],
  BTC: [0.001, 0.01, 0.1, 1],
}

function formatQuick(amount: number, currency: string): string {
  if (currency === 'BTC') return amount.toString()
  return amount.toLocaleString('es-AR')
}

export default function Recargar() {
  const [currency, setCurrency] = useState('ARS')
  const [amount, setAmount]     = useState('')
  const [loading, setLoading]   = useState(false)
  const [success, setSuccess]   = useState(false)
  const [error, setError]       = useState('')

  const parsed = parseFloat(amount.replace(',', '.'))
  const valid  = !isNaN(parsed) && parsed > 0

  async function handleSubmit() {
    if (!valid) return
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      await api.post('/deposits', { currency, amount: parsed })
      setSuccess(true)
      setAmount('')
    } catch (e: unknown) {
      const msg = (e as { message?: string })?.message
      setError(msg ?? 'No se pudo procesar la recarga. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box',
    padding: '12px 16px', borderRadius: 12,
    border: `1px solid ${C.cardBorder}`,
    background: '#0f0e0c', color: C.text,
    fontFamily: 'JetBrains Mono, monospace', fontSize: 16,
    outline: 'none',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 480 }}>
      <div>
        <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 24, color: C.text, margin: 0 }}>
          Recargar saldo
        </h2>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: C.muted, marginTop: 4 }}>
          Acreditación instantánea en tu wallet
        </p>
      </div>

      {/* Selector de moneda */}
      <div style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 16, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Moneda
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {CURRENCIES.map(c => (
            <button key={c} onClick={() => { setCurrency(c); setAmount('') }} style={{
              padding: '8px 18px', borderRadius: 10, cursor: 'pointer',
              border: `1px solid ${currency === c ? C.goldMid : C.cardBorder}`,
              background: currency === c ? `linear-gradient(135deg, ${C.gold}, ${C.goldMid})` : 'transparent',
              color: currency === c ? '#161311' : C.muted,
              fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: 13,
              transition: 'all 0.15s',
            }}>
              {c}
            </button>
          ))}
        </div>
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: C.mutedDark }}>
          {CURRENCY_LABELS[currency]}
        </div>
      </div>

      {/* Monto */}
      <div style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 16, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Monto
        </div>

        {/* Montos rápidos */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {QUICK_AMOUNTS[currency].map(q => (
            <button key={q} onClick={() => setAmount(String(q))} style={{
              padding: '6px 14px', borderRadius: 8, cursor: 'pointer',
              border: `1px solid ${amount === String(q) ? C.goldMid : C.cardBorder}`,
              background: amount === String(q) ? 'rgba(242,212,136,0.1)' : 'transparent',
              color: amount === String(q) ? C.gold : C.muted,
              fontFamily: 'JetBrains Mono, monospace', fontSize: 12,
              transition: 'all 0.15s',
            }}>
              {formatQuick(q, currency)} {currency}
            </button>
          ))}
        </div>

        <input
          type="number"
          min="0"
          step={currency === 'BTC' ? '0.00001' : '1'}
          placeholder={`Ingresá el monto en ${currency}`}
          value={amount}
          onChange={e => setAmount(e.target.value)}
          style={inputStyle}
        />
      </div>

      {/* Resumen */}
      {valid && (
        <div style={{
          background: 'rgba(242,212,136,0.06)', border: `1px solid rgba(242,212,136,0.2)`,
          borderRadius: 12, padding: '14px 20px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: C.muted }}>Vas a acreditar</span>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 16, fontWeight: 700, color: C.gold }}>
            {currency === 'BTC' ? parsed.toFixed(5) : parsed.toLocaleString('es-AR', { minimumFractionDigits: 2 })} {currency}
          </span>
        </div>
      )}

      {/* Feedback */}
      {success && (
        <div style={{
          padding: '14px 20px', borderRadius: 12,
          background: 'rgba(74,222,128,0.08)', border: `1px solid rgba(74,222,128,0.25)`,
          fontFamily: 'Inter, sans-serif', fontSize: 14, color: C.green,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          ✓ Recarga acreditada con éxito
        </div>
      )}
      {error && (
        <div style={{
          padding: '14px 20px', borderRadius: 12,
          background: 'rgba(226,112,95,0.08)', border: `1px solid rgba(226,112,95,0.25)`,
          fontFamily: 'Inter, sans-serif', fontSize: 14, color: C.error,
        }}>
          {error}
        </div>
      )}

      {/* Botón */}
      <button
        onClick={handleSubmit}
        disabled={!valid || loading}
        style={{
          padding: '14px', borderRadius: 12, border: 'none', cursor: valid && !loading ? 'pointer' : 'not-allowed',
          background: valid && !loading ? `linear-gradient(135deg, ${C.gold}, ${C.goldMid})` : 'rgba(242,212,136,0.15)',
          color: valid && !loading ? '#161311' : C.mutedDark,
          fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 15,
          transition: 'all 0.2s',
        }}
      >
        {loading ? 'Procesando...' : 'Confirmar recarga'}
      </button>
    </div>
  )
}
