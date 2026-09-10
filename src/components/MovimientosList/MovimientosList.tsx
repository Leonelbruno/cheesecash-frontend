import './MovimientosList.css'
/**
 * MovimientosList — componente reutilizable para mostrar un listado de movimientos.
 * Usado en Historial y puede usarse en Dashboard u otras pantallas.
 */

const C = {
  card: '#141210',
  cardBorder: 'rgba(232,196,104,0.14)',
  gold: '#f2d488',
  goldMid: '#d9a942',
  text: '#f6efdf',
  muted: '#9a927f',
  mutedDark: '#5c584c',
  error: '#e2705f',
}

export interface TxDetail {
  id: string | number
  type?: string

  fromCurrency?: string
  toCurrency?: string
  from_currency?: string
  to_currency?: string

  fromAmount?: number
  toAmount?: number
  from_amount?: number
  to_amount?: number

  createdAt?: string
  created_at?: string

  currency?: string
  amount?: string | number
  status?: string

  from_wallet_id?: number
  to_wallet_id?: number
}

export interface HistoryItem {
  kind: 'transaction' | 'transfer' | 'deposit'
  id: string | number
  created_at: string

  direction?: 'sent' | 'received'

  counterpart?: {
    full_name: string
    email: string
  }

  detail: TxDetail
}

const TX_TYPE_NORM: Record<string, string> = {
  buy: 'compra',
  compra: 'compra',

  sell: 'venta',
  venta: 'venta',

  exchange: 'intercambio',
  intercambio: 'intercambio',

  transfer: 'transferencia',
  transferencia: 'transferencia',
}

const TX_COLORS: Record<string, string> = {
  compra: 'rgba(74,222,128,0.12)',
  venta: 'rgba(226,112,95,0.12)',
  intercambio: 'rgba(242,212,136,0.12)',
  transferencia: 'rgba(154,146,127,0.12)',
  recarga: 'rgba(96,165,250,0.12)',
}

const TX_TEXT: Record<string, string> = {
  compra: '#4ade80',
  venta: '#e2705f',
  intercambio: '#f2d488',
  transferencia: '#9a927f',
  recarga: '#60a5fa',
}

const TX_LABEL: Record<string, string> = {
  compra: 'Compra',
  venta: 'Venta',
  intercambio: 'Intercambio',
  transferencia: 'Transferencia',
  recarga: 'Recarga',
}

