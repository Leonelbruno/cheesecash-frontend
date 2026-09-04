import { useId } from 'react'

/**
 * Logo de Cheese Cash: la moneda de queso, opcionalmente con el nombre al lado.
 *
 * Los gradientes SVG se identifican por `id`, y los ids son globales en el
 * documento. Por eso se generan con useId(): así se pueden renderizar varios
 * logos en la misma pantalla sin que uno pise los gradientes del otro.
 *
 *   <CheeseCashLogo />                        moneda sola, 46px
 *   <CheeseCashLogo size={28} />              moneda chica
 *   <CheeseCashLogo withName />               moneda + "Cheese Cash"
 *   <CheeseCashLogo withName size={34} />     ambos, a medida
 */

interface CheeseCashLogoProps {
  /** Lado del cuadrado de la moneda, en píxeles. Por defecto 46. */
  size?: number
  /** Muestra el nombre "Cheese Cash" al lado de la moneda. */
  withName?: boolean
  /** Muestra la barra vertical entre la moneda y el nombre. Por defecto true. */
  divider?: boolean
  className?: string
}

export default function CheeseCashLogo({
  size = 46,
  withName = false,
  divider = true,
  className,
}: CheeseCashLogoProps) {
  const uid = useId().replace(/:/g, '')
  const cheese = `cheese-${uid}`
  const rim = `rim-${uid}`
  const hole = `hole-${uid}`

  const coin = (
    <svg
      viewBox="0 0 48 48"
      style={{ width: size, height: size, flexShrink: 0, display: 'block' }}
      role="img"
      aria-label="Cheese Cash"
    >
      <defs>
        <radialGradient id={cheese} cx="34%" cy="28%" r="78%">
          <stop offset="0%" stopColor="#fbeec0" />
          <stop offset="55%" stopColor="#e9bf62" />
          <stop offset="100%" stopColor="#c4922f" />
        </radialGradient>
        <linearGradient id={rim} x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#8a6416" />
          <stop offset="50%" stopColor="#f0cd7a" />
          <stop offset="100%" stopColor="#8a6416" />
        </linearGradient>
        <radialGradient id={hole} cx="35%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#a9702f" />
          <stop offset="100%" stopColor="#5e3a13" />
        </radialGradient>
      </defs>

      <circle cx="24" cy="24" r="21" fill={`url(#${rim})`} />
      <circle cx="24" cy="24" r="18.4" fill={`url(#${cheese})`} />
      <circle cx="16.5" cy="17" r="3.3" fill={`url(#${hole})`} />
      <circle cx="27" cy="14.5" r="2" fill={`url(#${hole})`} />
      <circle cx="30.5" cy="25.5" r="3.7" fill={`url(#${hole})`} />
      <circle cx="18" cy="29.5" r="2.5" fill={`url(#${hole})`} />
      <circle cx="23.5" cy="22" r="1.4" fill={`url(#${hole})`} />
    </svg>
  )

  if (!withName) {
    return className ? <span className={className}>{coin}</span> : coin
  }

  return (
    <div
      className={className}
      style={{ display: 'flex', alignItems: 'center', gap: size * 0.3 }}
    >
      {coin}

      {divider && (
        <span
          aria-hidden="true"
          style={{
            width: 2,
            height: size * 0.62,
            background: 'rgba(232,196,104,0.35)',
            borderRadius: 1,
            flexShrink: 0,
          }}
        />
      )}

      <span
        style={{
          fontFamily: 'Poppins, sans-serif',
          fontWeight: 800,
          fontSize: size * 0.46,
          lineHeight: 1.15,
          letterSpacing: '-0.01em',
          color: '#f6efdf',
          whiteSpace: 'nowrap',
        }}
      >
        Cheese Cash
      </span>
    </div>
  )
}