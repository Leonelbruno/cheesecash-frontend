import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import CheeseCashLogo from '../../components/CheeseCashLogo/CheeseCashLogo'
import './Landing.css'

const API = 'https://cheesecash-back-production.up.railway.app/api'

const C = {
  gold: '#f2d488', goldMid: '#d9a942',
  text: '#f6efdf', muted: '#9a927f', mutedDark: '#5c584c',
  card: '#141210', cardBorder: 'rgba(232,196,104,0.14)',
}

/* ── Moneda base en USD según getAllRates (que devuelve tasas relativas a USD) ── */
const CURRENCY_INFO: Record<string, { flagUrl: string; name: string; decimals: number }> = {
  USD: { flagUrl: 'https://flagcdn.com/w40/us.png', name: 'Dólar', decimals: 2 },
  ARS: { flagUrl: 'https://flagcdn.com/w40/ar.png', name: 'Peso AR', decimals: 0 },
  EUR: { flagUrl: 'https://flagcdn.com/w40/eu.png', name: 'Euro', decimals: 2 },
  BTC: { flagUrl: '', name: 'Bitcoin', decimals: 6 },
}

function CurrencyIcon({ code, size = 18 }: { code: string; size?: number }) {
  const info = CURRENCY_INFO[code]
  if (code === 'BTC') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="#f2d488">
        <path d="M17.06 11.57c.47-.93.44-2.17-.27-2.93-.52-.57-1.28-.87-2.18-.97V6h-1.5v1.57H12V6h-1.5v1.57H8v1.5h1.25c.41 0 .75.34.75.75v4.36c0 .41-.34.75-.75.75H8v1.5h2.5V18H12v-1.57h1.11V18h1.5v-1.62c1.03-.13 1.88-.52 2.36-1.18.52-.72.57-1.67.09-2.63zM11 9.57h2c.83 0 1.5.57 1.5 1.27s-.67 1.27-1.5 1.27H11V9.57zm2.25 6H11v-2.7h2.25c.97 0 1.75.6 1.75 1.35s-.78 1.35-1.75 1.35z" />
      </svg>
    )
  }
  return <img src={info.flagUrl} alt={code} width={size * 1.4} height={size} style={{ objectFit: 'cover', borderRadius: 2 }} />
}

const CURRENCIES = ['ARS', 'USD', 'EUR', 'BTC']



const FEATURES = [
  {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f2d488" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 014-4h14" /><polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 01-4 4H3" /></svg>,
    title: 'Cambio multimoneda',
    desc: 'Operá con ARS, USD, EUR y BTC al instante.',
  },
  {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f2d488" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>,
    title: 'Transferencias instantáneas',
    desc: 'Enviá dinero a contactos en segundos, sin comisiones ocultas.',
  },
  {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f2d488" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" /></svg>,
    title: 'Seguro y confiable',
    desc: 'Protegido con JWT y conexiones cifradas.',
  },
  {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f2d488" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
    title: 'Historial completo',
    desc: 'Filtrá por tipo: compras, ventas, intercambios y transferencias.',
  },
  {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f2d488" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="8" width="18" height="12" rx="3" /><path d="M12 8V4" /><circle cx="12" cy="4" r="1.5" fill="#f2d488" stroke="none" /><circle cx="8.5" cy="14" r="1" fill="#f2d488" stroke="none" /><circle cx="15.5" cy="14" r="1" fill="#f2d488" stroke="none" /><path d="M9 18h6" /></svg>,
    title: 'Asistente con IA',
    desc: 'Chatbot disponible en todo momento para dudas sobre la plataforma.',
  },
  {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f2d488" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="3" /><line x1="12" y1="18" x2="12" y2="18" strokeWidth="2.5" strokeLinecap="round" /></svg>,
    title: 'Diseñado para mobile',
    desc: 'Navegación optimizada con barra inferior, igual que las apps que ya usás.',
  },
]

const STEPS = [
  { n: '01', title: 'Creá tu cuenta', desc: 'Registrate en segundos con tu email. Sin verificaciones tediosas.' },
  { n: '02', title: 'Cargá tu billetera', desc: 'Seleccioná las monedas que querés tener y empezá a operar.' },
  { n: '03', title: 'Operá libremente', desc: 'Comprá, vendé, intercambiá y transferí desde cualquier dispositivo.' },
]

/* ── Helpers ── */
function getRate(rates: Record<string, number>, from: string, to: string): number {
  if (from === to) return 1
  // rates está en formato "cuántas unidades de X por 1 USD"
  // para ir de from a to: (1/rates[from]) * rates[to]
  const fromUsd = from === 'USD' ? 1 : rates[from]
  const toUsd = to === 'USD' ? 1 : rates[to]
  if (!fromUsd || !toUsd) return 1
  return toUsd / fromUsd
}

