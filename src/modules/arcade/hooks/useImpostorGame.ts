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
  const { playerNames, impostorCount, categories } = config

  const filtered = words.filter((w) => categories.includes(w.categoria))
  if (filtered.length === 0) throw new Error('No words for selected categories')

  const availableCategories = Array.from(new Set(filtered.map((w) => w.categoria)))
  const pickedCategory = availableCategories[Math.floor(Math.random() * availableCategories.length)]
  const categoryWords = filtered.filter((w) => w.categoria === pickedCategory)
  const selected = categoryWords[Math.floor(Math.random() * categoryWords.length)]
  if (!selected) throw new Error('Failed to pick a word')

  const shuffled = shuffle(playerNames)
  const impostorNames = new Set(shuffled.slice(0, Math.min(impostorCount, playerNames.length)))

  return playerNames.map((name) => ({
    name,
    isImpostor: impostorNames.has(name),
    assignedWord: selected.word,
    hint: selected.clue,
    description: selected.description,
    categoria: selected.categoria,
  }))
}

const PHASE_ORDER: GamePhase[] = ['Setup', 'Reveal', 'Debate', 'Voting', 'Result']

export function useImpostorGame(words: Word[] = allWords) {
  const [state, setState] = useState<GameState | null>(null)

  const startGame = useCallback((configGame: GameConfig) => {
    const players = assignRoles(configGame, words)
    setState({
      phase: 'Reveal',
      players,
      config: configGame,
      round: 1,
      votedPlayer: null,
    })
  }, [words])

  const nextPhase = useCallback(() => {
    setState((prev) => {
      if (!prev) return prev
      const currentIndex = PHASE_ORDER.indexOf(prev.phase)
      if (currentIndex === -1 || currentIndex >= PHASE_ORDER.length - 1) return prev
      const nextPhaseValue = PHASE_ORDER[currentIndex + 1]!
      return {
        ...prev,
        phase: nextPhaseValue,
        round: nextPhaseValue === 'Setup' ? prev.round + 1 : prev.round,
      }
    })
  }, [])

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
