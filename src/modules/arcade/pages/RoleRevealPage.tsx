import { useState } from 'react'
import { Eye, EyeOff, MessageCircle } from 'lucide-react'
import FlipCard from '../components/FlipCard'
import ArcadeHeader from '../components/ArcadeHeader'
import GameHeader from '../../../components/GameHeader'
import { useGame } from '../context/GameContext'

export default function RoleRevealPage() {
  const { state, nextPhase } = useGame()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)

  if (!state || state.phase !== 'Reveal') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 text-gray-500 dark:text-gray-400 font-black uppercase tracking-wider">
        No hay partida activa
      </div>
    )
  }

  const players = state.players
  const currentPlayer = players[currentIndex]
  if (!currentPlayer) return null

  const isLastPlayer = currentIndex === players.length - 1

  const handleAction = () => {
    if (!flipped) {
      setFlipped(true)
    } else if (!isLastPlayer) {
      setFlipped(false)
      setTimeout(() => setCurrentIndex((i) => i + 1), 500)
    } else {
      nextPhase()
    }
  }

  const buttonLabel = !flipped
    ? 'Ver mi rol'
    : isLastPlayer
      ? 'Iniciar Debate'
      : 'Ocultar y pasar'

  return (
    <div className="min-h-[100dvh] bg-gray-50 dark:bg-gray-950 text-black dark:text-white flex flex-col animate-fade-in-up">
      <ArcadeHeader />
      <GameHeader title="El Impostor" backTo="/arcade" />
      <div className="flex-1 flex flex-col items-center justify-center gap-6 max-w-md mx-auto w-full p-4">
        <div className="text-center">
          <p className="text-xs font-black uppercase tracking-widest text-fuchsia-500 dark:text-fuchsia-400">
            Revelacion de roles
          </p>
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider mt-1">
            Pasa el telefono a{' '}
            <span className="text-fuchsia-600 dark:text-fuchsia-400">
              {currentPlayer.name}
            </span>
          </h1>
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-1">
            {currentIndex + 1} de {players.length}
          </p>
        </div>

        <FlipCard
          flipped={flipped}
          isImpostor={currentPlayer.isImpostor}
          word={currentPlayer.assignedWord}
          hint={currentPlayer.hint}
          ejemplo={currentPlayer.ejemplo}
        />

        {!flipped && (
          <p className="text-[10px] sm:text-xs font-bold text-gray-400 dark:text-gray-500 text-center max-w-xs">
            Asegurate de que los demas jugadores no vean la pantalla
          </p>
        )}
      </div>

      <div className="pb-6 max-w-md mx-auto w-full">
        <button
          onClick={handleAction}
          className="w-full flex items-center justify-center gap-2 py-4 border-4 border-black dark:border-white bg-yellow-300 dark:bg-yellow-400 text-black dark:text-gray-900 font-black uppercase tracking-wider text-base sm:text-lg shadow-brutal dark:shadow-brutal-dark active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
        >
          {(() => {
            if (!flipped) return <Eye size={22} strokeWidth={2.5} />
            if (isLastPlayer) return <MessageCircle size={22} strokeWidth={2.5} />
            return <EyeOff size={22} strokeWidth={2.5} />
          })()}
          {buttonLabel}
        </button>
      </div>
    </div>
  )
}
