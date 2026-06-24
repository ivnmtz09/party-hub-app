export interface Word {
  palabra: string
  categoria: string
  pista: string
  ejemplo: string
}

export interface PlayerRole {
  name: string
  isImpostor: boolean
  assignedWord: string
  hint: string
  ejemplo: string
}

export type GamePhase = 'Setup' | 'Reveal' | 'Debate' | 'Voting' | 'Result'

export interface GameConfig {
  playerNames: string[]
  impostorCount: number
  categories: string[]
  includeHint: boolean
}

export interface GameState {
  phase: GamePhase
  players: PlayerRole[]
  config: GameConfig
  round: number
  votedPlayer: string | null
}
