import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trophy, Frown, RotateCcw, Home } from 'lucide-react'
import { useGame } from '../context/GameContext'
import GameHeader from '../../../components/GameHeader'
import { guardarPartidaImpostor } from '../../../firebase/services'

export default function ResultsPage() {
  const navigate = useNavigate()
  const { state, resetGame } = useGame()

  useEffect(() => {
    if (!state) return
    guardarPartidaImpostor({
      playerNames: state.config.playerNames,
      roles: state.players.map((p) => ({ name: p.name, isImpostor: p.isImpostor })),
    })
  }, [state])

  if (!state || state.phase !== 'Result') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 text-gray-500 dark:text-gray-400 font-black uppercase tracking-wider">
        No hay partida activa
      </div>
    )
  }

  const impostor = state.players.find((p) => p.isImpostor)
  const votedPlayer = state.votedPlayer
  const votedIsImpostor = votedPlayer
    ? state.players.find((p) => p.name === votedPlayer)?.isImpostor
    : false

  const civiliansWin = votedIsImpostor === true
  const secretWord = impostor?.assignedWord ?? ''

  const handlePlayAgain = () => {
    resetGame()
  }

  const handleGoHome = () => {
    resetGame()
    navigate('/arcade')
  }

  return (
    <div className={`min-h-[100dvh] flex flex-col p-4 animate-fade-in-up ${
      civiliansWin
        ? 'bg-emerald-500 dark:bg-emerald-700'
        : 'bg-red-600 dark:bg-red-800'
    }`}>
      <GameHeader title="Resultados" backTo="/arcade" />
      <div className="flex-1 flex flex-col items-center justify-center gap-6 max-w-md mx-auto w-full">
        <div className="w-20 h-20 border-4 border-black dark:border-white flex items-center justify-center bg-white dark:bg-gray-900 shadow-brutal dark:shadow-brutal-dark">
          {civiliansWin ? (
            <Trophy size={44} strokeWidth={2.5} className="text-yellow-500" />
          ) : (
            <Frown size={44} strokeWidth={2.5} className="text-red-500" />
          )}
        </div>

        <h1 className={`text-3xl sm:text-4xl font-black uppercase tracking-widest text-center ${
          civiliansWin ? 'text-white' : 'text-white'
        }`}>
          {civiliansWin
            ? 'Impostor Descubierto'
            : 'Los Civiles Perdieron'}
        </h1>

        <div className="w-full border-4 border-black dark:border-white bg-white dark:bg-gray-800 p-6 shadow-brutal dark:shadow-brutal-dark space-y-4">
          {civiliansWin ? (
            <>
              <p className="font-black uppercase tracking-wider text-sm text-center text-emerald-600 dark:text-emerald-400">
                Los civiles atraparon al impostor
              </p>
              <div className="border-t-2 border-black dark:border-white pt-4">
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  El impostor era
                </p>
                <p className="text-xl font-black text-black dark:text-white mt-1">
                  {impostor?.name ?? 'Desconocido'}
                </p>
              </div>
              <div className="border-t-2 border-black dark:border-white pt-4">
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Palabra secreta
                </p>
                <p className="text-lg font-black text-black dark:text-white mt-1">
                  {secretWord}
                </p>
              </div>
            </>
          ) : (
            <>
              <p className="font-black uppercase tracking-wider text-sm text-center text-red-600 dark:text-red-400">
                El impostor logro escapar
              </p>
              <div className="border-t-2 border-black dark:border-white pt-4">
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  El verdadero impostor era
                </p>
                <p className="text-xl font-black text-black dark:text-white mt-1">
                  {impostor?.name ?? 'Desconocido'}
                </p>
              </div>
              <div className="border-t-2 border-black dark:border-white pt-4">
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Palabra secreta
                </p>
                <p className="text-lg font-black text-black dark:text-white mt-1">
                  {secretWord}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="pb-6 max-w-md mx-auto w-full space-y-3">
        <button
          onClick={handlePlayAgain}
          className="w-full flex items-center justify-center gap-2 py-4 border-4 border-black dark:border-white bg-yellow-300 dark:bg-yellow-400 text-black dark:text-gray-900 font-black uppercase tracking-wider text-base sm:text-lg shadow-brutal dark:shadow-brutal-dark active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
        >
          <RotateCcw size={22} strokeWidth={2.5} />
          Jugar de Nuevo
        </button>
        <button
          onClick={handleGoHome}
          className="w-full flex items-center justify-center gap-2 py-3 border-4 border-black dark:border-white bg-white dark:bg-gray-800 text-black dark:text-white font-black uppercase tracking-wider text-sm shadow-brutal dark:shadow-brutal-dark active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
        >
          <Home size={18} strokeWidth={2.5} />
          Volver al Arcade
        </button>
      </div>
    </div>
  )
}
