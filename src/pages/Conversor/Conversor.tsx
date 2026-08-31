import { useState } from 'react'

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

const fieldStyle: React.CSSProperties = {
  width: '100%', padding: '12px 14px', boxSizing: 'border-box',
  background: '#0f0d0b', border: `1px solid rgba(232,196,104,0.14)`, borderRadius: 10,
  color: '#f6efdf', fontFamily: 'Inter, sans-serif', fontSize: 14, outline: 'none',
}
const labelStyle: React.CSSProperties = {
  fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
  textTransform: 'uppercase' as const, letterSpacing: 3, color: '#9a927f',
  display: 'block', marginBottom: 6,
}

export default function Conversor() {
  const [from, setFrom] = useState('USD')
  const [to, setTo]     = useState('ARS')
  const [amount, setAmount] = useState('100')

  const rate   = getRate(from, to)
  const result = amount ? (parseFloat(amount.replace(',', '.')) * rate).toFixed(to === 'BTC' ? 8 : 2) : '0.00'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 460 }}>
      <div>
        <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 24, color: C.text, margin: 0 }}>Conversor rápido</h2>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: C.muted, marginTop: 4 }}>Consultá tipos de cambio sin operar</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: C.radius, padding: 24 }}>
        <div>
          <label style={labelStyle}>Moneda origen</label>
          <select value={from} onChange={e => setFrom(e.target.value)} style={fieldStyle}>
            {CURRENCIES.filter(c => c !== to).map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Moneda destino</label>
          <select value={to} onChange={e => setTo(e.target.value)} style={fieldStyle}>
            {CURRENCIES.filter(c => c !== from).map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Monto</label>
          <input type="number" placeholder="100" value={amount} onChange={e => setAmount(e.target.value)} style={fieldStyle} />
        </div>

        {/* Resultado */}
        <div style={{ textAlign: 'center', padding: '24px 16px', background: '#0f0d0b', border: '1px solid rgba(242,212,136,0.2)', borderRadius: 14 }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, textTransform: 'uppercase', letterSpacing: 4, color: C.muted, margin: '0 0 8px' }}>Resultado</p>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: 40, color: C.gold, lineHeight: 1 }}>{result}</div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 14, color: C.goldMid, marginTop: 4 }}>{to}</div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: C.mutedDark, marginTop: 10 }}>
            1 {to} = {(1 / rate).toFixed(6)} {from}
          </div>
        </div>

        {/* Disclaimer */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '12px 14px', background: 'rgba(242,212,136,0.05)', border: '1px solid rgba(242,212,136,0.1)', borderRadius: 12 }}>
          <span style={{ color: C.gold, flexShrink: 0 }}>ℹ</span>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: C.muted }}>
            Esta conversión es informativa y <strong style={{ color: C.text }}>no modifica tu saldo</strong>.
          </span>
        </div>
      </div>
    </div>
  )
}