function TxIcon({
  tipo,
  color,
}: {
  tipo: string
  color: string
}) {
  if (tipo === 'compra') {
    return (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"
          stroke={color}
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  if (tipo === 'venta') {
    return (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M12 19V5M5 12l7-7 7 7"
          stroke={color}
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  if (tipo === 'intercambio') {
    return (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
      >
        <polyline
          points="17 1 21 5 17 9"
          stroke={color}
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <path
          d="M3 11V9a4 4 0 014-4h14"
          stroke={color}
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <polyline
          points="7 23 3 19 7 15"
          stroke={color}
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <path
          d="M21 13v2a4 4 0 01-4 4H3"
          stroke={color}
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  if (tipo === 'transferencia') {
    return (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
      >
        <line
          x1="22"
          y1="2"
          x2="11"
          y2="13"
          stroke={color}
          strokeWidth={1.8}
          strokeLinecap="round"
        />

        <polygon
          points="22 2 15 22 11 13 2 9 22 2"
          stroke={color}
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  if (tipo === 'recarga') {
    return (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M12 5v14M5 12l7 7 7-7"
          stroke={color}
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke={color}
        strokeWidth={1.8}
      />

      <path
        d="M12 8v4l3 3"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </svg>
  )
}

function formatAmount(
  amount: number,
  currency: string,
): string {
  if (!amount) return ''

  if (currency === 'BTC') {
    return amount.toLocaleString('es-AR', {
      minimumFractionDigits: 5,
      maximumFractionDigits: 8,
    })
  }

  return amount.toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return ''

  const date = new Date(dateStr)

  if (isNaN(date.getTime())) {
    return dateStr
  }

  return (
    date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }) +
    ' · ' +
    date.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  )
}

function SkeletonRow() {
  return (
    <div
      style={{
        height: 72,
        background: C.card,
        border: `1px solid ${C.cardBorder}`,
        borderRadius: 14,
        animation: 'pulse 1.5s ease-in-out infinite',
      }}
    />
  )
}

interface Props {
  items: HistoryItem[]
  loading: boolean
  error: string
  skeletonCount?: number
  emptyMessage?: string
}

export default function MovimientosList({
  items,
  loading,
  error,
  skeletonCount = 4,
  emptyMessage,
}: Props) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }

          50% {
            opacity: 0.4;
          }
        }
      `}</style>

      {loading &&
        Array.from({ length: skeletonCount }).map(
          (_, index) => (
            <SkeletonRow key={index} />
          ),
        )}

      {!loading && error && (
        <div
          style={{
            padding: '24px 20px',
            borderRadius: 14,
            background: 'rgba(226,112,95,0.08)',
            border:
              '1px solid rgba(226,112,95,0.3)',
            fontFamily: 'Inter, sans-serif',
            fontSize: 14,
            color: C.error,
          }}
        >
          {error}
        </div>
      )}

      {!loading &&
        !error &&
        items.map((item) => {
          const isTransfer =
            item.kind === 'transfer'

          const isDeposit =
            item.kind === 'deposit'

          const detail = item.detail

          const transferCur =
            detail.currency ?? ''

          const transferAmt =
            typeof detail.amount === 'string'
              ? parseFloat(detail.amount)
              : (detail.amount ?? 0)

          const transferStatus =
            detail.status ?? ''

          const transferDirection =
            item.direction

          const counterpartName =
            item.counterpart?.full_name?.trim()

          const counterpartEmail =
            item.counterpart?.email?.trim()

          const counterpartDisplay =
            counterpartName ||
            counterpartEmail ||
            ''

          const transferLabel =
            transferDirection === 'sent'
              ? 'Transferencia enviada'
              : transferDirection === 'received'
                ? 'Transferencia recibida'
                : 'Transferencia'

          const counterpartText =
            transferDirection === 'sent'
              ? counterpartDisplay
                ? `A ${counterpartDisplay}`
                : ''
              : transferDirection === 'received'
                ? counterpartDisplay
                  ? `De ${counterpartDisplay}`
                  : ''
                : ''

          const transferSign =
            transferDirection === 'sent'
              ? '-'
              : transferDirection === 'received'
                ? '+'
                : ''

          const rawType =
            detail.type?.toLowerCase() ?? ''

          const tipo = isDeposit
            ? 'recarga'
            : isTransfer
              ? 'transferencia'
              : (TX_TYPE_NORM[rawType] ??
                rawType)

          const fromCur =
            detail.fromCurrency ??
            detail.from_currency ??
            ''

          const toCur =
            detail.toCurrency ??
            detail.to_currency ??
            ''

          const toAmt =
            detail.toAmount ??
            detail.to_amount ??
            0

          const fromAmt =
            detail.fromAmount ??
            detail.from_amount ??
            0

          const dateStr = formatDate(
            item.created_at,
          )

          return (
            <div
              className="movement-card"
              key={`${item.kind}-${String(item.id)}`}
              style={{
                background: C.card,
                border: `1px solid ${C.cardBorder}`,
                borderRadius: 14,
              }}
            >
              <div
                className="movement-icon"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background:
                    TX_COLORS[tipo] ??
                    'rgba(154,146,127,0.12)',
                  flexShrink: 0,
                }}
              >
                <TxIcon
                  tipo={tipo}
                  color={
                    TX_TEXT[tipo] ?? '#9a927f'
                  }
                />
              </div>

              <div
                className="movement-info"
                style={{
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    flexWrap: 'wrap',
                  }}
                >
                  <span
                    style={{
                      fontFamily:
                        'Inter, sans-serif',
                      fontSize: 11,
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: 6,
                      background:
                        TX_COLORS[tipo] ??
                        'rgba(154,146,127,0.12)',
                      color:
                        TX_TEXT[tipo] ??
                        C.muted,
                    }}
                  >
                    {isTransfer
                      ? transferLabel
                      : (TX_LABEL[tipo] ??
                        tipo)}
                  </span>

                  {isTransfer &&
                    transferStatus ===
                    'pending' && (
                      <span
                        style={{
                          fontFamily:
                            'Inter, sans-serif',
                          fontSize: 10,
                          color: '#f2d488',
                          background:
                            'rgba(242,212,136,0.1)',
                          padding: '2px 6px',
                          borderRadius: 4,
                        }}
                      >
                        Pendiente
                      </span>
                    )}

                  {isTransfer &&
                    transferStatus ===
                    'failed' && (
                      <span
                        style={{
                          fontFamily:
                            'Inter, sans-serif',
                          fontSize: 10,
                          color: C.error,
                          background:
                            'rgba(226,112,95,0.1)',
                          padding: '2px 6px',
                          borderRadius: 4,
                        }}
                      >
                        Fallida
                      </span>
                    )}
                </div>

                <div
                  style={{
                    fontFamily:
                      'Inter, sans-serif',
                    fontSize: 11,
                    marginTop: 4,
                    color: C.mutedDark,
                  }}
                >
                  {isTransfer
                    ? `${counterpartText}${counterpartText ? ' · ' : ''}${transferCur}`
                    : fromCur && toCur
                      ? `${fromCur} → ${toCur}`
                      : tipo}

                  {dateStr
                    ? ` · ${dateStr}`
                    : ''}
                </div>
              </div>

              <div className="movement-amount">
                {isTransfer || isDeposit ? (
                  <div
                    style={{
                      fontFamily:
                        'JetBrains Mono, monospace',
                      fontSize: 13,
                      fontWeight: 600,
                      color: isDeposit
                        ? '#60a5fa'
                        : C.text,
                    }}
                  >
                    {isDeposit
                      ? '+'
                      : transferSign}

                    {formatAmount(
                      transferAmt,
                      transferCur,
                    )}{' '}
                    {transferCur}
                  </div>
                ) : (
                  <>
                    <div
                      style={{
                        fontFamily:
                          'JetBrains Mono, monospace',
                        fontSize: 13,
                        fontWeight: 600,
                        color: C.text,
                      }}
                    >
                      {toAmt
                        ? `${formatAmount(
                          toAmt,
                          toCur,
                        )} ${toCur}`
                        : ''}
                    </div>

                    <div
                      style={{
                        fontFamily:
                          'JetBrains Mono, monospace',
                        fontSize: 10,
                        color: C.mutedDark,
                      }}
                    >
                      {fromAmt
                        ? `${formatAmount(
                          fromAmt,
                          fromCur,
                        )} ${fromCur}`
                        : ''}
                    </div>
                  </>
                )}
              </div>
            </div>
          )
        })}

      {!loading &&
        !error &&
        items.length === 0 && (
          <div
            style={{
              padding: '64px 0',
              textAlign: 'center',
              fontFamily: 'Inter, sans-serif',
              fontSize: 14,
              color: C.mutedDark,
            }}
          >
            {emptyMessage ??
              'Todavía no realizaste ninguna operación.'}
          </div>
        )}
    </div>
  )
}