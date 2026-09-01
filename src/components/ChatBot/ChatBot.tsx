import { useState, useRef, useEffect } from 'react'
import './ChatBot.css'

interface Message {
  id: number
  text: string
  from: 'bot' | 'user'
}

const QUICK_REPLIES = [
  '¿Cómo compro monedas?',
  '¿Qué tipo de cambio hay?',
  '¿Cómo funciona el intercambio?',
  '¿Es segura mi plata?',
]

const BOT_ANSWERS: Record<string, string> = {
  '¿Cómo compro monedas?':
    'En el dashboard vas a ver tu billetera. Elegís la moneda que querés comprar, indicás el monto y confirmás. La tasa de cambio se aplica en tiempo real.',
  '¿Qué tipo de cambio hay?':
    'Podés ver las tasas de cambio disponibles en la sección Conversor. Las cotizaciones corresponden a las monedas soportadas: ARS, USD, EUR y BTC.',
  '¿Cómo funciona el intercambio?':
    'Podés convertir entre ARS, USD, EUR y BTC directamente desde tu billetera. El saldo se actualiza una vez confirmada la operación.',
  '¿Es segura mi plata?':
    'Todos los saldos son ficticios y solo para uso dentro de la plataforma. Tus datos están protegidos con JWT y conexiones seguras.',
}

const FAB   = 56
const GAP   = 12
const MARGIN = 16

let msgId = 0

export default function ChatBot() {
  const [open, setOpen]       = useState(false)
  const [pos, setPos]         = useState({ x: 0, y: 0 })
  const [ready, setReady]     = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { id: ++msgId, from: 'bot', text: '¡Hola! Soy el asistente de Cheese Cash. ¿En qué puedo ayudarte hoy?' },
  ])
  const [input, setInput]     = useState('')
  const [typing, setTyping]   = useState(false)
  const bottomRef             = useRef<HTMLDivElement>(null)

  /* posición inicial: esquina inferior derecha */
  useEffect(() => {
    setPos({
      x: window.innerWidth  - FAB - MARGIN,
      y: window.innerHeight - FAB - MARGIN,
    })
    setReady(true)
  }, [])

  /* scroll al último mensaje */
  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  /* ── Drag logic ── */
  const dragging   = useRef(false)
  const hasDragged = useRef(false)
  const startPtr   = useRef({ x: 0, y: 0 })
  const startPos   = useRef({ x: 0, y: 0 })

  function onPointerDown(e: React.PointerEvent<HTMLButtonElement>) {
    dragging.current   = true
    hasDragged.current = false
    startPtr.current   = { x: e.clientX, y: e.clientY }
    startPos.current   = { ...pos }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function onPointerMove(e: React.PointerEvent<HTMLButtonElement>) {
    if (!dragging.current) return
    const dx = e.clientX - startPtr.current.x
    const dy = e.clientY - startPtr.current.y
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) hasDragged.current = true
    setPos({
      x: Math.min(Math.max(0, startPos.current.x + dx), window.innerWidth  - FAB),
      y: Math.min(Math.max(0, startPos.current.y + dy), window.innerHeight - FAB),
    })
  }

  function onPointerUp() {
    dragging.current = false
    if (!hasDragged.current) setOpen(v => !v)
  }

  /* ── Panel position (encima o debajo según espacio) ── */
  const panelW  = 360
  const panelH  = 500
  const panelLeft = Math.min(
    Math.max(MARGIN, pos.x + FAB - panelW),
    window.innerWidth - panelW - MARGIN,
  )
  const spaceAbove = pos.y
  const panelTop   = spaceAbove >= panelH + GAP
    ? pos.y - panelH - GAP
    : pos.y + FAB + GAP

  /* ── Mensajes ── */
  function sendMessage(text: string) {
    if (!text.trim()) return
    setMessages(prev => [...prev, { id: ++msgId, from: 'user', text: text.trim() }])
    setInput('')
    setTyping(true)
    setTimeout(() => {
      const reply =
        BOT_ANSWERS[text.trim()] ??
        'Anotado. Por ahora puedo ayudarte con preguntas sobre cómo usar la plataforma. Estamos trabajando para que el asistente responda más consultas pronto.'
      setTyping(false)
      setMessages(prev => [...prev, { id: ++msgId, from: 'bot', text: reply }])
    }, 900)
  }

  if (!ready) return null

  return (
    <>
      {/* ── FAB arrastrable ── */}
      <button
        className="chat-fab"
        style={{ left: pos.x, top: pos.y, bottom: 'auto', right: 'auto', cursor: dragging.current ? 'grabbing' : 'grab' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        aria-label="Abrir asistente"
        title="Asistente Cheese Cash"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M20 2H4C2.9 2 2 2.9 2 4v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2Z"
            fill="#161311"
          />
        </svg>
      </button>

      {/* ── Panel de chat ── */}
      {open && (
        <div
          className="chat-panel"
          style={{ left: panelLeft, top: panelTop, bottom: 'auto', right: 'auto' }}
        >
          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-info">
              <div className="chat-avatar">🧀</div>
              <div>
                <div className="chat-header-name">Asistente Cheese Cash</div>
                <div className="chat-header-status">● En línea</div>
              </div>
            </div>
            <button className="chat-close" onClick={() => setOpen(false)}>✕</button>
          </div>

          {/* Mensajes */}
          <div className="chat-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`chat-bubble ${msg.from}`}>
                {msg.from === 'bot' && <div className="bubble-avatar">🧀</div>}
                <div className="bubble-text">{msg.text}</div>
              </div>
            ))}
            {typing && (
              <div className="chat-bubble">
                <div className="bubble-avatar">🧀</div>
                <div className="chat-typing">
                  <span /><span /><span />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Respuestas rápidas */}
          <div className="chat-chips">
            {QUICK_REPLIES.map((q) => (
              <button key={q} className="chat-chip" onClick={() => sendMessage(q)}>
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="chat-input-area">
            <input
              className="chat-input"
              placeholder="Escribí tu consulta..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
            />
            <button className="chat-send" onClick={() => sendMessage(input)} aria-label="Enviar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13" stroke="#161311" strokeWidth="2" strokeLinecap="round" />
                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="#161311" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  )
}
