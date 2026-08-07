import { useState } from 'react'
import ImpostorCard from '../components/ImpostorCard'
import GameHeader from '../../../components/GameHeader'
import { useGame } from '../context/GameContext'

export default function RoleRevealPage() {
  const { state, nextPhase } = useGame()
  const [currentIndex, setCurrentIndex] = useState(0)

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

  const handlePass = () => {
    if (!isLastPlayer) {
      setCurrentIndex((i) => i + 1)
    } else {
      nextPhase()
    }
  }

  return (
    <div className="min-h-[100dvh] bg-gray-50 dark:bg-gray-950 text-black dark:text-white flex flex-col animate-fade-in-up">
      <GameHeader title="El Impostor" backTo="/arcade" />
      <div className="flex-1 flex flex-col items-center justify-center gap-6 max-w-md mx-auto w-full p-4">
        <div className="text-center">
          <p className="text-xs font-black uppercase tracking-widest text-fuchsia-500 dark:text-fuchsia-400">
            Revelacion de roles
          </p>
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider mt-1">
            Pasa el telefono a{' '}
            <span className="text-fuchsia-600 dark:text-fuchsia-400">
              {currentPlayer.name.split(' ')[0]}
            </span>
          </h1>
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-1">
            {currentIndex + 1} de {players.length}
          </p>
        </div>

        <ImpostorCard
          isImpostor={currentPlayer.isImpostor}
          word={currentPlayer.assignedWord}
          description={currentPlayer.description}
          clue={currentPlayer.hint}
          categoria={currentPlayer.categoria}
          cluesEnabled={state.config.cluesEnabled}
          onPass={handlePass}
        />

        <p className="text-[10px] sm:text-xs font-bold text-gray-400 dark:text-gray-500 text-center max-w-xs">
          Asegurate de que los demas jugadores no vean la pantalla en el momento de tu rol
        </p>
      </div>
    </div>
  )
}