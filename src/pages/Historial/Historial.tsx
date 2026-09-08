import { useState, useEffect } from 'react'
import { api } from '../../services/api'
import MovimientosList, { HistoryItem, TxDetail } from '../../components/MovimientosList/MovimientosList'

const C = {
  card: '#141210', cardBorder: 'rgba(232,196,104,0.14)',
  gold: '#f2d488', goldMid: '#d9a942',
  text: '#f6efdf', muted: '#9a927f',
}

const FILTERS = ['Todas', 'Compra', 'Venta', 'Intercambio', 'Transferencia', 'Recarga']

const TX_TYPE_NORM: Record<string, string> = {
  buy: 'compra', compra: 'compra',
  sell: 'venta', venta: 'venta',
  exchange: 'intercambio', intercambio: 'intercambio',
  transfer: 'transferencia', transferencia: 'transferencia',
}

export default function Historial() {
  const [active, setActive] = useState('Todas')
  const [items, setItems]   = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState('')

  useEffect(() => {
    Promise.all([
      api.get<HistoryItem[]>('/transfers/history'),
      api.get<TxDetail[]>('/deposits'),
    ])
      .then(([history, deposits]) => {
        const depositItems: HistoryItem[] = (Array.isArray(deposits) ? deposits : []).map(d => ({
          kind: 'deposit' as const,
          id: d.id,
          created_at: (d.created_at as string) ?? '',
          detail: d,
        }))
        const combined = [...(Array.isArray(history) ? history : []), ...depositItems]
        combined.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        setItems(combined)
      })
      .catch(() => setError('No se pudo cargar el historial. Intentá de nuevo más tarde.'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = items.filter(item => {
    if (active === 'Todas') return true
    if (item.kind === 'transfer') return active.toLowerCase() === 'transferencia'
    if (item.kind === 'deposit')  return active.toLowerCase() === 'recarga'
    const tipo = TX_TYPE_NORM[item.detail.type?.toLowerCase() ?? ''] ?? ''
    return tipo === active.toLowerCase()
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 680 }}>
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

      <MovimientosList
        items={filtered}
        loading={loading}
        error={error}
        emptyMessage={items.length === 0 ? 'Todavía no realizaste ninguna operación.' : 'Sin movimientos para este filtro.'}
      />
    </div>
  )
}
