import { useState, useEffect } from 'react'
import { api } from '../../services/api'

const C = {
  card: '#141210', cardBorder: 'rgba(232,196,104,0.14)',
  gold: '#f2d488', goldMid: '#d9a942',
  text: '#f6efdf', muted: '#9a927f', mutedDark: '#5c584c',
  green: '#4ade80', error: '#e2705f',
}

interface TxDetail {
  id: string | number
  type?: string
  fromCurrency?: string; toCurrency?: string
  from_currency?: string; to_currency?: string
  fromAmount?: number; toAmount?: number
  from_amount?: number; to_amount?: number
  createdAt?: string; created_at?: string
  // campos de transferencia
  currency?: string
  amount?: string | number
  status?: string
  from_wallet_id?: number
  to_wallet_id?: number
}

interface HistoryItem {
  kind: 'transaction' | 'transfer'
  id: string | number
  created_at: string
  detail: TxDetail
}

const TX_TYPE_NORM: Record<string, string> = {
  buy: 'compra',        compra: 'compra',
  sell: 'venta',        venta: 'venta',
  exchange: 'intercambio', intercambio: 'intercambio',
  transfer: 'transferencia', transferencia: 'transferencia',
}

const TX_COLORS: Record<string, string> = {
  compra: 'rgba(74,222,128,0.12)', venta: 'rgba(226,112,95,0.12)',
  intercambio: 'rgba(242,212,136,0.12)', transferencia: 'rgba(154,146,127,0.12)',
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

const FILTERS = ['Todas', 'Compra', 'Venta', 'Intercambio', 'Transferencia']

function formatAmount(amount: number, currency: string): string {
  if (!amount) return ''
  if (currency === 'BTC') {
    return amount.toLocaleString('es-AR', { minimumFractionDigits: 5, maximumFractionDigits: 8 })
  }
  return amount.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
    + ' · ' + d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
}

function SkeletonRow() {
  return (
    <div style={{
      height: 72, background: C.card, border: `1px solid ${C.cardBorder}`,
      borderRadius: 14, animation: 'pulse 1.5s ease-in-out infinite',
    }} />
  )
}

export default function Historial() {
  const [active, setActive]       = useState('Todas')
  const [items, setItems]         = useState<HistoryItem[]>([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')

  useEffect(() => {
    api.get<HistoryItem[]>('/transfers/history')
      .then(res => setItems(Array.isArray(res) ? res : []))
      .catch(() => setError('No se pudo cargar el historial. Intentá de nuevo más tarde.'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = items.filter(item => {
    if (active === 'Todas') return true
    if (item.kind === 'transfer') return active.toLowerCase() === 'transferencia'
    const tipo = TX_TYPE_NORM[item.detail.type?.toLowerCase() ?? ''] ?? ''
    return tipo === active.toLowerCase()
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 680 }}>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>

      <div>
        <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 24, color: C.text, margin: 0 }}>Mis movimientos</h2>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: C.muted, marginTop: 4 }}>Historial completo de operaciones</p>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {FILTERS.map(f => (
          <button key={f} onClick={() => setActive(f)} style={{
            padding: '6px 16px', borderRadius: 20, cursor: 'pointer', transition: 'all 0.15s',
            border: `1px solid ${active === f ? C.goldMid : C.cardBorder}`,
            background: active === f ? `linear-gradient(135deg, ${C.gold}, ${C.goldMid})` : 'transparent',
            color: active === f ? '#161311' : C.muted,
            fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 13,
          }}>
            {f}
          </button>
        ))}
      </div>

      {/* Lista */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <SkeletonRow /><SkeletonRow /><SkeletonRow /><SkeletonRow />
        </div>
      ) : error ? (
        <div style={{
          padding: '24px 20px', borderRadius: 14,
          background: 'rgba(226,112,95,0.08)', border: `1px solid rgba(226,112,95,0.3)`,
          fontFamily: 'Inter, sans-serif', fontSize: 14, color: C.error,
        }}>
          {error}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(item => {
            const isTransfer = item.kind === 'transfer'
            const d = item.detail

            // Para transferencias
            const transferCur = d.currency ?? ''
            const transferAmt = typeof d.amount === 'string' ? parseFloat(d.amount) : (d.amount ?? 0)
            const transferStatus = d.status ?? ''

            // Para transacciones
            const rawType = d.type?.toLowerCase() ?? ''
            const tipo    = isTransfer ? 'transferencia' : (TX_TYPE_NORM[rawType] ?? rawType)
            const fromCur = d.fromCurrency ?? d.from_currency ?? ''
            const toCur   = d.toCurrency   ?? d.to_currency   ?? ''
            const toAmt   = d.toAmount     ?? d.to_amount     ?? 0
            const fromAmt = d.fromAmount   ?? d.from_amount   ?? 0

            const dateStr = formatDate(item.created_at)

            return (
              <div key={`${item.kind}-${String(item.id)}`} style={{
                display: 'flex', alignItems: 'center', gap: 16,
                padding: '16px 20px', background: C.card,
                border: `1px solid ${C.cardBorder}`, borderRadius: 14,
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, background: '#1a1510', flexShrink: 0,
                }}>
                  {TX_EMOJI[tipo] ?? '💱'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 600,
                      padding: '2px 8px', borderRadius: 6,
                      background: TX_COLORS[tipo] ?? 'rgba(154,146,127,0.12)',
                      color: TX_TEXT[tipo] ?? C.muted,
                    }}>
                      {TX_LABEL[tipo] ?? tipo}
                    </span>
                    {isTransfer && transferStatus === 'pending' && (
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: '#f2d488', background: 'rgba(242,212,136,0.1)', padding: '2px 6px', borderRadius: 4 }}>
                        Pendiente
                      </span>
                    )}
                    {isTransfer && transferStatus === 'failed' && (
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: C.error, background: 'rgba(226,112,95,0.1)', padding: '2px 6px', borderRadius: 4 }}>
                        Fallida
                      </span>
                    )}
                  </div>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, marginTop: 4, color: C.mutedDark }}>
                    {isTransfer ? transferCur : (fromCur && toCur ? `${fromCur} → ${toCur}` : tipo)}
                    {dateStr ? ` · ${dateStr}` : ''}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  {isTransfer ? (
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 600, color: C.text }}>
                      {formatAmount(transferAmt, transferCur)} {transferCur}
                    </div>
                  ) : (
                    <>
                      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 600, color: C.text }}>
                        {toAmt ? `${formatAmount(toAmt, toCur)} ${toCur}` : ''}
                      </div>
                      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: C.mutedDark }}>
                        {fromAmt ? `${formatAmount(fromAmt, fromCur)} ${fromCur}` : ''}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )
          })}
          {filtered.length === 0 && !loading && (
            <div style={{ padding: '64px 0', textAlign: 'center', fontFamily: 'Inter, sans-serif', fontSize: 14, color: C.mutedDark }}>
              {items.length === 0 ? 'Todavía no realizaste ninguna operación.' : 'Sin movimientos para este filtro.'}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
