import { useEffect, useState } from 'react'
import { api } from '../../services/api'
import { useAuth } from '../../context/useAuth'
import { BASE_CURRENCIES, type BaseCurrency } from '../../context/auth-context'
import './Configuracion.css'

/** Lo que devuelve GET /users/me/thresholds (columnas de la base). */
interface ApiThresholds {
  threshold_ars: string
  threshold_usd: string
  threshold_eur: string
  threshold_btc_usd: string
}

/** Lo que espera PUT /users/me/thresholds. Ojo: nombres distintos al GET. */
interface ThresholdForm {
  ars: string
  usd: string
  eur: string
  btcUsd: string
}

const THRESHOLD_FIELDS: {
  key: keyof ThresholdForm
  label: string
  hint: string
}[] = [
  { key: 'ars', label: 'Pesos', hint: 'ARS' },
  { key: 'usd', label: 'Dólares', hint: 'USD' },
  { key: 'eur', label: 'Euros', hint: 'EUR' },
  { key: 'btcUsd', label: 'Bitcoin', hint: 'en USD' },
]

export default function Configuracion() {
  const { user, refreshUser } = useAuth()

  // ── Datos de la cuenta ──
  const [pin, setPin] = useState<string | null>(null)

  // ── Nombre ──
  // Guardamos solo lo que el usuario escribió. Mientras no toque nada,
  // el campo muestra el nombre que viene del servidor. Así no hace falta
  // un efecto que copie el valor y dispare renders en cascada.
  const [nameDraft, setNameDraft] = useState<string | null>(null)
  const name = nameDraft ?? user?.fullName ?? ''
  const [savingName, setSavingName] = useState(false)
  const [nameError, setNameError] = useState('')
  const [nameSaved, setNameSaved] = useState(false)

  // ── Contraseña ──
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [savingPass, setSavingPass] = useState(false)
  const [passError, setPassError] = useState('')
  const [passSaved, setPassSaved] = useState(false)

  // ── Moneda base ──
  // Vive en la cuenta, así que sale del perfil y se guarda contra la API.
  const [savingBase, setSavingBase] = useState(false)
  const [baseError, setBaseError] = useState('')
  const base = user?.baseCurrency ?? 'USD'

  async function changeBase(currency: BaseCurrency) {
    if (currency === base || savingBase) return
    setSavingBase(true)
    setBaseError('')

    try {
      // El backend pide los dos campos juntos, así que mandamos el
      // nombre vigente aunque no lo estemos cambiando.
      await api.put('/users/me', {
        fullName: user?.fullName ?? '',
        baseCurrency: currency,
      })
      await refreshUser()
    } catch (err) {
      setBaseError(err instanceof Error ? err.message : 'No pudimos guardar la moneda')
    } finally {
      setSavingBase(false)
    }
  }

  // ── Umbrales ──
  const [thresholds, setThresholds] = useState<ThresholdForm | null>(null)
  const [thError, setThError] = useState('')
  const [savingTh, setSavingTh] = useState(false)
  const [thSaved, setThSaved] = useState(false)

  useEffect(() => {
    let cancelled = false

    api
      .get<{ pin: string }>('/users/me/pin')
      .then(data => { if (!cancelled) setPin(data.pin) })
      .catch(() => { if (!cancelled) setPin(null) })

    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    let cancelled = false

    api
      .get<ApiThresholds>('/users/me/thresholds')
      .then(data => {
        if (cancelled) return
        setThresholds({
          ars: String(data.threshold_ars ?? ''),
          usd: String(data.threshold_usd ?? ''),
          eur: String(data.threshold_eur ?? ''),
          btcUsd: String(data.threshold_btc_usd ?? ''),
        })
      })
      .catch(err => {
        if (cancelled) return
        setThError(err instanceof Error ? err.message : 'No pudimos cargar tus umbrales')
      })

    return () => { cancelled = true }
  }, [])

  // ── Guardar nombre ──
  const nameChanged = name.trim() !== (user?.fullName ?? '') && name.trim().length >= 2

  async function saveName() {
    if (!nameChanged || savingName) return
    setSavingName(true)
    setNameError('')

    try {
      await api.put('/users/me', {
        fullName: name.trim(),
        baseCurrency: base,
      })
      await refreshUser()
      setNameDraft(null)
      setNameSaved(true)
    } catch (err) {
      setNameError(err instanceof Error ? err.message : 'No pudimos guardar el nombre')
    } finally {
      setSavingName(false)
    }
  }

  // ── Guardar contraseña ──
  const tooShort = next.length > 0 && next.length < 8
  const mismatch = confirm.length > 0 && next !== confirm
  const canSavePass =
    current.length > 0 && next.length >= 8 && next === confirm && !savingPass

  async function savePassword() {
    if (!canSavePass) return
    setSavingPass(true)
    setPassError('')

    try {
      await api.put('/users/me/password', {
        currentPassword: current,
        newPassword: next,
      })
      setCurrent('')
      setNext('')
      setConfirm('')
      setPassSaved(true)
    } catch (err) {
      setPassError(err instanceof Error ? err.message : 'No pudimos cambiar la contraseña')
    } finally {
      setSavingPass(false)
    }
  }

  // ── Guardar umbrales ──
  const thValues = thresholds
    ? THRESHOLD_FIELDS.map(f => parseFloat(thresholds[f.key].replace(',', '.')))
    : []
  const thValid = thValues.length > 0 && thValues.every(v => !Number.isNaN(v) && v > 0)

  async function saveThresholds() {
    if (!thresholds || !thValid || savingTh) return
    setSavingTh(true)
    setThError('')

    try {
      await api.put('/users/me/thresholds', {
        ars: parseFloat(thresholds.ars.replace(',', '.')),
        usd: parseFloat(thresholds.usd.replace(',', '.')),
        eur: parseFloat(thresholds.eur.replace(',', '.')),
        btcUsd: parseFloat(thresholds.btcUsd.replace(',', '.')),
      })
      setThSaved(true)
    } catch (err) {
      setThError(err instanceof Error ? err.message : 'No pudimos guardar los cambios')
    } finally {
      setSavingTh(false)
    }
  }

  const initial = (user?.fullName ?? '?').trim().charAt(0).toUpperCase()

  return (
    <div className="config">
      <div className="config-head">
        <h2>Configuración de la cuenta</h2>
        <p>Tus datos, tu seguridad y cómo querés que se comporte la app.</p>
      </div>

      {/* ── Cuenta ── */}
      <section className="config-card">
        <div className="config-identity">
          <div className="config-avatar" aria-hidden="true">{initial}</div>
          <div className="config-identity-text">
            <b>{user?.fullName ?? '—'}</b>
            {pin && <span>PIN {pin}</span>}
          </div>
        </div>

        <dl className="config-facts">
          <div className="config-fact">
            <dt>Correo electrónico</dt>
            <dd>{user?.email ?? '—'}</dd>
          </div>
          <div className="config-fact">
            <dt>Tu PIN para recibir</dt>
            <dd>{pin ?? '—'}</dd>
          </div>
          <div className="config-fact">
            <dt>Tipo de cuenta</dt>
            <dd>Usuario estándar</dd>
          </div>
          <div className="config-fact">
            <dt>Estado</dt>
            <dd className="is-ok">Activa</dd>
          </div>
        </dl>
      </section>

      {/* ── Nombre ── */}
      <section className="config-card">
        <h3>Nombre</h3>
        <p className="config-hint">Es el nombre que ven quienes reciben tus transferencias.</p>

        <div className="config-form">
          <div className="config-field">
            <label htmlFor="cfg-name">Nombre completo</label>
            <input
              id="cfg-name"
              type="text"
              value={name}
              onChange={e => { setNameDraft(e.target.value); setNameSaved(false) }}
              disabled={savingName}
            />
          </div>

          {nameError && <p className="config-msg is-error" role="alert">{nameError}</p>}
          {nameSaved && <p className="config-msg is-ok" role="status">Nombre actualizado</p>}

          <button className="config-btn" onClick={saveName} disabled={!nameChanged || savingName}>
            {savingName ? 'Guardando…' : 'Guardar nombre'}
          </button>
        </div>
      </section>

      {/* ── Contraseña ── */}
      <section className="config-card">
        <h3>Contraseña</h3>
        <p className="config-hint">Necesitás tu contraseña actual para poder cambiarla.</p>

        <div className="config-form">
          <div className="config-field">
            <label htmlFor="cfg-current">Contraseña actual</label>
            <input
              id="cfg-current"
              type="password"
              autoComplete="current-password"
              value={current}
              onChange={e => { setCurrent(e.target.value); setPassSaved(false) }}
              disabled={savingPass}
            />
          </div>

          <div className="config-grid">
            <div className="config-field">
              <label htmlFor="cfg-new">Nueva</label>
              <input
                id="cfg-new"
                type="password"
                autoComplete="new-password"
                placeholder="Mínimo 8"
                value={next}
                onChange={e => { setNext(e.target.value); setPassSaved(false) }}
                disabled={savingPass}
                aria-invalid={tooShort}
              />
              {tooShort && (
                <span className="config-field-hint">Te faltan {8 - next.length}</span>
              )}
            </div>

            <div className="config-field">
              <label htmlFor="cfg-confirm">Repetir</label>
              <input
                id="cfg-confirm"
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={e => { setConfirm(e.target.value); setPassSaved(false) }}
                disabled={savingPass}
                aria-invalid={mismatch}
              />
              {mismatch && <span className="config-field-hint">No coinciden</span>}
            </div>
          </div>

          {passError && <p className="config-msg is-error" role="alert">{passError}</p>}
          {passSaved && <p className="config-msg is-ok" role="status">Contraseña actualizada</p>}

          <button className="config-btn" onClick={savePassword} disabled={!canSavePass}>
            {savingPass ? 'Guardando…' : 'Cambiar contraseña'}
          </button>
        </div>
      </section>

      {/* ── Preferencias ── */}
      <section className="config-card">
        <h3>Preferencias</h3>
        <p className="config-hint">Se guardan en tu cuenta.</p>

        <div className="config-row">
          <div className="config-row-text">
            <b>Moneda base</b>
            <span>En qué moneda ver el total de tu billetera.</span>
          </div>

          <div className="config-chips" role="group" aria-label="Elegir moneda base">
            {BASE_CURRENCIES.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => changeBase(c)}
                disabled={savingBase}
                aria-pressed={base === c}
                className={base === c ? 'is-active' : undefined}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {baseError && (
          <p className="config-msg is-error" role="alert" style={{ marginTop: 14 }}>
            {baseError}
          </p>
        )}
      </section>

      {/* ── Umbrales ── */}
      <section className="config-card">
        <h3>Umbrales de confirmación</h3>
        <p className="config-hint">
          Las operaciones que superen estos montos no se ejecutan al instante:
          te enviamos un correo para que las confirmes.
        </p>

        {!thresholds && !thError && <p className="config-loading">Cargando…</p>}

        {thError && !thresholds && (
          <p className="config-msg is-error" role="alert">{thError}</p>
        )}

        {thresholds && (
          <div className="config-form">
            <div className="config-grid">
              {THRESHOLD_FIELDS.map(({ key, label, hint }) => {
                const raw = parseFloat(thresholds[key].replace(',', '.'))
                const invalid = thresholds[key] !== '' && (Number.isNaN(raw) || raw <= 0)

                return (
                  <div className="config-field is-mono" key={key}>
                    <label htmlFor={`cfg-th-${key}`}>
                      {label} · {hint}
                    </label>
                    <input
                      id={`cfg-th-${key}`}
                      type="number"
                      min="0"
                      step="any"
                      value={thresholds[key]}
                      onChange={e => {
                        setThresholds({ ...thresholds, [key]: e.target.value })
                        setThSaved(false)
                      }}
                      aria-invalid={invalid}
                    />
                  </div>
                )
              })}
            </div>

            {thError && <p className="config-msg is-error" role="alert">{thError}</p>}
            {thSaved && <p className="config-msg is-ok" role="status">Umbrales guardados</p>}

            <button className="config-btn" onClick={saveThresholds} disabled={!thValid || savingTh}>
              {savingTh ? 'Guardando…' : 'Guardar umbrales'}
            </button>
          </div>
        )}
      </section>
    </div>
  )
}