function formatResult(value: number, currency: string): string {
  if (currency === 'BTC') return value.toFixed(8)
  if (currency === 'ARS') return value.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  if (value < 0.01) return value.toFixed(6)
  return value.toFixed(2)
}

/* ── Sección de cotizaciones ── */
function RatesSection({ rates }: { rates: Record<string, number> | null }) {
  const [base, setBase] = useState('USD')

  const fieldStyle: React.CSSProperties = {
    background: C.card, border: `1px solid ${C.cardBorder}`,
    borderRadius: 14, padding: '20px 24px', flex: 1, minWidth: 160, textAlign: 'center' as const,
  }

  if (!rates) {
    return (
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        {CURRENCIES.map(c => (
          <div key={c} style={{ ...fieldStyle, opacity: 0.4 }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: C.muted, marginBottom: 8 }}>{c}</div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: 22, color: C.gold }}>—</div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Selector de moneda base */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'flex-end' }}>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: C.muted }}>Ver en</span>
        {CURRENCIES.map(c => (
          <button key={c} onClick={() => setBase(c)} style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '5px 12px', borderRadius: 8, cursor: 'pointer',
            border: `1px solid ${base === c ? C.goldMid : C.cardBorder}`,
            background: base === c ? `linear-gradient(135deg, ${C.gold}, ${C.goldMid})` : 'transparent',
            color: base === c ? '#161311' : C.muted,
            fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, fontSize: 12,
            transition: 'all 0.15s',
          }}>
            <CurrencyIcon code={c} size={14} /> {c}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        {CURRENCIES.filter(c => c !== base).map(c => {
          // Si la base es BTC, mostramos cuánto vale 1 BTC en cada moneda (más legible)
          const isBtcBase = base === 'BTC'
          const rate = isBtcBase ? getRate(rates, base, c) : getRate(rates, c, base)
          const display = isBtcBase ? formatResult(rate, c) : formatResult(rate, base)
          const label = isBtcBase ? `1 BTC en ${c}` : `1 ${c} en ${base}`

          return (
            <div key={c} style={fieldStyle}>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: C.muted, marginBottom: 8 }}>
                {c}
              </div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: 20, color: C.gold, lineHeight: 1.2 }}>
                {display}
              </div>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: C.mutedDark, marginTop: 4 }}>
                {label}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── Conversor en la landing ── */
function ConversorSection({ rates }: { rates: Record<string, number> | null }) {
  const [from, setFrom] = useState('USD')
  const [to, setTo] = useState('ARS')
  const [amount, setAmount] = useState('100')

  const rate = rates ? getRate(rates, from, to) : 0
  const result = rates && amount ? (parseFloat(amount.replace(',', '.')) * rate) : null

  const fieldStyle: React.CSSProperties = {
    width: '100%', padding: '11px 14px', boxSizing: 'border-box' as const,
    background: '#0f0d0b', border: `1px solid ${C.cardBorder}`, borderRadius: 10,
    color: C.text, fontFamily: 'Inter, sans-serif', fontSize: 14, outline: 'none',
  }
  const labelStyle: React.CSSProperties = {
    fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
    textTransform: 'uppercase' as const, letterSpacing: 3, color: C.muted,
    display: 'block', marginBottom: 6,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 18, padding: 28 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={labelStyle}>De</label>
          <select value={from} onChange={e => setFrom(e.target.value)} style={fieldStyle}>
            {CURRENCIES.filter(c => c !== to).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>A</label>
          <select value={to} onChange={e => setTo(e.target.value)} style={fieldStyle}>
            {CURRENCIES.filter(c => c !== from).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label style={labelStyle}>Monto</label>
        <input
          type="number" placeholder="100" value={amount}
          onChange={e => setAmount(e.target.value)}
          style={fieldStyle}
        />
      </div>
      <div style={{ textAlign: 'center', padding: '20px 16px', background: '#0f0d0b', border: '1px solid rgba(242,212,136,0.2)', borderRadius: 14 }}>
        <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, textTransform: 'uppercase', letterSpacing: 4, color: C.muted, margin: '0 0 8px' }}>Resultado</p>
        {!rates ? (
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: C.muted }}>Cargando tasas...</div>
        ) : (
          <>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: 36, color: C.gold, lineHeight: 1 }}>
              {result !== null ? formatResult(result, to) : '—'}
            </div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: C.goldMid, marginTop: 4 }}>{to}</div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: C.mutedDark, marginTop: 8 }}>
              1 {from} = {formatResult(rate, to)} {to}
            </div>
          </>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '10px 14px', background: 'rgba(242,212,136,0.05)', border: '1px solid rgba(242,212,136,0.1)', borderRadius: 12 }}>
        <span style={{ color: C.gold, flexShrink: 0 }}>ℹ</span>
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: C.muted }}>
          Conversión informativa con tasas reales. <strong style={{ color: C.text }}>No modifica tu saldo.</strong>
        </span>
      </div>
    </div>
  )
}

