import { useEffect, useState } from 'react'
import RateChart from '../../components/RateChart/RateChart'
import { getAllRates } from '../../services/rates'
import { getBaseCurrency } from '../../services/preferences'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'
import { api } from '../../services/api'
import MovimientosList, {
  type HistoryItem,
  type TxDetail,
} from '../../components/MovimientosList/MovimientosList'
import './Dashboard.css'
import {
  ShoppingBag,
  ArrowUpFromLine,
  ArrowLeftRight,
  Calculator,
} from 'lucide-react'

interface ApiBalance {
  id: number
  wallet_id: number
  currency: string
  amount: string
}

const CURRENCY_ORDER = ['ARS', 'USD', 'EUR', 'BTC']

const CURRENCY_META: Record<string, { symbol: string; name: string }> = {
  ARS: { symbol: 'AR', name: 'Peso Argentino' },
  USD: { symbol: 'US', name: 'Dólar Estadounidense' },
  EUR: { symbol: 'EU', name: 'Euro' },
  BTC: { symbol: '₿', name: 'Bitcoin' },
}

const quickActions = [
  {
    label: 'Comprar',
    icon: ShoppingBag,
    to: '/operar?modo=comprar',
  },
  {
    label: 'Vender',
    icon: ArrowUpFromLine,
    to: '/operar?modo=vender',
  },
  {
    label: 'Intercambiar',
    icon: ArrowLeftRight,
    to: '/operar?modo=intercambiar',
  },
  {
    label: 'Conversor',
    icon: Calculator,
    to: '/conversor',
  },
]

function formatAmount(currency: string, amount: string) {
  const value = Number(amount)

  if (Number.isNaN(value)) return amount

  if (currency === 'BTC') {
    return value.toFixed(8)
  }

  return value.toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function sortBalances(list: ApiBalance[]) {
  return [...list].sort(
    (a, b) =>
      CURRENCY_ORDER.indexOf(a.currency) -
      CURRENCY_ORDER.indexOf(b.currency),
  )
}

function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [balances, setBalances] = useState<ApiBalance[]>([])
  const [loadingBalances, setLoadingBalances] = useState(true)
  const [balancesError, setBalancesError] = useState('')

  const [movements, setMovements] = useState<HistoryItem[]>([])
  const [loadingMovements, setLoadingMovements] = useState(true)
  const [movementsError, setMovementsError] = useState('')

  useEffect(() => {
    let cancelled = false

    api
      .get<ApiBalance[]>('/wallet/balances')
      .then((data) => {
        if (!cancelled) {
          setBalances(sortBalances(data))
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setBalancesError((err as Error).message)
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingBalances(false)
        }
      })

    Promise.all([
      api.get<HistoryItem[]>('/transfers/history'),
      api.get<TxDetail[]>('/deposits'),
    ])
      .then(([history, deposits]) => {
        const depositItems: HistoryItem[] = (
          Array.isArray(deposits) ? deposits : []
        ).map((deposit) => ({
          kind: 'deposit' as const,
          id: deposit.id,
          created_at: deposit.created_at ?? '',
          detail: deposit,
        }))

        const combined: HistoryItem[] = [
          ...(Array.isArray(history) ? history : []),
          ...depositItems,
        ]

        combined.sort(
          (a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime(),
        )

        if (!cancelled) {
          setMovements(combined.slice(0, 3))
        }
      })
      .catch(() => {
        if (!cancelled) {
          setMovementsError(
            'No se pudieron cargar los últimos movimientos.',
          )
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingMovements(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  const baseCurrency = getBaseCurrency()

  // Cuántas unidades de cada moneda equivalen a 1 USD. Con eso llevamos
  // todos los saldos a la moneda base y los sumamos.
  const [rates, setRates] = useState<Record<string, number> | null>(null)

  useEffect(() => {
    let cancelled = false

    getAllRates()
      .then(data => { if (!cancelled) setRates(data) })
      .catch(() => { if (!cancelled) setRates(null) })

    return () => { cancelled = true }
  }, [])

  const total = rates
    ? balances.reduce((sum, b) => {
      const rate = rates[b.currency]
      if (!rate) return sum
      // saldo -> dólares -> moneda base
      return sum + (parseFloat(String(b.amount)) / rate) * (rates[baseCurrency] ?? 1)
    }, 0)
    : null

  const userName = user?.fullName || 'Usuario'
  const initial = userName.charAt(0).toUpperCase()

  return (
    <div className="dashboard">
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <p>Bienvenido de vuelta</p>
            <h1>Hola, {userName}</h1>
          </div>

          <div className="dashboard-avatar desktop-avatar">
            {initial}
          </div>
        </header>

        <section className="total-balance-card">
          <div className="balance-decoration balance-decoration-top" />
          <div className="balance-decoration balance-decoration-bottom" />

          <p className="dashboard-section-label">
            Total en {baseCurrency}
          </p>

          <h2>
            {loadingBalances || total === null
              ? '—'
              : `${formatAmount(baseCurrency, String(total))} ${baseCurrency}`}
          </h2>
        </section>

        <section className="dashboard-section">
          <h2 className="dashboard-section-title">
            Cotizaciones
          </h2>

          <RateChart from="USD" to="ARS" days={7} selectable />
        </section>

        <section className="dashboard-section">
          <h2 className="dashboard-section-title">
            Mis monedas
          </h2>

          {loadingBalances && <p>Cargando saldos…</p>}

          {!loadingBalances && balancesError && (
            <p>{balancesError}</p>
          )}

          {!loadingBalances && !balancesError && (
            <div className="currency-grid">
              {balances
                .filter(
                  (balance) => balance.currency !== 'USD',
                )
                .map((balance) => {
                  const meta =
                    CURRENCY_META[balance.currency]

                  return (
                    <article
                      className="currency-card"
                      key={balance.currency}
                    >
                      <div className="currency-card-header">
                        <div>
                          <strong>
                            {meta?.symbol ??
                              balance.currency}
                          </strong>

                          <span>{balance.currency}</span>
                        </div>
                      </div>

                      <strong className="currency-amount">
                        {formatAmount(
                          balance.currency,
                          balance.amount,
                        )}
                      </strong>

                      <small>
                        {meta?.name ?? balance.currency}
                      </small>
                    </article>
                  )
                })}
            </div>
          )}
        </section>

        <section className="dashboard-section">
          <h2 className="dashboard-section-title">
            Accesos rápidos
          </h2>

          <div className="quick-actions">
            {quickActions.map((action) => {
              const Icon = action.icon

              return (
                <button
                  className="quick-action"
                  key={action.label}
                  onClick={() => navigate(action.to)}
                >
                  <Icon size={24} />
                  <strong>{action.label}</strong>
                </button>
              )
            })}
          </div>
        </section>

        <section className="dashboard-section">
          <div className="transactions-heading">
            <h2 className="dashboard-section-title">
              Últimos movimientos
            </h2>

            <button
              onClick={() => navigate('/historial')}
            >
              Ver todos
            </button>
          </div>

          <MovimientosList
            items={movements}
            loading={loadingMovements}
            error={movementsError}
            skeletonCount={3}
            emptyMessage="Todavía no tenés movimientos."
          />
        </section>
      </main>
    </div>
  )
}

export default Dashboard