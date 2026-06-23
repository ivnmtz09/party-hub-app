import { useState } from 'react'
import { Check, Vote } from 'lucide-react'
import { useGame } from '../context/GameContext'
import ArcadeHeader from '../components/ArcadeHeader'

export default function VotingPage() {
  const { state, castVote, nextPhase } = useGame()
  const [selected, setSelected] = useState<string | null>(null)

  if (!state || state.phase !== 'Voting') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 text-gray-500 dark:text-gray-400 font-black uppercase tracking-wider">
        No hay partida activa
      </div>
    )
  }

  const handleConfirm = () => {
    if (!selected) return
    castVote(selected)
    nextPhase()
  }

  return (
    <div className="min-h-[100dvh] bg-gray-50 dark:bg-gray-950 text-black dark:text-white flex flex-col animate-fade-in-up">
      <ArcadeHeader />
      <div className="flex-1 flex flex-col items-center justify-center gap-8 max-w-md mx-auto w-full p-4">
        <div className="text-center">
          <p className="text-xs font-black uppercase tracking-widest text-fuchsia-500 dark:text-fuchsia-400">
            Fase de Votacion
          </p>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-widest mt-1">
            Hora de Votar
          </h1>
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-2">
            Selecciona a quien crees que es el impostor
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 w-full">
          {state.players.map((player) => {
            const isSelected = selected === player.name
            return (
              <button
                key={player.name}
                onClick={() => setSelected(isSelected ? null : player.name)}
                className={`flex flex-col items-center gap-2 py-5 border-4 border-black dark:border-white font-black uppercase tracking-wider text-sm transition-all ${
                  isSelected
                    ? 'bg-black dark:bg-white text-white dark:text-black shadow-brutal dark:shadow-brutal-dark'
                    : 'bg-white dark:bg-gray-800 text-black dark:text-white shadow-brutal dark:shadow-brutal-dark active:translate-x-1 active:translate-y-1 active:shadow-none'
                }`}
              >
                <div
                  className={`w-12 h-12 border-2 border-black dark:border-white flex items-center justify-center text-lg ${
                    isSelected
                      ? 'bg-white dark:bg-gray-900 text-black dark:text-white'
                      : 'bg-yellow-300 dark:bg-yellow-400 text-black dark:text-gray-900'
                  }`}
                >
                  {isSelected ? (
                    <Check size={22} strokeWidth={3} />
                  ) : (
                    <span className="font-black">{player.name.charAt(0)}</span>
                  )}
                </div>
                <span className="text-xs">{player.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="pb-6 max-w-md mx-auto w-full">
        <button
          onClick={handleConfirm}
          disabled={!selected}
          className="w-full flex items-center justify-center gap-2 py-4 border-4 border-black dark:border-white bg-fuchsia-400 dark:bg-fuchsia-500 text-black dark:text-gray-900 font-black uppercase tracking-wider text-base sm:text-lg shadow-brutal dark:shadow-brutal-dark active:translate-x-1 active:translate-y-1 active:shadow-none transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Vote size={22} strokeWidth={2.5} />
          Confirmar Voto
        </button>
      </div>
    </div>
  )
}
