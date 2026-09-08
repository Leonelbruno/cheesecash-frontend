import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import CheeseCashLogo from '../../components/CheeseCashLogo/CheeseCashLogo'
import { api } from '../../services/api'
import './Landing.css'

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

const FAQ_ITEMS = [
  { q: '¿Qué monedas puedo usar?', a: 'Cheese Cash soporta cuatro monedas: Peso Argentino (ARS), Dólar Estadounidense (USD), Euro (EUR) y Bitcoin (BTC). Podés operar entre todas ellas al instante.' },
  { q: '¿Las transferencias tienen costo?', a: 'No. Las transferencias entre usuarios de Cheese Cash son completamente gratuitas y se acreditan en segundos.' },
  { q: '¿Cómo recargo mi billetera?', a: 'Desde la sección "Recargar" dentro de la app podés agregar saldo a cualquiera de tus billeteras de forma rápida y sencilla.' },
  { q: '¿Mis datos están seguros?', a: 'Sí. Usamos autenticación con JWT y todas las conexiones están cifradas. Tu información nunca se comparte con terceros.' },
  { q: '¿El conversor modifica mi saldo?', a: 'No. El conversor de la landing y el de la app son herramientas informativas con tasas reales. No afectan tu saldo hasta que confirmás una operación.' },
  { q: '¿Necesito verificar mi identidad?', a: 'No. Solo necesitás un email y una contraseña para registrarte y empezar a operar de inmediato.' },
]

const NAV_LINKS = [
  { label: 'Inicio', href: '#inicio' },
  { label: 'Cotizaciones', href: '#cotizaciones' },
  { label: 'Conversor', href: '#conversor' },
  { label: 'Características', href: '#features' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Contacto', href: '#contacto' },
]

function FaqItem({ q, a, n }: { q: string; a: string; n: string }) {
  const [open, setOpen] = useState(false)
  return (
    <button
      onClick={() => setOpen(v => !v)}
      style={{
        display: 'flex', gap: 20, alignItems: 'flex-start', width: '100%',
        background: open ? 'rgba(242,212,136,0.04)' : 'transparent',
        border: `1px solid ${open ? 'rgba(242,212,136,0.2)' : 'rgba(232,196,104,0.08)'}`,
        borderRadius: 16, padding: '20px 24px', cursor: 'pointer',
        textAlign: 'left', transition: 'all 0.2s',
      }}
    >
      <span style={{
        fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 700,
        color: open ? '#f2d488' : '#5c584c', flexShrink: 0, marginTop: 2,
        letterSpacing: 1, transition: 'color 0.2s',
      }}>{n}</span>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 14, color: '#f6efdf' }}>{q}</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={open ? '#f2d488' : '#5c584c'}
            strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, transition: 'transform 0.2s, stroke 0.2s', transform: open ? 'rotate(180deg)' : 'none' }}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
        {open && (
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#9a927f', lineHeight: 1.75, margin: '12px 0 0' }}>
            {a}
          </p>
        )}
      </div>
    </button>
  )
}

