import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const C = {
  card: '#141210', cardBorder: 'rgba(232,196,104,0.14)',
  gold: '#f2d488', goldMid: '#d9a942',
  text: '#f6efdf', muted: '#9a927f', mutedDark: '#5c584c',
  radius: '18px',
}

const CURRENCIES = ['ARS', 'USD', 'EUR', 'BTC', 'USDT', 'BRL']
const CONTACTS = [
  { id: 'c1', name: 'Valentina López',  alias: '@valen.lopez', avatar: 'V' },
  { id: 'c2', name: 'Mateo Rodríguez',  alias: '@mateo.rdz',   avatar: 'M' },
  { id: 'c3', name: 'Lucía Fernández',  alias: '@lucia.fer',   avatar: 'L' },
  { id: 'c4', name: 'Santiago Gómez',   alias: '@santi.go',    avatar: 'S' },
]

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

export default function Transferir() {
  const navigate = useNavigate()
  const [step, setStep]         = useState<'recipient' | 'amount' | 'done'>('recipient')
  const [selected, setSelected] = useState<typeof CONTACTS[0] | null>(null)
  const [currency, setCurrency] = useState('ARS')
  const [amount, setAmount]     = useState('')
  const [note, setNote]         = useState('')
  const [search, setSearch]     = useState('')

  const filtered = CONTACTS.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.alias.includes(search)
  )

  if (step === 'done') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 24, maxWidth: 420, margin: '40px auto 0' }}>
        <div style={{ width: 96, height: 96, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(242,212,136,0.08)', border: '2px solid rgba(242,212,136,0.3)' }}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="22" stroke={C.gold} strokeWidth="2"/>
            <polyline points="14 24 21 31 34 18" stroke={C.gold} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 24, color: C.text, margin: 0 }}>¡Transferencia enviada!</h2>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: C.muted, marginTop: 6 }}>Tu transferencia fue procesada con éxito</p>
        </div>
        <div style={{ width: '100%', background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: C.radius, padding: 24, textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            ['Destinatario', selected?.name ?? ''],
            ['Alias', selected?.alias ?? ''],
            ['Monto', `${amount} ${currency}`],
            ['Nota', note || '—'],
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {step === 'amount' && (
          <button onClick={() => setStep('recipient')} style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 10, color: C.muted, cursor: 'pointer', fontSize: 20, flexShrink: 0 }}>
            ‹
          </button>
        )}
        <div>
          <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 24, color: C.text, margin: 0 }}>Transferir</h2>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: C.muted, marginTop: 4 }}>
            {step === 'recipient' ? 'Elegí a quién enviarle' : `Enviando a ${selected?.name}`}
          </p>
        </div>
      </div>

      {step === 'recipient' && (
        <>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.mutedDark, fontSize: 16 }}>⌕</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre o alias..." style={{ ...fieldStyle, paddingLeft: 36 }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, textTransform: 'uppercase', letterSpacing: 4, color: C.muted, margin: 0 }}>Contactos frecuentes</p>
            {filtered.map(c => (
              <button key={c.id} onClick={() => { setSelected(c); setStep('amount') }} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 16px', background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 14, cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'transform 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(242,212,136,0.1)', border: '1px solid rgba(242,212,136,0.25)', color: C.gold, fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 16, flexShrink: 0 }}>
                  {c.avatar}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 14, color: C.text }}>{c.name}</div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: C.muted }}>{c.alias}</div>
                </div>
                <span style={{ color: C.mutedDark, fontSize: 20 }}>›</span>
              </button>
            ))}
          </div>
        </>
      )}

      {step === 'amount' && selected && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Recipient card */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px', background: C.card, border: '1px solid rgba(242,212,136,0.25)', borderRadius: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(242,212,136,0.1)', border: '1px solid rgba(242,212,136,0.25)', color: C.gold, fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 18, flexShrink: 0 }}>
              {selected.avatar}
            </div>
            <div>
              <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 14, color: C.text }}>{selected.name}</div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: C.muted }}>{selected.alias} · Cheese Cash</div>
            </div>
            <div style={{ marginLeft: 'auto', width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(135deg, ${C.gold}, ${C.goldMid})` }}>
              <span style={{ color: '#161311', fontSize: 10 }}>✓</span>
            </div>
          </div>

          {/* Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: C.radius, padding: 24 }}>
            <div>
              <label style={labelStyle}>Moneda</label>
              <select value={currency} onChange={e => setCurrency(e.target.value)} style={fieldStyle}>
                {CURRENCIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Monto</label>
              <input type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} style={fieldStyle} />
            </div>
            <div>
              <label style={labelStyle}>Nota (opcional)</label>
              <input type="text" placeholder="Ej: Para la cena del sábado" value={note} onChange={e => setNote(e.target.value)} style={fieldStyle} />
            </div>

            {amount && parseFloat(amount) > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#0f0d0b', border: '1px solid rgba(242,212,136,0.2)', borderRadius: 12 }}>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, textTransform: 'uppercase', letterSpacing: 3, color: C.muted }}>Recibirá</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: 20, color: C.gold }}>
                  {parseFloat(amount).toLocaleString('es-AR', { minimumFractionDigits: 2 })} {currency}
                </span>
              </div>
            )}

            <button
              onClick={() => setStep('done')}
              disabled={!amount || parseFloat(amount) <= 0}
              style={{ padding: '14px 0', borderRadius: 12, border: 'none', background: !amount || parseFloat(amount) <= 0 ? 'rgba(242,212,136,0.2)' : `linear-gradient(135deg, ${C.gold}, ${C.goldMid})`, color: !amount || parseFloat(amount) <= 0 ? C.mutedDark : '#161311', fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 15, cursor: !amount || parseFloat(amount) <= 0 ? 'not-allowed' : 'pointer' }}>
              Transferir ahora
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
