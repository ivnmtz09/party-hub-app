export interface Word {
  id: number
  word: string
  categoria: string
  description: string
  clue: string
}

export interface PlayerRole {
  name: string
  isImpostor: boolean
  assignedWord: string
  hint: string
  description: string
}

export type GamePhase = 'Setup' | 'Reveal' | 'Debate' | 'Voting' | 'Result'

export interface GameConfig {
  playerNames: string[]
  impostorCount: number
  categories: string[]
  cluesEnabled: boolean
}

export interface GameState {
  phase: GamePhase
  players: PlayerRole[]
  config: GameConfig
  round: number
  votedPlayer: string | null
}
