import { useState, useCallback } from 'react'
import type { GameState, GameConfig, PlayerRole, GamePhase, Word } from '../types'
import { allWords } from '../data/words'

function shuffle<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = arr[i] as T
    arr[i] = arr[j] as T
    arr[j] = temp
  }
  return arr
}

function assignRoles(config: GameConfig, words: Word[]): PlayerRole[] {
  const { playerNames, impostorCount, categories, includeHint } = config

  const filtered = words.filter((w) => categories.includes(w.categoria))
  if (filtered.length === 0) throw new Error('No words for selected categories')

  const selected = filtered[Math.floor(Math.random() * filtered.length)]
  if (!selected) throw new Error('Failed to pick a word')

  const shuffled = shuffle(playerNames)
  const impostorNames = new Set(shuffled.slice(0, Math.min(impostorCount, playerNames.length)))

  return playerNames.map((name) => ({
    name,
    isImpostor: impostorNames.has(name),
    assignedWord: selected.palabra,
    hint: includeHint ? selected.categoria : '',
    ejemplo: selected.ejemplo,
  }))
}

const PHASE_ORDER: GamePhase[] = ['Setup', 'Reveal', 'Debate', 'Voting', 'Result']

export function useImpostorGame() {
  const [state, setState] = useState<GameState | null>(null)

  const startGame = useCallback((config: GameConfig) => {
    const players = assignRoles(config, allWords)
    setState({
      phase: 'Reveal',
      players,
      config,
      round: 1,
      votedPlayer: null,
    })
  }, [])

  const nextPhase = useCallback(() => {
    if (!state) return
    const currentIndex = PHASE_ORDER.indexOf(state.phase)
    if (currentIndex === -1 || currentIndex >= PHASE_ORDER.length - 1) return
    const nextPhaseValue = PHASE_ORDER[currentIndex + 1]!
    setState({
      ...state,
      phase: nextPhaseValue,
      round: nextPhaseValue === 'Setup' ? state.round + 1 : state.round,
    })
  }, [state])

  const castVote = useCallback((playerName: string) => {
    setState((prev) => {
      if (!prev || prev.phase !== 'Voting') return prev
      return { ...prev, votedPlayer: playerName }
    })
  }, [])

  const resetGame = useCallback(() => {
    setState(null)
  }, [])

  return {
    state,
    startGame,
    nextPhase,
    castVote,
    resetGame,
  }
}
