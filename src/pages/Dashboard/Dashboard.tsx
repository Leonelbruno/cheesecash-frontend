import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'
import { api } from '../../services/api'

const C = {
  bg: '#0a0908',
  card: '#141210',
  cardBorder: 'rgba(232,196,104,0.14)',
  gold: '#f2d488',
  goldMid: '#d9a942',
  text: '#f6efdf',
  muted: '#9a927f',
  mutedDark: '#5c584c',
  green: '#4ade80',
  error: '#e2705f',
  radius: '18px',
}

interface Balance {
  currency: string
  amount: number
}

interface Transaction {
  id: string | number
  type: string
  fromCurrency?: string
  toCurrency?: string
  from_currency?: string
  to_currency?: string
  fromAmount?: number
  toAmount?: number
  from_amount?: number
  to_amount?: number
  createdAt?: string
  created_at?: string
}

const CURRENCY_META: Record<string, { name: string; flag: string }> = {
  ARS: { name: 'Peso Argentino',       flag: '🇦🇷' },
  USD: { name: 'Dólar Estadounidense', flag: '🇺🇸' },
  EUR: { name: 'Euro',                 flag: '🇪🇺' },
  BTC: { name: 'Bitcoin',              flag: '₿'   },
}

// El backend puede devolver el tipo en inglés o en español
const TX_TYPE_NORM: Record<string, string> = {
  buy: 'compra', compra: 'compra',
  sell: 'venta', venta: 'venta',
  exchange: 'intercambio', intercambio: 'intercambio',
  transfer: 'transferencia', transferencia: 'transferencia',
}

const TX_COLORS: Record<string, string> = {
  compra:        'rgba(74,222,128,0.12)',
  venta:         'rgba(226,112,95,0.12)',
  intercambio:   'rgba(242,212,136,0.12)',
  transferencia: 'rgba(154,146,127,0.12)',
}
const TX_TEXT: Record<string, string> = {
  compra: '#4ade80', venta: '#e2705f', intercambio: '#f2d488', transferencia: '#9a927f',
}
const TX_LABEL: Record<string, string> = {
  compra: 'Compra', venta: 'Venta', intercambio: 'Intercambio', transferencia: 'Transferencia',
}
const TX_EMOJI: Record<string, string> = {
  compra: '💰', venta: '📤', intercambio: '🔄', transferencia: '📲',
}

const QUICK_ACTIONS = [
  { label: 'Comprar',      emoji: '💰', to: '/operar' },
  { label: 'Vender',       emoji: '📤', to: '/operar' },
  { label: 'Intercambiar', emoji: '🔄', to: '/operar' },
  { label: 'Conversor',    emoji: '🔢', to: '/conversor' },
  { label: 'Transferir',   emoji: '📲', to: '/transferir' },
]

