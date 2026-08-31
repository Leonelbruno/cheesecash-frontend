import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const C = {
  card: '#141210', cardBorder: 'rgba(232,196,104,0.14)',
  gold: '#f2d488', goldMid: '#d9a942',
  text: '#f6efdf', muted: '#9a927f', mutedDark: '#5c584c',
  radius: '18px',
}

const CURRENCIES = ['ARS', 'USD', 'EUR', 'BTC', 'USDT', 'BRL']
const RATES: Record<string, Record<string, number>> = {
  ARS:  { USD: 0.00105, EUR: 0.00096, BTC: 0.000000207, USDT: 0.00105, BRL: 0.0063 },
  USD:  { ARS: 952,     EUR: 0.924,   BTC: 0.0000197,   USDT: 1.001,   BRL: 5.98 },
  EUR:  { ARS: 1174,    USD: 1.082,   BTC: 0.0000213,   USDT: 1.083,   BRL: 6.47 },
  BTC:  { ARS: 4820000, USD: 50800,   EUR: 46950,        USDT: 50850,   BRL: 303800 },
  USDT: { ARS: 951,     USD: 0.999,   EUR: 0.923,        BTC: 0.0000196, BRL: 5.97 },
  BRL:  { ARS: 159,     USD: 0.167,   EUR: 0.154,        BTC: 0.00000329, USDT: 0.167 },
}
const getRate = (f: string, t: string) => f === t ? 1 : (RATES[f]?.[t] ?? 1)

type Tab = 'comprar' | 'vender' | 'intercambiar'
const TABS: { id: Tab; label: string }[] = [
  { id: 'comprar',      label: 'Comprar' },
  { id: 'vender',       label: 'Vender' },
  { id: 'intercambiar', label: 'Intercambiar' },
]

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

export default function Operar() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('comprar')
  const [from, setFrom] = useState('ARS')
  const [to, setTo] = useState('USD')
  const [amount, setAmount] = useState('')
  const [confirmed, setConfirmed] = useState(false)

  const rate = getRate(from, to)
  const result = amount ? (parseFloat(amount.replace(',', '.')) * rate).toFixed(to === 'BTC' ? 8 : 2) : ''

  if (confirmed) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 24, maxWidth: 420, margin: '40px auto 0' }}>
        <div style={{ width: 96, height: 96, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(242,212,136,0.08)', border: '2px solid rgba(242,212,136,0.3)' }}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="22" stroke={C.gold} strokeWidth="2"/>
            <polyline points="14 24 21 31 34 18" stroke={C.gold} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 24, color: C.text, margin: 0 }}>¡Operación realizada!</h2>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: C.muted, marginTop: 6 }}>Tu transacción fue procesada con éxito</p>
        </div>
        <div style={{ width: '100%', background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: C.radius, padding: 24, textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            ['Tipo', tab === 'comprar' ? 'Compra' : tab === 'vender' ? 'Venta' : 'Intercambio'],
            ['Enviaste', `${amount} ${from}`],
            ['Recibiste', `${result} ${to}`],
            ['Tasa', `1 ${to} = ${(1 / rate).toFixed(4)} ${from}`],
          ].map(([label, val], i, arr) => (
            <div key={i}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, textTransform: 'uppercase', letterSpacing: 3, color: C.muted }}>{label}</span>
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
          <label style={labelStyle}>{tab === 'comprar' ? 'Comprás con' : tab === 'vender' ? 'Moneda a vender' : 'Origen'}</label>
          <select value={from} onChange={e => setFrom(e.target.value)} style={fieldStyle}>
            {CURRENCIES.filter(c => c !== to).map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>{tab === 'comprar' ? 'Recibís en' : 'Destino'}</label>
          <select value={to} onChange={e => setTo(e.target.value)} style={fieldStyle}>
            {CURRENCIES.filter(c => c !== from).map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Monto</label>
          <input type="number" placeholder={`0.00 ${from}`} value={amount} onChange={e => setAmount(e.target.value)} style={fieldStyle} />
        </div>

        {amount && result && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#0f0d0b', border: 'rgba(242,212,136,0.2) 1px solid', borderRadius: 12 }}>
            <div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, textTransform: 'uppercase', letterSpacing: 3, color: C.muted, marginBottom: 2 }}>Tasa</div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: C.goldMid }}>1 {to} = {(1 / rate).toFixed(4)} {from}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, textTransform: 'uppercase', letterSpacing: 3, color: C.muted, marginBottom: 2 }}>Recibís</div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: 20, color: C.gold }}>{result} {to}</div>
            </div>
          </div>
        )}

        <button
          onClick={() => setConfirmed(true)}
          disabled={!amount || parseFloat(amount) <= 0}
          style={{ padding: '14px 0', borderRadius: 12, border: 'none', background: !amount || parseFloat(amount) <= 0 ? 'rgba(242,212,136,0.2)' : `linear-gradient(135deg, ${C.gold}, ${C.goldMid})`, color: !amount || parseFloat(amount) <= 0 ? C.mutedDark : '#161311', fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 15, cursor: !amount || parseFloat(amount) <= 0 ? 'not-allowed' : 'pointer', transition: 'opacity 0.2s' }}>
          Confirmar operación
        </button>
      </div>
    </div>
  )
}