/* ── Componente principal ── */
export default function Landing() {
  const navigate = useNavigate()
  const [rates, setRates] = useState<Record<string, number> | null>(null)

  useEffect(() => {
    fetch(`${API}/rates`)
      .then(r => r.json())
      .then(data => setRates(data))
      .catch(() => {/* silencioso, fallback a null */ })
  }, [])

  return (
    <div className="landing">

      {/* ── Navbar ── */}
      <nav className="landing-nav">
        <div className="landing-nav-logo">
          <CheeseCashLogo size={28} withName />
        </div>
        <div className="landing-nav-actions">
          <a className="btn-outline" onClick={() => navigate('/login')} style={{ cursor: 'pointer' }}>
            Iniciar sesión
          </a>
          <a className="btn-gold" onClick={() => navigate('/register')} style={{ cursor: 'pointer' }}>
            Registrarse
          </a>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="landing-hero">
        <div className="hero-glow" />
        <div className="hero-coin">
          <CheeseCashLogo size={100} />
        </div>
        <div className="hero-badge">✦ Billetera digital multimoneda</div>
        <h1 className="hero-title">
          Tu dinero en <span>todas las monedas</span> que necesitás
        </h1>
        <p className="hero-subtitle">
          Cheese Cash te permite operar con pesos, dólares, euros y bitcoin — desde un solo lugar, en tiempo real.
        </p>
        <div className="hero-ctas">
          <a className="btn-gold-lg" onClick={() => navigate('/register')} style={{ cursor: 'pointer' }}>
            Empezar gratis →
          </a>
          <a className="btn-outline-lg" onClick={() => navigate('/login')} style={{ cursor: 'pointer' }}>
            Ya tengo cuenta
          </a>
        </div>
      </section>

      {/* ── Stats ── */}
      <div className="landing-stats">
        {[
          { n: '4', l: 'Monedas soportadas' },
          { n: '100%', l: 'Gratis para usar' },
          { n: '24/7', l: 'Disponibilidad' },
          { n: '<1s', l: 'Tiempo de operación' },
        ].map(s => (
          <div key={s.l} className="stat-item">
            <div className="stat-number">{s.n}</div>
            <div className="stat-label">{s.l}</div>
          </div>
        ))}
      </div>

      {/* ── Cotizaciones en tiempo real ── */}
      <section style={{ padding: '80px 48px', maxWidth: 1100, margin: '0 auto' }}>
        <p className="section-label">Cotizaciones en vivo</p>
        <h2 className="section-title">Precios reales, ahora mismo</h2>
        <RatesSection rates={rates} />
        {rates && (
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: C.mutedDark, textAlign: 'center', marginTop: 16 }}>
            Tasas actualizadas automáticamente · Fuente: ExchangeRate-API + CoinGecko
          </p>
        )}
      </section>

      {/* ── Conversor ── */}
      <section style={{ padding: '0 48px 80px', maxWidth: 580, margin: '0 auto' }}>
        <p className="section-label">Probalo ahora</p>
        <h2 className="section-title" style={{ marginBottom: 32 }}>Conversor con tasas reales</h2>
        <ConversorSection rates={rates} />
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <a
            className="btn-outline-lg"
            onClick={() => navigate('/register')}
            style={{ cursor: 'pointer', fontSize: 14, padding: '10px 24px' }}
          >
            Registrate para operar →
          </a>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="landing-features">
        <p className="section-label">¿Qué podés hacer?</p>
        <h2 className="section-title">Todo lo que necesitás en un solo lugar</h2>
        <div className="features-grid">
          {FEATURES.map(f => (
            <div key={f.title} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Cómo funciona ── */}
      <section className="landing-how">
        <p className="section-label">¿Cómo funciona?</p>
        <h2 className="section-title">En tres pasos simples</h2>
        <div className="steps">
          {STEPS.map(s => (
            <div key={s.n} className="step">
              <div className="step-number">{s.n}</div>
              <div className="step-title">{s.title}</div>
              <div className="step-desc">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="landing-cta">
        <h2 className="cta-title">¿Listo para empezar?</h2>
        <p className="cta-sub">Creá tu cuenta gratis y empezá a operar en menos de un minuto.</p>
        <a className="btn-gold-lg" onClick={() => navigate('/register')} style={{ cursor: 'pointer' }}>
          Crear cuenta gratis →
        </a>
      </section>

      {/* ── Footer ── */}
      <footer className="landing-footer">
        <span>© 2026 Cheese Cash — Proyecto Final Full Stack</span>
        <span>Hecho con 🧀 por el equipo</span>
      </footer>

    </div>
  )
}