function formatAmount(amount: number, currency: string): string {
  if (currency === 'BTC') {
    return amount.toLocaleString('es-AR', { minimumFractionDigits: 5, maximumFractionDigits: 8 })
  }
  return amount.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

// Skeleton de carga
function SkeletonCard({ height = 80 }: { height?: number }) {
  return (
    <div style={{
      background: C.card, border: `1px solid ${C.cardBorder}`,
      borderRadius: 14, height,
      animation: 'pulse 1.5s ease-in-out infinite',
    }} />
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [balances, setBalances]     = useState<Balance[]>([])
  const [txs, setTxs]               = useState<Transaction[]>([])
  const [loadingBal, setLoadingBal] = useState(true)
  const [loadingTx, setLoadingTx]   = useState(true)
  const [errorBal, setErrorBal]     = useState('')
  const [errorTx, setErrorTx]       = useState('')

  useEffect(() => {
    api.get<Balance[] | { balances: Balance[] }>('/wallet/balances')
      .then(res => {
        const data = Array.isArray(res) ? res : (res as { balances: Balance[] }).balances ?? []
        setBalances(data)
      })
      .catch(() => setErrorBal('No se pudo cargar el saldo. Intentá de nuevo más tarde.'))
      .finally(() => setLoadingBal(false))

    api.get<Transaction[] | { transactions: Transaction[] }>('/transactions')
      .then(res => {
        const data = Array.isArray(res) ? res : (res as { transactions: Transaction[] }).transactions ?? []
        setTxs(data)
      })
      .catch(() => setErrorTx('No se pudo cargar los movimientos.'))
      .finally(() => setLoadingTx(false))
  }, [])

  const firstName = user?.fullName?.split(' ')[0] ?? 'Usuario'
  const initials = user?.fullName
    ? user.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  const usdBalance = balances.find(b => b.currency === 'USD')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 680, padding: '8px 0' }}>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: C.muted, margin: 0 }}>
            Bienvenido de vuelta
          </p>
          <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 24, color: C.text, margin: '4px 0 0' }}>
            Hola, {firstName} 👋
          </h2>
        </div>
        <div style={{
          width: 44, height: 44, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 18,
          background: `linear-gradient(135deg, ${C.gold}, ${C.goldMid})`,
          color: '#161311',
        }}>
          {initials}
        </div>
      </div>

      {/* Balance card */}
      {loadingBal ? (
        <SkeletonCard height={120} />
      ) : errorBal ? (
        <div style={{
          background: 'rgba(226,112,95,0.08)', border: `1px solid rgba(226,112,95,0.3)`,
          borderRadius: C.radius, padding: '24px 28px',
          fontFamily: 'Inter, sans-serif', fontSize: 14, color: C.error,
        }}>
          {errorBal}
        </div>
      ) : (
        <div style={{
          position: 'relative', overflow: 'hidden',
          background: C.card, border: `1px solid ${C.cardBorder}`,
          borderRadius: C.radius, padding: 28,
        }}>
          <div style={{
            position: 'absolute', top: -40, right: -40, width: 160, height: 160,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(217,169,66,0.1), transparent)',
            filter: 'blur(30px)',
          }} />
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, textTransform: 'uppercase', letterSpacing: 4, color: C.muted, margin: '0 0 8px' }}>
            Saldo en dólares
          </p>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: 42, color: C.gold, letterSpacing: -1 }}>
            $ {usdBalance ? formatAmount(usdBalance.amount, 'USD') : '0,00'}
          </div>
          {balances.length === 0 && (
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: C.mutedDark, marginTop: 8 }}>
              Aún no tenés saldo. ¡Operá tu primera moneda!
            </p>
          )}
        </div>
      )}

      {/* Currency cards */}
      <div>
        <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, textTransform: 'uppercase', letterSpacing: 4, color: C.muted, marginBottom: 12 }}>
          Mis monedas
        </p>
        {loadingBal ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
          </div>
        ) : balances.length === 0 && !errorBal ? (
          <div style={{
            padding: '32px 0', textAlign: 'center',
            fontFamily: 'Inter, sans-serif', fontSize: 14, color: C.mutedDark,
          }}>
            Todavía no tenés monedas. Empezá comprando desde <span style={{ color: C.gold, cursor: 'pointer' }} onClick={() => navigate('/operar')}>Operar</span>.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {balances.map(b => {
              const meta = CURRENCY_META[b.currency] ?? { name: b.currency, flag: '💱' }
              return (
                <div key={b.currency} style={{
                  background: C.card, border: `1px solid ${C.cardBorder}`,
                  borderRadius: 14, padding: 16,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <span style={{ fontSize: 20 }}>{meta.flag}</span>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 600, color: C.muted }}>{b.currency}</span>
                  </div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: 18, color: C.text }}>
                    {formatAmount(b.amount, b.currency)}
                  </div>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, marginTop: 2, color: C.mutedDark }}>{meta.name}</div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div>
        <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, textTransform: 'uppercase', letterSpacing: 4, color: C.muted, marginBottom: 12 }}>
          Accesos rápidos
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
          {QUICK_ACTIONS.map(a => (
            <button key={a.label} onClick={() => navigate(a.to)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                padding: '16px 8px', cursor: 'pointer',
                background: C.card, border: `1px solid ${C.cardBorder}`,
                borderRadius: 14, transition: 'transform 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <span style={{ fontSize: 20 }}>{a.emoji}</span>
              <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 11, textAlign: 'center', color: C.text, lineHeight: 1.3 }}>
                {a.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Last transactions */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, textTransform: 'uppercase', letterSpacing: 4, color: C.muted, margin: 0 }}>
            Últimos movimientos
          </p>
          <button onClick={() => navigate('/historial')}
            style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: C.gold, background: 'none', border: 'none', cursor: 'pointer' }}>
            Ver todos
          </button>
        </div>

        {loadingTx ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <SkeletonCard height={70} /><SkeletonCard height={70} /><SkeletonCard height={70} />
          </div>
        ) : errorTx ? (
          <div style={{
            padding: '24px 20px',
            fontFamily: 'Inter, sans-serif', fontSize: 13, color: C.mutedDark,
            background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 14,
          }}>
            {errorTx}
          </div>
        ) : txs.length === 0 ? (
          <div style={{
            padding: '48px 0', textAlign: 'center',
            fontFamily: 'Inter, sans-serif', fontSize: 14, color: C.mutedDark,
          }}>
            Todavía no realizaste ninguna operación.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {txs.map(t => {
              const rawType = t.type?.toLowerCase() ?? ''
              const tipo = TX_TYPE_NORM[rawType] ?? rawType
              const fromCur = t.fromCurrency ?? t.from_currency ?? ''
              const toCur   = t.toCurrency   ?? t.to_currency   ?? ''
              const toAmt   = t.toAmount     ?? t.to_amount     ?? 0
              const fromAmt = t.fromAmount   ?? t.from_amount   ?? 0
              const dateStr = formatDate(t.createdAt ?? t.created_at)
              return (
                <div key={String(t.id)} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '14px 16px',
                  background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 14,
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, background: '#1a1510', flexShrink: 0,
                  }}>
                    {TX_EMOJI[tipo] ?? '💱'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{
                      fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 600,
                      padding: '2px 8px', borderRadius: 6,
                      background: TX_COLORS[tipo] ?? 'rgba(154,146,127,0.12)',
                      color: TX_TEXT[tipo] ?? C.muted,
                    }}>
                      {TX_LABEL[tipo] ?? t.type}
                    </span>
                    <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, marginTop: 4, color: C.mutedDark }}>
                      {fromCur && toCur ? `${fromCur} → ${toCur}` : tipo} {dateStr ? `· ${dateStr}` : ''}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 600, color: C.text }}>
                      {toAmt ? `${formatAmount(toAmt, toCur)} ${toCur}` : ''}
                    </div>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: C.mutedDark }}>
                      {fromAmt ? `${formatAmount(fromAmt, fromCur)} ${fromCur}` : ''}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
