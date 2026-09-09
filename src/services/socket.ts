import { io, type Socket } from 'socket.io-client'

/**
 * El backend expone Socket.io en la raíz del servidor, no bajo /api.
 * VITE_API_URL apunta a ".../api", así que le sacamos ese sufijo.
 */
function socketUrl(): string {
  const base = import.meta.env.VITE_API_URL ?? ''
  return base.replace(/\/api\/?$/, '')
}

/** Transacción tal como la emite el backend en "transaction:completed". */
export interface TransactionEvent {
  id: number
  type: string
  from_currency: string
  to_currency: string
  from_amount: string
  to_amount: string
  status: string
}

/** Transferencia tal como la emite el backend en "transfer:completed". */
export interface TransferEvent {
  id: number
  from_wallet_id: number
  to_wallet_id: number
  currency: string
  amount: string
  status: string
}

/**
 * Abre la conexión. El backend valida el token en el handshake y mete al
 * usuario en su propia sala, así que cada uno recibe solo lo suyo.
 */
export function connectSocket(token: string): Socket {
  return io(socketUrl(), {
    auth: { token },
    transports: ['polling', 'websocket'],
  })
}