import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
// SPRINT 2: login con Google deshabilitado temporalmente.
// Para reactivarlo: descomentar este import, el bloque del formulario
// más abajo, loginWithGoogle en useAuth y handleGoogleSuccess.
// import { GoogleLogin } from '@react-oauth/google'
import { useAuth } from '../../context/useAuth'
import Toast from '../../components/Toast/Toast'
import CheeseCashLogo from '../../components/CheeseCashLogo/CheeseCashLogo'
import './AuthPage.css'

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

  const [holeData] = useState(() =>
    Array.from({ length: 10 }, () => ({
      size: 10 + Math.random() * 34,
      left: Math.random() * 90,
      top: Math.random() * 90,
      dur: (4 + Math.random() * 5).toFixed(1) + 's',
      dx: (Math.random() * 14 - 7).toFixed(1) + 'px',
      dy: (Math.random() * 14 - 7).toFixed(1) + 'px',
    })),
  )

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

export default function AuthPage() {
  const location = useLocation()
  const navigate = useNavigate()
  // SPRINT 2: agregar de nuevo loginWithGoogle al reactivar el botón
  const { login, register } = useAuth()

  const isRegister = location.pathname === '/register'

  const [name, setName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const redirectTimer = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (redirectTimer.current) clearTimeout(redirectTimer.current)
    }
  }, [])

  const switchTo = (tab: 'login' | 'register') => {
    setError('')
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setName('')
    setBirthDate('')
    navigate(tab === 'login' ? '/login' : '/register')
  }

  const validateRegister = (): string | null => {
    if (!name || !birthDate || !email || !password || !confirmPassword) {
      return 'Completá todos los campos'
    }

    const today = new Date()
    const [year, month, day] = birthDate.split('-').map(Number)

    let age = today.getFullYear() - year

    const birthdayHasNotPassed =
      today.getMonth() + 1 < month ||
      (today.getMonth() + 1 === month && today.getDate() < day)

    if (birthdayHasNotPassed) {
      age--
    }

    if (age < 18) {
      return 'Debés ser mayor de 18 años para registrarte'
    }

    if (password.length < 8) {
      return 'La contraseña debe tener al menos 8 caracteres'
    }

    if (password !== confirmPassword) {
      return 'Las contraseñas no coinciden'
    }

    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isRegister) {
      const validationError = validateRegister()
      if (validationError) {
        setError(validationError)
        return
      }
    } else if (!email || !password) {
      setError('Completá todos los campos')
      return
    }

    try {
      setError('')
      setLoading(true)

      if (isRegister) {
        await register(email, password, name, birthDate)

        setLoading(false)
        setToast('¡Usuario creado con éxito!')

        redirectTimer.current = window.setTimeout(
          () => navigate('/login', { replace: true }),
          2500,
        )

        return
      }

      await login(email, password)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError((err as Error).message)
      setLoading(false)
    }
  }

  // SPRINT 2: handler del login con Google. Se reactiva junto con el botón.
  // const handleGoogleSuccess = async (credential?: string) => {
  //   if (!credential) {
  //     setError('No se pudo iniciar sesión con Google')
  //     return
  //   }
  //
  //   try {
  //     setError('')
  //     setLoading(true)
  //     await loginWithGoogle(credential)
  //     navigate('/dashboard', { replace: true })
  //   } catch (err) {
  //     setError((err as Error).message)
  //     setLoading(false)
  //   }
  // }

  const passwordsMismatch =
    isRegister && confirmPassword.length > 0 && password !== confirmPassword

  return (
    <>
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      <div className="stage">

        <aside className="brand-panel">
          <Holes />

          <div className="brand-top">
            <CheeseCashLogo size={46} />
            <div className="rule" />
            <span className="wordmark">Cheese Cash</span>
          </div>

          <div className="hero">
            <span className="eyebrow">Tu queso, en un solo lugar</span>
            <h1>Guarda, mueve y <em>hace crecer</em> tu plata.</h1>
            <p>Una cuenta para recibir pagos, ahorrar y mandar cash a quien quieras — sin vueltas.</p>
            <div className="wheel-wrap">
              <div className="wheel">
                <CheeseCashLogo size={150} />
              </div>
            </div>
          </div>

          <div className="brand-foot">
            <div className="stat"><b>+40k</b><span>CUENTAS ACTIVAS</span></div>
            <div className="stat"><b>0%</b><span>COMISIÓN DE ENVÍO</span></div>
          </div>
        </aside>

        <main className="form-panel">
          <div className="card">

            <div className="mobile-logo">
              <CheeseCashLogo size={40} />
              <div className="rule" />
              <span className="wordmark">Cheese Cash</span>
            </div>

            <div className="card-top">
              <h2>{isRegister ? 'Creá tu cuenta' : 'Bienvenido de nuevo'}</h2>
            </div>

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
                    disabled={loading}
                  />
                </div>

              )}
              {isRegister && (
                <div className="field">
                  <label htmlFor="birthDate">Fecha de nacimiento</label>
                  <input
                    id="birthDate"
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    autoComplete="bday"
                    disabled={loading}
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
                  disabled={loading}
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
                  disabled={loading}
                />
              </div>

              {isRegister && (
                <div className="field">
                  <label htmlFor="authConfirmPassword">Repetí la contraseña</label>
                  <input
                    id="authConfirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    disabled={loading}
                    aria-invalid={passwordsMismatch}
                  />
                  {passwordsMismatch && (
                    <small className="field-hint field-hint--error">
                      Las contraseñas no coinciden
                    </small>
                  )}
                </div>
              )}

              {error && <p className="auth-error" role="alert">{error}</p>}

              <button type="submit" className="btn-submit" disabled={loading}>
                {loading
                  ? (isRegister ? 'Creando cuenta…' : 'Verificando…')
                  : (isRegister ? 'Crear mi cuenta' : 'Entrar a mi cuenta')
                }
              </button>
            </form>

            {/* SPRINT 2: botón de Google oculto — descomentar para reactivar
            <div className="divider">o continuá con</div>

            <div className="google-btn-wrap">
              <GoogleLogin
                onSuccess={(res) => handleGoogleSuccess(res.credential)}
                onError={() => setError('No se pudo iniciar sesión con Google')}
                text={isRegister ? 'signup_with' : 'signin_with'}
                width="320"
              />
            </div>
            */}

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