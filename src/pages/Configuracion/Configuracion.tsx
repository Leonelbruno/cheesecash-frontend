import { useEffect, useState } from 'react'
import { api } from '../../services/api'

const C = {
  card: '#141210', cardBorder: 'rgba(232,196,104,0.14)',
  gold: '#f2d488', goldMid: '#d9a942',
  text: '#f6efdf', muted: '#9a927f', mutedDark: '#5c584c',
  danger: '#e2705f',
  radius: '18px',
}

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

const FIELDS: { key: keyof ThresholdForm; label: string; hint: string }[] = [
  { key: 'ars', label: 'Pesos argentinos', hint: 'ARS' },
  { key: 'usd', label: 'Dólares', hint: 'USD' },
  { key: 'eur', label: 'Euros', hint: 'EUR' },
  { key: 'btcUsd', label: 'Bitcoin', hint: 'equivalente en USD' },
]

const fieldStyle: React.CSSProperties = {
  width: '100%', padding: '12px 14px', boxSizing: 'border-box',
  background: '#0f0d0b', border: `1px solid ${C.cardBorder}`, borderRadius: 10,
  color: C.text, fontFamily: 'JetBrains Mono, monospace', fontSize: 14, outline: 'none',
}
const labelStyle: React.CSSProperties = {
  fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
  textTransform: 'uppercase', letterSpacing: 3, color: C.muted,
  display: 'block', marginBottom: 6,
}

export default function Configuracion() {
  const [form, setForm] = useState<ThresholdForm | null>(null)
  const [loadError, setLoadError] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    let cancelled = false

    api
      .get<ApiThresholds>('/users/me/thresholds')
      .then(data => {
        if (cancelled) return
        setForm({
          ars: String(data.threshold_ars ?? ''),
          usd: String(data.threshold_usd ?? ''),
          eur: String(data.threshold_eur ?? ''),
          btcUsd: String(data.threshold_btc_usd ?? ''),
        })
      })
      .catch(err => {
        if (cancelled) return
        setLoadError(err instanceof Error ? err.message : 'No pudimos cargar tus umbrales')
      })

    return () => { cancelled = true }
  }, [])

  function setField(key: keyof ThresholdForm, value: string) {
    setForm(prev => (prev ? { ...prev, [key]: value } : prev))
    setSaved(false)
  }

  const values = form
    ? FIELDS.map(f => parseFloat(form[f.key].replace(',', '.')))
    : []
  const allValid = values.length > 0 && values.every(v => !Number.isNaN(v) && v > 0)

  async function handleSave() {
    if (!form || !allValid || saving) return
    setSaving(true)
    setError('')

    try {
      await api.put('/users/me/thresholds', {
        ars: parseFloat(form.ars.replace(',', '.')),
        usd: parseFloat(form.usd.replace(',', '.')),
        eur: parseFloat(form.eur.replace(',', '.')),
        btcUsd: parseFloat(form.btcUsd.replace(',', '.')),
      })
      setSaved(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos guardar los cambios')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 460 }}>
      <div>
        <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 24, color: C.text, margin: 0 }}>
          Umbrales de confirmación
        </h2>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: C.muted, marginTop: 4, lineHeight: 1.5 }}>
          Las operaciones que superen estos montos no se ejecutan al instante:
          te enviamos un correo para que las confirmes.
        </p>
      </div>

      {loadError && (
        <div role="alert" style={{ padding: '12px 14px', borderRadius: 10, background: 'rgba(226,112,95,0.1)', border: `1px solid ${C.danger}`, color: C.danger, fontFamily: 'Inter, sans-serif', fontSize: 13 }}>
          {loadError}
        </div>
      )}

      {!form && !loadError && (
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: C.muted }}>Cargando…</p>
      )}

      {form && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: C.radius, padding: 24 }}>
          {FIELDS.map(({ key, label, hint }) => {
            const raw = parseFloat(form[key].replace(',', '.'))
            const invalid = form[key] !== '' && (Number.isNaN(raw) || raw <= 0)

            return (
              <div key={key}>
                <label htmlFor={`th-${key}`} style={labelStyle}>
                  {label} <span style={{ color: C.mutedDark }}>· {hint}</span>
                </label>
                <input
                  id={`th-${key}`}
                  type="number"
                  min="0"
                  step="any"
                  value={form[key]}
                  onChange={e => setField(key, e.target.value)}
                  style={{ ...fieldStyle, borderColor: invalid ? C.danger : C.cardBorder }}
                />
              </div>
            )
          })}

          {error && (
            <div role="alert" style={{ padding: '12px 14px', borderRadius: 10, background: 'rgba(226,112,95,0.1)', border: `1px solid ${C.danger}`, color: C.danger, fontFamily: 'Inter, sans-serif', fontSize: 13 }}>
              {error}
            </div>
          )}

          {saved && (
            <div role="status" style={{ padding: '12px 14px', borderRadius: 10, background: 'rgba(242,212,136,0.08)', border: `1px solid ${C.cardBorder}`, color: C.gold, fontFamily: 'Inter, sans-serif', fontSize: 13 }}>
              Umbrales guardados
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={!allValid || saving}
            style={{
              padding: '14px 0', borderRadius: 12, border: 'none',
              background: !allValid || saving ? 'rgba(242,212,136,0.2)' : `linear-gradient(135deg, ${C.gold}, ${C.goldMid})`,
              color: !allValid || saving ? C.mutedDark : '#161311',
              fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 15,
              cursor: !allValid || saving ? 'not-allowed' : 'pointer',
            }}>
            {saving ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </div>
      )}
    </div>
  )
}