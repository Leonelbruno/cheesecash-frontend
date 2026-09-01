import React from 'react'
import { useNavigate } from 'react-router-dom'
import './Landing.css'

function CheeseCoin({ size = 90 }: { size?: number }) {
  const id = `lc-${size}`
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className="hero-coin">
      <defs>
        <radialGradient id={`rg-${id}`} cx="38%" cy="35%" r="65%">
          <stop offset="0%"   stopColor="#fbeec0" />
          <stop offset="55%"  stopColor="#e9bf62" />
          <stop offset="100%" stopColor="#c4922f" />
        </radialGradient>
        <linearGradient id={`lg-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#8a6416" />
          <stop offset="50%"  stopColor="#f0cd7a" />
          <stop offset="100%" stopColor="#8a6416" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill={`url(#lg-${id})`} />
      <circle cx="50" cy="50" r="44" fill={`url(#rg-${id})`} />
      <ellipse cx="38" cy="42" rx="7"   ry="6"   fill="#8a6010" opacity="0.55" />
      <ellipse cx="62" cy="38" rx="5"   ry="5.5" fill="#8a6010" opacity="0.5"  />
      <ellipse cx="55" cy="62" rx="6.5" ry="5.5" fill="#8a6010" opacity="0.52" />
      <ellipse cx="30" cy="62" rx="5"   ry="4.5" fill="#8a6010" opacity="0.48" />
      <ellipse cx="70" cy="56" rx="4.5" ry="5"   fill="#8a6010" opacity="0.45" />
    </svg>
  )
}

function NavCoin() {
  const id = 'nav-coin'
  return (
    <svg width="28" height="28" viewBox="0 0 100 100">
      <defs>
        <radialGradient id={`rg-${id}`} cx="38%" cy="35%" r="65%">
          <stop offset="0%"   stopColor="#fbeec0" />
          <stop offset="55%"  stopColor="#e9bf62" />
          <stop offset="100%" stopColor="#c4922f" />
        </radialGradient>
        <linearGradient id={`lg-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#8a6416" />
          <stop offset="50%"  stopColor="#f0cd7a" />
          <stop offset="100%" stopColor="#8a6416" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill={`url(#lg-${id})`} />
      <circle cx="50" cy="50" r="44" fill={`url(#rg-${id})`} />
      <ellipse cx="38" cy="42" rx="7"   ry="6"   fill="#8a6010" opacity="0.55" />
      <ellipse cx="62" cy="38" rx="5"   ry="5.5" fill="#8a6010" opacity="0.5"  />
      <ellipse cx="55" cy="62" rx="6.5" ry="5.5" fill="#8a6010" opacity="0.52" />
    </svg>
  )
}

/* ── Feature Icons ── */
function IconExchange() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f2d488" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="17 1 21 5 17 9"/>
      <path d="M3 11V9a4 4 0 014-4h14"/>
      <polyline points="7 23 3 19 7 15"/>
      <path d="M21 13v2a4 4 0 01-4 4H3"/>
    </svg>
  )
}
function IconSend() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f2d488" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"/>
      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  )
}
function IconShield() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f2d488" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      <polyline points="9 12 11 14 15 10"/>
    </svg>
  )
}
function IconClock() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f2d488" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  )
}
function IconBot() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f2d488" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="8" width="18" height="12" rx="3"/>
      <path d="M12 8V4"/>
      <circle cx="12" cy="4" r="1.5" fill="#f2d488" stroke="none"/>
      <circle cx="8.5" cy="14" r="1" fill="#f2d488" stroke="none"/>
      <circle cx="15.5" cy="14" r="1" fill="#f2d488" stroke="none"/>
      <path d="M9 18h6"/>
    </svg>
  )
}
function IconMobile() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f2d488" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="3"/>
      <line x1="12" y1="18" x2="12" y2="18" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  )
}

const FEATURES: { icon: React.ReactNode; title: string; desc: string }[] = [
  {
    icon: <IconExchange />,
    title: 'Cambio multimoneda',
    desc: 'Operá con ARS, USD, EUR y BTC al instante, con tasas actualizadas en tiempo real.',
  },
  {
    icon: <IconSend />,
    title: 'Transferencias instantáneas',
    desc: 'Enviá dinero a tus contactos dentro de la plataforma en segundos, sin comisiones ocultas.',
  },
  {
    icon: <IconShield />,
    title: 'Seguro y confiable',
    desc: 'Tu cuenta está protegida con JWT y conexiones cifradas. Tu plata, bajo tu control.',
  },
  {
    icon: <IconClock />,
    title: 'Historial completo',
    desc: 'Revisá cada movimiento con filtros por tipo: compras, ventas, intercambios y transferencias.',
  },
  {
    icon: <IconBot />,
    title: 'Asistente con IA',
    desc: 'Tenés un chatbot disponible en todo momento para ayudarte con dudas sobre la plataforma.',
  },
  {
    icon: <IconMobile />,
    title: 'Diseñado para mobile',
    desc: 'Navegación optimizada para el celular con barra inferior, igual que las apps que ya usás.',
  },
]

const STEPS = [
  {
    n: '01',
    title: 'Creá tu cuenta',
    desc: 'Registrate en segundos con tu email. Sin formularios largos, sin verificaciones tediosas.',
  },
  {
    n: '02',
    title: 'Cargá tu billetera',
    desc: 'Seleccioná las monedas que querés tener y empezá a operar con saldos de práctica.',
  },
  {
    n: '03',
    title: 'Operá libremente',
    desc: 'Comprá, vendé, intercambiá y transferí entre tus contactos desde cualquier dispositivo.',
  },
]

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="landing">

      {/* ── Navbar ── */}
      <nav className="landing-nav">
        <div className="landing-nav-logo">
          <NavCoin />
          <span className="landing-nav-wordmark">Cheese Cash</span>
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
        <CheeseCoin size={100} />
        <div className="hero-badge">
          ✦ Billetera digital multimoneda
        </div>
        <h1 className="hero-title">
          Tu dinero en <span>todas las monedas</span> que necesitás
        </h1>
        <p className="hero-subtitle">
          Cheese Cash te permite operar con pesos, dólares, euros, bitcoin y más — desde un solo lugar, en tiempo real.
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
          { n: '4',     l: 'Monedas soportadas' },
          { n: '100%',  l: 'Gratis para usar' },
          { n: '24/7',  l: 'Disponibilidad' },
          { n: '<1s',   l: 'Tiempo de operación' },
        ].map(s => (
          <div key={s.l} className="stat-item">
            <div className="stat-number">{s.n}</div>
            <div className="stat-label">{s.l}</div>
          </div>
        ))}
      </div>

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

      {/* ── CTA final ── */}
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
