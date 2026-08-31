import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'
import Toast from '../../components/Toast/Toast'
import './AuthPage.css'

/* ── SVG gradients (shared trick: invisible svg con defs) ── */
function CoinDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }}>
      <defs>
        <radialGradient id="cheeseGrad" cx="34%" cy="28%" r="78%">
          <stop offset="0%" stopColor="#fbeec0" />
          <stop offset="55%" stopColor="#e9bf62" />
          <stop offset="100%" stopColor="#c4922f" />
        </radialGradient>
        <linearGradient id="rimGrad" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#8a6416" />
          <stop offset="50%" stopColor="#f0cd7a" />
          <stop offset="100%" stopColor="#8a6416" />
        </linearGradient>
        <radialGradient id="holeGrad" cx="35%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#a9702f" />
          <stop offset="100%" stopColor="#5e3a13" />
        </radialGradient>
      </defs>
    </svg>
  )
}

/* ── Cheese coin mark SVG ── */
function CoinMark({ size = 46 }: { size?: number }) {
  return (
    <svg className="mark" viewBox="0 0 48 48" style={{ width: size, height: size }}>
      <circle cx="24" cy="24" r="21" fill="url(#rimGrad)" />
      <circle cx="24" cy="24" r="18.4" fill="url(#cheeseGrad)" />
      <circle cx="16.5" cy="17" r="3.3" fill="url(#holeGrad)" />
      <circle cx="27" cy="14.5" r="2" fill="url(#holeGrad)" />
      <circle cx="30.5" cy="25.5" r="3.7" fill="url(#holeGrad)" />
      <circle cx="18" cy="29.5" r="2.5" fill="url(#holeGrad)" />
      <circle cx="23.5" cy="22" r="1.4" fill="url(#holeGrad)" />
    </svg>
  )
}

/* ── Big spinning wheel ── */
function CoinWheel() {
  return (
    <div className="wheel-wrap">
      <svg className="wheel" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="53" fill="url(#rimGrad)" />
        <circle cx="60" cy="60" r="46.5" fill="url(#cheeseGrad)" />
        <circle cx="42" cy="44" r="7.5" fill="url(#holeGrad)" />
        <circle cx="71" cy="37" r="5" fill="url(#holeGrad)" />
        <circle cx="79" cy="66" r="9" fill="url(#holeGrad)" />
        <circle cx="45" cy="77" r="6.2" fill="url(#holeGrad)" />
        <circle cx="60" cy="57" r="3.4" fill="url(#holeGrad)" />
      </svg>
    </div>
  )
}

/* ── Decorative holes (parallax) ── */
function Holes() {
  const containerRef = useRef<HTMLDivElement>(null)
  const holesRef = useRef<HTMLSpanElement[]>([])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const handleMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 10
      const y = (e.clientY / window.innerHeight - 0.5) * 10
      holesRef.current.forEach((h, i) => {
        const depth = (i % 3) + 1
        h.style.transform = `translate(${x * depth * 0.4}px, ${y * depth * 0.4}px)`
      })
    }
    container.addEventListener('mousemove', handleMove)
    return () => container.removeEventListener('mousemove', handleMove)
  }, [])

  const holeData = useRef(
    Array.from({ length: 10 }, () => ({
      size: 10 + Math.random() * 34,
      left: Math.random() * 90,
      top: Math.random() * 90,
      dur: (4 + Math.random() * 5).toFixed(1) + 's',
      dx: (Math.random() * 14 - 7).toFixed(1) + 'px',
      dy: (Math.random() * 14 - 7).toFixed(1) + 'px',
    }))
  ).current

  return (
    <div className="holes" ref={containerRef}>
      {holeData.map((h, i) => (
        <span
          key={i}
          ref={(el) => { if (el) holesRef.current[i] = el }}
          style={{
            width: h.size,
            height: h.size,
            left: `${h.left}%`,
            top: `${h.top}%`,
            '--dur': h.dur,
            '--dx': h.dx,
            '--dy': h.dy,
          } as React.CSSProperties}
        />
      ))}
    </div>
  )
}

