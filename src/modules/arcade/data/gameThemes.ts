export interface GameTheme {
  gradient: string
  turbio?: boolean
}

export const GAME_THEMES: Record<string, GameTheme> = {
  impostor: { gradient: 'from-fuchsia-500 to-pink-600' },
  dedo: { gradient: 'from-emerald-400 to-teal-600', turbio: true },
  'yo-nunca': { gradient: 'from-violet-500 to-indigo-700', turbio: true },
  bomba: { gradient: 'from-red-500 to-rose-600', turbio: true },
  'codigo-secreto': { gradient: 'from-cyan-400 to-blue-600' },
  frente: { gradient: 'from-amber-400 to-yellow-600' },
  ruleta: { gradient: 'from-orange-400 to-red-500' },
}