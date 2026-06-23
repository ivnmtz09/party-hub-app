import { useState, useCallback } from 'react'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = a[i]!
    a[i] = a[j]!
    a[j] = tmp
  }
  return a
}

export function useCardGame(cartas: string[]) {
  const [remaining, setRemaining] = useState<string[]>(() => shuffle([...cartas]))
  const [current, setCurrent] = useState<string | null>(null)
  const [playedCount, setPlayedCount] = useState(0)

  const barajar = useCallback(() => {
    setRemaining(shuffle([...cartas]))
    setCurrent(null)
    setPlayedCount(0)
  }, [cartas])

  const obtenerSiguiente = useCallback(() => {
    if (remaining.length === 0) {
      setCurrent(null)
      return null
    }
    const next = remaining[0] ?? null
    const rest = remaining.slice(1)
    setCurrent(next)
    setRemaining(rest)
    setPlayedCount((c) => c + 1)
    return next
  }, [remaining])

  return {
    cartasRestantes: remaining.length,
    cartaActual: current,
    totalCartas: cartas.length,
    cartasJugadas: playedCount,
    barajar,
    obtenerSiguiente,
  } as const
}