/* ══════════════════════════════════════════
   Auth Page — login + register con tabs
══════════════════════════════════════════ */
export default function AuthPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { login, register } = useAuth()

  const isRegister = location.pathname === '/register'

  // form state
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  // reset error when switching tabs
  const switchTo = (tab: 'login' | 'register') => {
    setError('')
    setEmail('')
    setPassword('')
    setName('')
    navigate(tab === 'login' ? '/login' : '/register')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password || (isRegister && !name)) {
      setError('Completá todos los campos')
      return
    }
    try {
      setError('')
      setLoading(true)
      if (isRegister) {
        await register(email, password, name)
        await login(email, password)
        setToast('¡Usuario creado con éxito!')
        setTimeout(() => navigate('/dashboard', { replace: true }), 4000)
      } else {
        await login(email, password)
        navigate('/dashboard', { replace: true })
      }
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      <CoinDefs />
      <div className="stage">

        {/* ── Left brand panel ── */}
        <aside className="brand-panel">
          <Holes />

          <div className="brand-top">
            <CoinMark />
            <div className="rule" />
            <span className="wordmark">Cheese Cash</span>
          </div>

          <div className="hero">
            <span className="eyebrow">Tu queso, en un solo lugar</span>
            <h1>Guarda, mueve y <em>hace crecer</em> tu plata.</h1>
            <p>Una cuenta para recibir pagos, ahorrar y mandar cash a quien quieras — sin vueltas.</p>
            <CoinWheel />
          </div>

          <div className="brand-foot">
            <div className="stat"><b>+40k</b><span>CUENTAS ACTIVAS</span></div>
            <div className="stat"><b>0%</b><span>COMISIÓN DE ENVÍO</span></div>
          </div>
        </aside>

        {/* ── Right form panel ── */}
        <main className="form-panel">
          <div className="card">

            {/* mobile logo */}
            <div className="mobile-logo">
              <CoinMark size={40} />
              <div className="rule" />
              <span className="wordmark">Cheese Cash</span>
            </div>

            <div className="card-top">
              <h2>{isRegister ? 'Creá tu cuenta' : 'Bienvenido de nuevo'}</h2>
              <a href="#">¿Necesitás ayuda?</a>
            </div>

            {/* tabs */}
            <div className={`tabs${isRegister ? ' register' : ''}`}>
              <div className="tab-wedge" />
              <button
                type="button"
                className={!isRegister ? 'active' : ''}
                onClick={() => switchTo('login')}
              >
                Iniciar sesión
              </button>
              <button
                type="button"
                className={isRegister ? 'active' : ''}
                onClick={() => switchTo('register')}
              >
                Crear cuenta
              </button>
            </div>

            {/* form */}
            <form className="pane" onSubmit={handleSubmit} noValidate>

              {isRegister && (
                <div className="field">
                  <label htmlFor="regName">Nombre completo</label>
                  <input
                    id="regName"
                    type="text"
                    placeholder="Como en tu documento"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                  />
                </div>
              )}

              <div className="field">
                <label htmlFor="authEmail">Correo</label>
                <input
                  id="authEmail"
                  type="email"
                  placeholder="vos@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>

              <div className="field">
                <label htmlFor="authPassword">Contraseña</label>
                <input
                  id="authPassword"
                  type="password"
                  placeholder={isRegister ? 'Mínimo 8 caracteres' : '••••••••'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                />
              </div>

              {!isRegister && (
                <div className="row-between">
                  <label className="remember">
                    <input type="checkbox" /> Mantenerme conectado
                  </label>
                  <a href="#">Olvidé mi contraseña</a>
                </div>
              )}

              {error && <p className="auth-error">{error}</p>}

              <button type="submit" className="btn-submit" disabled={loading}>
                {loading
                  ? (isRegister ? 'Creando cuenta…' : 'Verificando…')
                  : (isRegister ? 'Crear mi cuenta' : 'Entrar a mi cuenta')
                }
              </button>
            </form>

            <div className="divider">o continuá con</div>
            <div className="row-between" style={{ gap: 12 }}>
              <button type="button" className="btn-social">Google</button>
              <button type="button" className="btn-social">Apple</button>
            </div>

            <p className="foot-note">
              {isRegister
                ? <>¿Ya tenés cuenta? <button type="button" onClick={() => switchTo('login')}>Iniciá sesión</button></>
                : <>¿Todavía no tenés cuenta? <button type="button" onClick={() => switchTo('register')}>Crear una</button></>
              }
            </p>

          </div>
        </main>
      </div>
    </>
  )
}
