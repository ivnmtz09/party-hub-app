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

function initGameState(cartas: string[]) {
  const shuffled = shuffle([...cartas])
  return {
    remaining: shuffled.slice(1),
    current: shuffled[0] ?? null,
    playedCount: 1,
  }
}

export function useCardGame(cartas: string[]) {
  const [state, setState] = useState(() => initGameState(cartas))

  const barajar = useCallback(() => {
    setState(initGameState(cartas))
  }, [cartas])

  const obtenerSiguiente = useCallback(() => {
    setState((prev) => {
      if (prev.remaining.length === 0) {
        return { ...prev, current: null }
      }
      const next = prev.remaining[0] ?? null
      return {
        remaining: prev.remaining.slice(1),
        current: next,
        playedCount: prev.playedCount + 1,
      }
    })
  }, [])

  return {
    cartasRestantes: state.remaining.length,
    cartaActual: state.current,
    totalCartas: cartas.length,
    cartasJugadas: state.playedCount,
    barajar,
    obtenerSiguiente,
  } as const
}