interface RateResponse {
  from: string
  to: string
  rate: number
}

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
  if (currency === 'BTC') {
    return value.toLocaleString('es-AR', {
      minimumFractionDigits: 8,
      maximumFractionDigits: 8,
    })
  }

  const decimals =
    Math.abs(value) > 0 && Math.abs(value) < 0.01 ? 6 : 2

  return value.toLocaleString('es-AR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
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
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: C.muted, letterSpacing: 1 }}>Cotizar en</span>
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
function ConversorSection() {
  const [from, setFrom] = useState('USD')
  const [to, setTo] = useState('ARS')
  const [amount, setAmount] = useState('100')

  const [rate, setRate] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    const fetchRate = async () => {
      try {
        setLoading(true)
        setError('')

        const data = await api.get<RateResponse>(
          `/rates?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
        )

        if (!cancelled) {
          setRate(data.rate)
        }
      } catch {
        if (!cancelled) {
          setRate(null)
          setError('No se pudo obtener la cotización')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchRate()

    return () => {
      cancelled = true
    }
  }, [from, to])

  const numericAmount = parseFloat(amount.replace(',', '.'))

  const result =
    rate !== null && Number.isFinite(numericAmount)
      ? numericAmount * rate
      : null

  const swapCurrencies = () => {
    setFrom(to)
    setTo(from)
  }

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
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          gap: 12,
          alignItems: 'end',
        }}
      >
        <div>
          <label style={labelStyle}>De</label>
          <select
            value={from}
            onChange={e => setFrom(e.target.value)}
            style={fieldStyle}
          >
            {CURRENCIES
              .filter(c => c !== to)
              .map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
          </select>
        </div>

        <button
          type="button"
          onClick={swapCurrencies}
          aria-label="Invertir monedas"
          title="Invertir monedas"
          style={{
            width: 42,
            height: 42,
            borderRadius: '50%',
            border: `1px solid ${C.cardBorder}`,
            background: '#0f0d0b',
            color: C.gold,
            fontSize: 20,
            cursor: 'pointer',
          }}
        >
          ⇄
        </button>

        <div>
          <label style={labelStyle}>A</label>
          <select
            value={to}
            onChange={e => setTo(e.target.value)}
            style={fieldStyle}
          >
            {CURRENCIES
              .filter(c => c !== from)
              .map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
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
        {loading ? (
          <div
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 13,
              color: C.muted,
            }}
          >
            Cargando cotización...
          </div>
        ) : error ? (
          <div
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 13,
              color: C.muted,
            }}
          >
            {error}
          </div>
        ) : (
          <>
            <div style={{
              fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: 'clamp(22px, 7vw, 36px)',
              maxWidth: '100%',
              overflowWrap: 'anywhere', color: C.gold, lineHeight: 1
            }}>
              {result !== null ? formatResult(result, to) : '—'}
            </div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: C.goldMid, marginTop: 4 }}>{to}</div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: C.mutedDark, marginTop: 8 }}>
              1 {from} = {rate !== null ? formatResult(rate, to) : '—'} {to}
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
    // Usamos el mismo endpoint por par que el conversor para garantizar consistencia
    Promise.all([
      api.get<{ rate: number }>('/rates?from=USD&to=ARS').then(r => ['ARS', r.rate] as const),
      api.get<{ rate: number }>('/rates?from=USD&to=EUR').then(r => ['EUR', r.rate] as const),
      api.get<{ rate: number }>('/rates?from=USD&to=BTC').then(r => ['BTC', r.rate] as const),
    ])
      .then(pairs => {
        const map: Record<string, number> = { USD: 1 }
        for (const [cur, rate] of pairs) map[cur] = rate
        setRates(map)
      })
      .catch(() => {/* silencioso */ })
  }, [])

  return (
    <div className="landing">

      {/* ── Navbar ── */}
      <nav className="landing-nav">
        <div className="landing-nav-logo">
          <CheeseCashLogo size={28} withName />
        </div>
        <div className="landing-nav-links">
          {NAV_LINKS.map(l => (
            <a key={l.href} href={l.href} className="landing-nav-link">{l.label}</a>
          ))}
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
      <section id="inicio" className="landing-hero">
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
      <section id="cotizaciones" style={{ padding: '80px 48px', maxWidth: 1100, margin: '0 auto' }}>
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
      <section id="conversor" style={{ padding: '0 48px 80px', maxWidth: 580, margin: '0 auto' }}>
        <p className="section-label">Probalo ahora</p>
        <h2 className="section-title" style={{ marginBottom: 32 }}>Conversor con tasas reales</h2>
        <ConversorSection />
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

      {/* ── Gráfico de precios ── */}
      {/* TODO: reemplazar el contenido de esta sección con el componente de Gonza */}
      <section style={{ padding: '0 48px 80px', maxWidth: 1100, margin: '0 auto' }}>
        <p className="section-label">Evolución del mercado</p>
        <h2 className="section-title" style={{ marginBottom: 32 }}>Seguí el precio en tiempo real</h2>
        <div style={{
          background: '#141210', border: '1px solid rgba(232,196,104,0.14)', borderRadius: 20,
          minHeight: 260, display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', gap: 12,
        }}>
          {/* Gonza: insertá acá el componente del gráfico */}
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" stroke="#f2d488" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#9a927f' }}>
            Gráfico en construcción
          </span>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="landing-features">
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

      {/* ── FAQ ── */}
      <section id="faq" style={{ padding: '80px 48px', maxWidth: 800, margin: '0 auto' }}>
        <p className="section-label">FAQ</p>
        <h2 className="section-title" style={{ marginBottom: 8 }}>Lo que más nos preguntan</h2>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, color: '#9a927f', marginBottom: 40 }}>
          Si tu duda no está acá, escribinos directo.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {FAQ_ITEMS.map((item, i) => (
            <FaqItem key={item.q} q={item.q} a={item.a} n={String(i + 1).padStart(2, '0')} />
          ))}
        </div>
      </section>

      {/* ── Contacto ── */}
      <section id="contacto" style={{ padding: '0 48px 80px', maxWidth: 800, margin: '0 auto' }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 32, flexWrap: 'wrap',
          background: '#141210', border: '1px solid rgba(232,196,104,0.14)',
          borderRadius: 20, padding: '36px 40px',
        }}>
          <div>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: 3, color: '#d9a942', textTransform: 'uppercase', margin: '0 0 10px' }}>Soporte</p>
            <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 20, color: '#f6efdf', margin: '0 0 8px' }}>¿Quedó alguna duda?</h3>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#9a927f', margin: 0 }}>
              Escribinos y te respondemos a la brevedad.
            </p>
          </div>
          <a
            href="mailto:cheesecash.team@gmail.com"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 10, flexShrink: 0,
              padding: '13px 28px', borderRadius: 12,
              background: 'linear-gradient(135deg, #f2d488, #d9a942)',
              color: '#161311', fontFamily: 'Inter, sans-serif',
              fontWeight: 700, fontSize: 14, textDecoration: 'none',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
            </svg>
            cheesecash.team@gmail.com
          </a>
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
