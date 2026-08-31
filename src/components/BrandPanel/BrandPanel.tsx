import { useEffect, useRef } from 'react'
import './BrandPanel.css'

const HOLE_COUNT = 10

const HOLE_STYLES = Array.from({ length: HOLE_COUNT }, () => ({
  size: 10 + Math.random() * 34,
  left: Math.random() * 90,
  top: Math.random() * 90,
}))

function CheeseCoin({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48">
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

function BrandPanel() {
  const panelRef = useRef<HTMLElement>(null)
  const holesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const panel = panelRef.current
    const holesEl = holesRef.current
    if (!panel || !holesEl) return

    function handleMouseMove(e: MouseEvent) {
      const { innerWidth, innerHeight } = window
      const x = (e.clientX / innerWidth - 0.5) * 10
      const y = (e.clientY / innerHeight - 0.5) * 10
      holesEl!.querySelectorAll<HTMLSpanElement>('span').forEach((h, i) => {
        const depth = (i % 3) + 1
        h.style.transform = `translate(${x * depth * 0.4}px, ${y * depth * 0.4}px)`
      })
    }

    panel.addEventListener('mousemove', handleMouseMove)
    return () => panel.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <aside className="brand-panel" ref={panelRef}>
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

      <div className="holes" ref={holesRef}>
        {HOLE_STYLES.map((h, i) => (
          <span
            key={i}
            style={{ width: h.size, height: h.size, left: `${h.left}%`, top: `${h.top}%` }}
          />
        ))}
      </div>

      <div className="brand-top">
        <CheeseCoin className="mark" />
        <div className="rule" />
        <span className="wordmark">Cheese Cash</span>
      </div>

      <div className="hero">
        <span className="eyebrow">Tu queso, en un solo lugar</span>
        <h1>
          Guarda, mueve y <em>hace crecer</em> tu plata.
        </h1>
        <p>Una cuenta para recibir pagos, ahorrar y mandar cash a quien quieras — sin vueltas.</p>

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
      </div>

      <div className="brand-foot">
        <div className="stat">
          <b>+40k</b>
          <span>CUENTAS ACTIVAS</span>
        </div>
        <div className="stat">
          <b>0%</b>
          <span>COMISIÓN DE ENVÍO</span>
        </div>
      </div>
    </aside>
  )
}

export default BrandPanel
export { CheeseCoin }