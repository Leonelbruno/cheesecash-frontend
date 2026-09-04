import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import CheeseCashLogo from './CheeseCashLogo'

describe('CheeseCashLogo', () => {
  it('renderiza la moneda sola por defecto', () => {
    render(<CheeseCashLogo />)

    expect(screen.getByRole('img', { name: 'Cheese Cash' })).toBeInTheDocument()
    expect(screen.queryByText('Cheese Cash')).not.toBeInTheDocument()
  })

  it('muestra el nombre cuando se pide', () => {
    render(<CheeseCashLogo withName />)

    expect(screen.getByText('Cheese Cash')).toBeInTheDocument()
  })

  it('aplica el tamaño que recibe', () => {
    render(<CheeseCashLogo size={28} />)

    const svg = screen.getByRole('img', { name: 'Cheese Cash' })
    expect(svg).toHaveStyle({ width: '28px', height: '28px' })
  })

  it('genera ids de gradiente distintos por instancia', () => {
    const { container } = render(
      <>
        <CheeseCashLogo />
        <CheeseCashLogo />
      </>,
    )

    const ids = [...container.querySelectorAll('radialGradient, linearGradient')]
      .map(g => g.id)

    // dos logos, tres gradientes cada uno, todos únicos
    expect(ids).toHaveLength(6)
    expect(new Set(ids).size).toBe(6)
  })
})