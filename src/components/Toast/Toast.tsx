import { useEffect } from 'react'
import './Toast.css'

interface ToastProps {
  message: string
  type?: 'success' | 'error'
  onClose: () => void
}

export default function Toast({ message, type = 'success', onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000)
    return () => clearTimeout(timer)
  }, [onClose])

  const icon = type === 'success' ? '✓' : '✕'

  return (
    <div className={`toast ${type}`}>
      <span>{icon}</span>
      <span>{message}</span>
    </div>
  )
}
