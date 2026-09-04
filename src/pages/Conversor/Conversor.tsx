import { useEffect, useState } from 'react'
import { api } from '../../services/api'

const C = {
  card: '#141210',
  cardBorder: 'rgba(232,196,104,0.14)',
  gold: '#f2d488',
  goldMid: '#d9a942',
  text: '#f6efdf',
  muted: '#9a927f',
  mutedDark: '#5c584c',
  error: '#e2705f',
  radius: '18px',
}

const CURRENCIES = ['ARS', 'USD', 'EUR', 'BTC']

interface RateResponse {
  from: string
  to: string
  rate: number
}

const fieldStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  boxSizing: 'border-box',
  background: '#0f0d0b',
  border: '1px solid rgba(232,196,104,0.14)',
  borderRadius: 10,
  color: '#f6efdf',
  fontFamily: 'Inter, sans-serif',
  fontSize: 14,
  outline: 'none',
}

const labelStyle: React.CSSProperties = {
  fontFamily: 'JetBrains Mono, monospace',
  fontSize: 10,
  textTransform: 'uppercase',
  letterSpacing: 3,
  color: '#9a927f',
  display: 'block',
  marginBottom: 6,
}

export default function Conversor() {
  const [from, setFrom] = useState('USD')
  const [to, setTo] = useState('ARS')
  const [amount, setAmount] = useState('100')

  const [rate, setRate] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    const loadRate = async () => {
      setLoading(true)
      setError('')

      try {
        const data = await api.get<RateResponse>(
          `/rates?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
        )

        if (!cancelled) {
          setRate(data.rate)
        }
      } catch (err) {
        if (!cancelled) {
          setRate(null)
          setError(
            err instanceof Error
              ? err.message
              : 'No se pudo obtener la cotización',
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadRate()

    return () => {
      cancelled = true
    }
  }, [from, to])

  const parsedAmount = Number(amount)

  const result =
    rate !== null && Number.isFinite(parsedAmount)
      ? (parsedAmount * rate).toFixed(to === 'BTC' ? 8 : 2)
      : '0.00'

  const swapCurrencies = () => {
    setFrom(to)
    setTo(from)
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
        maxWidth: 460,
      }}
    >
      <div>
        <h2
          style={{
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 700,
            fontSize: 24,
            color: C.text,
            margin: 0,
          }}
        >
          Conversor rápido
        </h2>

        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 14,
            color: C.muted,
            marginTop: 4,
          }}
        >
          Consultá tipos de cambio reales sin operar
        </p>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          background: C.card,
          border: `1px solid ${C.cardBorder}`,
          borderRadius: C.radius,
          padding: 24,
        }}
      >
        <div>
          <label style={labelStyle}>Moneda origen</label>

          <select
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            style={fieldStyle}
          >
            {CURRENCIES.filter((currency) => currency !== to).map(
              (currency) => (
                <option key={currency}>{currency}</option>
              ),
            )}
          </select>
        </div>

        <button
          type="button"
          onClick={swapCurrencies}
          style={{
            alignSelf: 'center',
            background: 'transparent',
            border: `1px solid ${C.cardBorder}`,
            borderRadius: 10,
            color: C.gold,
            padding: '8px 12px',
            cursor: 'pointer',
          }}
        >
          ⇅ Intercambiar
        </button>

        <div>
          <label style={labelStyle}>Moneda destino</label>

          <select
            value={to}
            onChange={(e) => setTo(e.target.value)}
            style={fieldStyle}
          >
            {CURRENCIES.filter((currency) => currency !== from).map(
              (currency) => (
                <option key={currency}>{currency}</option>
              ),
            )}
          </select>
        </div>

        <div>
          <label style={labelStyle}>Monto</label>

          <input
            type="number"
            min="0"
            placeholder="100"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={fieldStyle}
          />
        </div>

        <div
          style={{
            textAlign: 'center',
            padding: '24px 16px',
            background: '#0f0d0b',
            border: '1px solid rgba(242,212,136,0.2)',
            borderRadius: 14,
          }}
        >
          <p
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 10,
              textTransform: 'uppercase',
              letterSpacing: 4,
              color: C.muted,
              margin: '0 0 8px',
            }}
          >
            Resultado
          </p>

          {loading ? (
            <div
              style={{
                color: C.muted,
                fontFamily: 'Inter, sans-serif',
                padding: 12,
              }}
            >
              Consultando cotización...
            </div>
          ) : error ? (
            <div
              style={{
                color: C.error,
                fontFamily: 'Inter, sans-serif',
                padding: 12,
              }}
            >
              {error}
            </div>
          ) : (
            <>
              <div
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontWeight: 700,
                  fontSize: 40,
                  color: C.gold,
                  lineHeight: 1,
                }}
              >
                {result}
              </div>

              <div
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 14,
                  color: C.goldMid,
                  marginTop: 4,
                }}
              >
                {to}
              </div>

              {rate !== null && (
                <div
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 11,
                    color: C.mutedDark,
                    marginTop: 10,
                  }}
                >
                  1 {from} = {rate.toFixed(to === 'BTC' ? 8 : 6)} {to}
                </div>
              )}
            </>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 8,
            padding: '12px 14px',
            background: 'rgba(242,212,136,0.05)',
            border: '1px solid rgba(242,212,136,0.1)',
            borderRadius: 12,
          }}
        >
          <span style={{ color: C.gold, flexShrink: 0 }}>ℹ</span>

          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 12,
              color: C.muted,
            }}
          >
            Esta conversión es informativa y{' '}
            <strong style={{ color: C.text }}>
              no modifica tu saldo
            </strong>
            .
          </span>
        </div>
      </div>
    </div>
  )
}