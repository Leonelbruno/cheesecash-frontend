import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'

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

const BALANCES = [
  { code: 'ARS', name: 'Peso Argentino',       flag: '🇦🇷', amount: '8.250,00',  variation: '+1.2%', pos: true },
  { code: 'USD', name: 'Dólar Estadounidense',  flag: '🇺🇸', amount: '2.340,50', variation: '+0.3%', pos: true },
  { code: 'EUR', name: 'Euro',                  flag: '🇪🇺', amount: '1.860,75', variation: '-0.8%', pos: false },
  { code: 'BTC', name: 'Bitcoin',               flag: '₿',   amount: '0.00412',  variation: '+3.5%', pos: true },
]

const QUICK_ACTIONS = [
  { label: 'Comprar',      emoji: '💰', to: '/operar' },
  { label: 'Vender',       emoji: '📤', to: '/operar' },
  { label: 'Intercambiar', emoji: '🔄', to: '/operar' },
  { label: 'Conversor',    emoji: '🔢', to: '/conversor' },
  { label: 'Transferir',   emoji: '📲', to: '/transferir' },
]

const MOCK_TXS = [
  { id: '1', type: 'compra',       from: 'ARS', to: 'USD', amount: '$5.000',    result: '+12,45 USD', date: 'hoy 14:32',   rate: '' },
  { id: '2', type: 'transferencia',from: '',    to: '',    amount: '$2.000 ARS', result: '-$2.000',    date: 'ayer 09:15',  rate: 'a @mateo.rdz' },
  { id: '3', type: 'intercambio',  from: 'USD', to: 'EUR', amount: '$100 USD',  result: '+92,10 EUR', date: '28/08 18:00', rate: '' },
]

const TX_COLORS: Record<string, string> = {
  compra:        'rgba(74,222,128,0.12)',
  venta:         'rgba(226,112,95,0.12)',
  intercambio:   'rgba(242,212,136,0.12)',
  transferencia: 'rgba(154,146,127,0.12)',
}
const TX_TEXT: Record<string, string> = {
  compra:        '#4ade80',
  venta:         '#e2705f',
  intercambio:   '#f2d488',
  transferencia: '#9a927f',
}
const TX_LABEL: Record<string, string> = {
  compra:        'Compra',
  venta:         'Venta',
  intercambio:   'Intercambio',
  transferencia: 'Transferencia',
}
const TX_EMOJI: Record<string, string> = {
  compra:        '💰',
  venta:         '📤',
  intercambio:   '🔄',
  transferencia: '📲',
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const firstName = user?.fullName?.split(' ')[0] ?? 'Usuario'
  const initials = user?.fullName
    ? user.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 680, padding: '8px 0' }}>

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
          Saldo total (USD equiv.)
        </p>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: 42, color: C.gold, letterSpacing: -1 }}>
          $ 12.450,00
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
          <span style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 600,
            padding: '2px 8px', borderRadius: 6,
            background: 'rgba(74,222,128,0.12)', color: C.green,
          }}>+2.4% hoy</span>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: C.mutedDark }}>
            Actualizado hace 2 min
          </span>
        </div>
      </div>

      {/* Currency cards */}
      <div>
        <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, textTransform: 'uppercase', letterSpacing: 4, color: C.muted, marginBottom: 12 }}>
          Mis monedas
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {BALANCES.map(b => (
            <div key={b.code} style={{
              background: C.card, border: `1px solid ${C.cardBorder}`,
              borderRadius: 14, padding: 16,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 20 }}>{b.flag}</span>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 600, color: C.muted }}>{b.code}</span>
                </div>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 600, color: b.pos ? C.green : C.error }}>
                  {b.variation}
                </span>
              </div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: 18, color: C.text }}>{b.amount}</div>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, marginTop: 2, color: C.mutedDark }}>{b.name}</div>
            </div>
          ))}
        </div>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {MOCK_TXS.map(t => (
            <div key={t.id} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '14px 16px',
              background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 14,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, background: '#1a1510', flexShrink: 0,
              }}>
                {TX_EMOJI[t.type]}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{
                  fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 600,
                  padding: '2px 8px', borderRadius: 6,
                  background: TX_COLORS[t.type], color: TX_TEXT[t.type],
                }}>
                  {TX_LABEL[t.type]}
                </span>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, marginTop: 4, color: C.mutedDark }}>
                  {t.type === 'transferencia' ? `${t.rate} · ${t.date}` : `${t.from} → ${t.to} · ${t.date}`}
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 600, color: C.text }}>{t.result}</div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: C.mutedDark }}>{t.amount}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
