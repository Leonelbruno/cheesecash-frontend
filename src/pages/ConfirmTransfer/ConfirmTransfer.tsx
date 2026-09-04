import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../../services/api'
import { formatAmount } from '../../services/rates'

const C = {
  bg: '#0a0908', card: '#141210', cardBorder: 'rgba(232,196,104,0.14)',
  gold: '#f2d488', goldMid: '#d9a942',
  text: '#f6efdf', muted: '#9a927f', danger: '#e2705f',
}

const microStyle: React.CSSProperties = {
  fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
  textTransform: 'uppercase', letterSpacing: 3, color: C.muted,
}

interface ApiTransfer {
  id: number
  currency: string
  amount: number
  status: string
}

export default function ConfirmTransfer() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const token = params.get('token')

  const [state, setState] = useState<'loading' | 'ok' | 'error'>(
    token ? 'loading' : 'error',
  )
  const [transfer, setTransfer] = useState<ApiTransfer | null>(null)
  const [message, setMessage] = useState(
    token ? '' : 'El link no incluye un token de confirmación.',
  )

  useEffect(() => {
    let cancelled = false

    if (!token) return

    api
      .get<ApiTransfer>(`/transfers/confirm/${token}`, { auth: false })
      .then(data => {
        if (cancelled) return
        setTransfer(data)
        setState('ok')
      })
      .catch(err => {
        if (cancelled) return
        setMessage(err instanceof Error ? err.message : 'No pudimos confirmar la transferencia.')
        setState('error')
      })

    return () => { cancelled = true }
  }, [token])

  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 24 }}>

        {state === 'loading' && (
          <p style={{ fontFamily: 'Inter, sans-serif', color: C.muted }}>Confirmando tu transferencia…</p>
        )}

        {state === 'error' && (
          <>
            <div style={{ width: 88, height: 88, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${C.danger}`, background: 'rgba(226,112,95,0.08)' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={C.danger} strokeWidth="2" strokeLinecap="round">
                <line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" />
              </svg>
            </div>
            <div>
              <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 22, color: C.text, margin: 0 }}>No se pudo confirmar</h1>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: C.muted, marginTop: 8 }}>{message}</p>
            </div>
          </>
        )}

        {state === 'ok' && transfer && (
          <>
            <div style={{ width: 88, height: 88, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(242,212,136,0.3)', background: 'rgba(242,212,136,0.08)' }}>
              <svg width="44" height="44" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="22" stroke={C.gold} strokeWidth="2" />
                <polyline points="14 24 21 31 34 18" stroke={C.gold} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 22, color: C.text, margin: 0 }}>Transferencia confirmada</h1>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: C.muted, marginTop: 8 }}>El dinero ya está en la cuenta del destinatario.</p>
            </div>
            <div style={{ width: '100%', background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 18, padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={microStyle}>Monto enviado</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: C.gold, fontWeight: 700 }}>
                  {formatAmount(transfer.currency, Number(transfer.amount))} {transfer.currency}
                </span>
              </div>
            </div>
          </>
        )}

        {state !== 'loading' && (
          <button
            onClick={() => navigate('/dashboard')}
            style={{ width: '100%', padding: '14px 0', borderRadius: 12, border: 'none', background: `linear-gradient(135deg, ${C.gold}, ${C.goldMid})`, color: '#161311', fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
            Ir a mi billetera
          </button>
        )}
      </div>
    </div>
  )
}