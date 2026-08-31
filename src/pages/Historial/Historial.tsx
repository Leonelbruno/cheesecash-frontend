import { useState } from 'react'

const C = {
  card: '#141210', cardBorder: 'rgba(232,196,104,0.14)',
  gold: '#f2d488', goldMid: '#d9a942',
  text: '#f6efdf', muted: '#9a927f', mutedDark: '#5c584c',
  green: '#4ade80', error: '#e2705f',
}

const MOCK_TXS = [
  { id: 't1', type: 'compra',        from: 'ARS', to: 'USD', amount: '50.000 ARS', result: '52,50 USD',    rate: '1 USD = 952 ARS',      date: '26 ago 2026', time: '14:32' },
  { id: 't2', type: 'intercambio',   from: 'USD', to: 'EUR', amount: '100 USD',    result: '92,40 EUR',    rate: '1 EUR = 1.082 USD',     date: '25 ago 2026', time: '09:15' },
  { id: 't3', type: 'venta',         from: 'BTC', to: 'ARS', amount: '0.001 BTC',  result: '4.820 ARS',    rate: '1 BTC = 4.820.000 ARS', date: '24 ago 2026', time: '18:47' },
  { id: 't4', type: 'compra',        from: 'ARS', to: 'EUR', amount: '80.000 ARS', result: '68,15 EUR',    rate: '1 EUR = 1.174 ARS',     date: '23 ago 2026', time: '11:20' },
  { id: 't5', type: 'intercambio',   from: 'EUR', to: 'BTC', amount: '50 EUR',     result: '0.00105 BTC',  rate: '1 BTC = 47.619 EUR',    date: '22 ago 2026', time: '16:05' },
  { id: 't6', type: 'transferencia', from: 'ARS', to: 'ARS', amount: '5.000 ARS',  result: '5.000 ARS',    rate: 'A @valen.lopez',        date: '21 ago 2026', time: '10:00' },
]

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

const FILTERS = ['Todas', 'Compra', 'Venta', 'Intercambio', 'Transferencia']

export default function Historial() {
  const [active, setActive] = useState('Todas')

  const filtered = MOCK_TXS.filter(t =>
    active === 'Todas' || t.type === active.toLowerCase()
  )

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

      {/* Lista */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map(t => (
          <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, background: '#1a1510', flexShrink: 0 }}>
              {TX_EMOJI[t.type]}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 6, background: TX_COLORS[t.type], color: TX_TEXT[t.type] }}>
                {TX_LABEL[t.type]}
              </span>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, marginTop: 4, color: C.mutedDark }}>
                {t.type === 'transferencia' ? t.rate : `${t.from} → ${t.to}`} · {t.date} · {t.time}
              </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 600, color: C.text }}>{t.result}</div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: C.mutedDark }}>{t.amount}</div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ padding: '64px 0', textAlign: 'center', fontFamily: 'Inter, sans-serif', fontSize: 14, color: C.mutedDark }}>
            Sin movimientos para este filtro
          </div>
        )}
      </div>
    </div>
  )
}
