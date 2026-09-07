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


const FAB    = 56
const GAP    = 12
const MARGIN = 16

let msgId = 0

export default function ChatBot() {
  const [open, setOpen]       = useState(false)
  const [pos, setPos]         = useState<{ x: number; y: number } | null>(null)
  const [messages, setMessages] = useState<Message[]>([
    { id: ++msgId, from: 'bot', text: '¡Hola! Soy el asistente de Cheese Cash. ¿En qué puedo ayudarte hoy?' },
  ])
  const [input, setInput]     = useState('')
  const [typing, setTyping]   = useState(false)
  const bottomRef             = useRef<HTMLDivElement>(null)

  /* scroll al último mensaje */
  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  /* ── Drag logic (sin re-renders durante el drag) ── */
  const fabRef     = useRef<HTMLButtonElement>(null)
  const dragging   = useRef(false)
  const hasDragged = useRef(false)
  const startPtr   = useRef({ x: 0, y: 0 })
  const startPos   = useRef({ x: 0, y: 0 })

  function onPointerDown(e: React.PointerEvent<HTMLButtonElement>) {
    dragging.current   = true
    hasDragged.current = false
    startPtr.current   = { x: e.clientX, y: e.clientY }
    const rect = e.currentTarget.getBoundingClientRect()
    startPos.current = { x: rect.left, y: rect.top }
    if (!pos) setPos({ x: rect.left, y: rect.top })
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function onPointerMove(e: React.PointerEvent<HTMLButtonElement>) {
    if (!dragging.current) return
    const dx = e.clientX - startPtr.current.x
    const dy = e.clientY - startPtr.current.y
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) hasDragged.current = true
    const newX = Math.min(Math.max(0, startPos.current.x + dx), window.innerWidth  - FAB)
    const newY = Math.min(Math.max(0, startPos.current.y + dy), window.innerHeight - FAB)
    if (fabRef.current) {
      fabRef.current.style.left   = `${newX}px`
      fabRef.current.style.top    = `${newY}px`
      fabRef.current.style.bottom = 'auto'
      fabRef.current.style.right  = 'auto'
    }
  }

  function onPointerUp(e: React.PointerEvent<HTMLButtonElement>) {
    dragging.current = false
    if (!hasDragged.current) {
      setOpen(v => !v)
    } else {
      const dx = e.clientX - startPtr.current.x
      const dy = e.clientY - startPtr.current.y
      setPos({
        x: Math.min(Math.max(0, startPos.current.x + dx), window.innerWidth  - FAB),
        y: Math.min(Math.max(0, startPos.current.y + dy), window.innerHeight - FAB),
      })
    }
  }

  /* ── Panel position (encima o debajo según espacio) ── */
  const panelW  = 360
  const panelH  = 500
  const fabX = pos?.x ?? (window.innerWidth  - FAB - MARGIN)
  const fabY = pos?.y ?? (window.innerHeight - FAB - MARGIN)
  const panelLeft = Math.min(
    Math.max(MARGIN, fabX + FAB - panelW),
    window.innerWidth - panelW - MARGIN,
  )
  const spaceAbove = fabY
  const panelTop   = spaceAbove >= panelH + GAP
    ? fabY - panelH - GAP
    : fabY + FAB + GAP

  /* ── Mensajes ── */
  async function sendMessage(text: string) {
    if (!text.trim()) return
    setMessages(prev => [...prev, { id: ++msgId, from: 'user', text: text.trim() }])
    setInput('')
    setTyping(true)

    try {
      const res = await fetch('https://cheesecash-back-production.up.railway.app/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text.trim() }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { id: ++msgId, from: 'bot', text: data.reply }])
    } catch {
      setMessages(prev => [...prev, { id: ++msgId, from: 'bot', text: 'Hubo un error al conectar con el asistente. Intentá de nuevo.' }])
    } finally {
      setTyping(false)
    }
  }

  return (
    <>
      {/* ── FAB arrastrable ── */}
      <button
        ref={fabRef}
        className="chat-fab"
        style={pos ? { left: pos.x, top: pos.y, bottom: 'auto', right: 'auto' } : {}}
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