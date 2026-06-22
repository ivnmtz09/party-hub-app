import { createContext, useContext, type ReactNode } from 'react'
import { useImpostorGame } from '../hooks/useImpostorGame'
import type { GameState, GameConfig } from '../types'

interface GameContextValue {
  state: GameState | null
  startGame: (config: GameConfig) => void
  nextPhase: () => void
  castVote: (playerName: string) => void
  resetGame: () => void
}

const GameContext = createContext<GameContextValue | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
  const game = useImpostorGame()
  return (
    <GameContext.Provider value={game}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used within a GameProvider')
  return ctx
}
