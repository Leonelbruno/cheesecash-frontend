import { useEffect, useRef, useState } from 'react'
import { api } from '../../services/api'
import {
  connectSocket,
  type TransactionEvent,
  type TransferEvent,
} from '../../services/socket'
import { formatAmount } from '../../services/rates'
import './Notifications.css'

interface Note {
  id: string
  message: string
}

interface ApiBalance {
  wallet_id: number
  currency: string
  amount: string
}

const TX_VERB: Record<string, string> = {
  buy: 'Compra',
  sell: 'Venta',
  exchange: 'Intercambio',
}

/**
 * Escucha las notificaciones en tiempo real y las muestra como avisos.
 *
 * El backend emite "transfer:completed" tanto al que envía como al que recibe,
 * con el mismo contenido. Para saber de qué lado estamos comparamos el
 * wallet_id propio (que sale de /wallet/balances) con el de la transferencia.
 */
export default function Notifications() {
  const [notes, setNotes] = useState<Note[]>([])
  // En ref y no en estado: si fuera estado, el efecto del socket volvería a
  // correr cuando llega el wallet_id y reconectaría al pedo.
  const walletIdRef = useRef<number | null>(null)

  useEffect(() => {
    let cancelled = false

    api
      .get<ApiBalance[]>('/wallet/balances')
      .then(data => {
        if (cancelled || !Array.isArray(data) || data.length === 0) return
        walletIdRef.current = data[0].wallet_id
      })
      .catch(() => { /* sin wallet_id igual mostramos el aviso, sin distinguir lado */ })

    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('cc_token')
    if (!token) return

    const socket = connectSocket(token)

    function push(message: string) {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
      setNotes(prev => [...prev, { id, message }])
      setTimeout(() => {
        setNotes(prev => prev.filter(n => n.id !== id))
      }, 5000)
    }

    socket.on('transaction:completed', (tx: TransactionEvent) => {
      const verbo = TX_VERB[tx.type] ?? 'Operación'
      const recibido = formatAmount(tx.to_currency, Number(tx.to_amount))
      push(`${verbo} confirmada: recibiste ${recibido} ${tx.to_currency}`)
    })

    socket.on('transfer:completed', (tr: TransferEvent) => {
      const monto = `${formatAmount(tr.currency, Number(tr.amount))} ${tr.currency}`

      const walletId = walletIdRef.current

      if (walletId === null) {
        push(`Transferencia confirmada por ${monto}`)
        return
      }

      push(
        tr.to_wallet_id === walletId
          ? `Recibiste una transferencia de ${monto}`
          : `Transferencia enviada por ${monto}`,
      )
    })

    return () => {
      socket.off('transaction:completed')
      socket.off('transfer:completed')
      socket.disconnect()
    }
  }, [])

  if (notes.length === 0) return null

  return (
    <div className="notif-stack" role="status" aria-live="polite">
      {notes.map(n => (
        <div key={n.id} className="notif">
          <span aria-hidden="true" className="notif-dot" />
          <span>{n.message}</span>
        </div>
      ))}
    </div>
  )
}