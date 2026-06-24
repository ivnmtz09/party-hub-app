import { useState, useEffect, useRef } from 'react'
import { Clock, MessageCircle } from 'lucide-react'
import { useGame } from '../context/GameContext'
import ArcadeHeader from '../components/ArcadeHeader'
import BackButton from '../../../components/BackButton'

const DEBATE_SECONDS = 120

export default function DebatePage() {
  const { state, nextPhase } = useGame()
  const [secondsLeft, setSecondsLeft] = useState(DEBATE_SECONDS)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!state || state.phase !== 'Debate') return

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [state])

  if (!state || state.phase !== 'Debate') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 text-gray-500 dark:text-gray-400 font-black uppercase tracking-wider">
        No hay partida activa
      </div>
    )
  }

  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60
  const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  const isUrgent = secondsLeft <= 10 && secondsLeft > 0
  const isOver = secondsLeft === 0

  const handleEnd = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    nextPhase()
  }

  return (
    <div className="relative min-h-[100dvh] bg-gray-50 dark:bg-gray-950 text-black dark:text-white flex flex-col animate-fade-in-up">
      <BackButton to="/arcade" />
      <ArcadeHeader />
      <div className="flex-1 flex flex-col items-center justify-center gap-6 max-w-md mx-auto w-full p-4 pt-20">
        <div className="flex items-center gap-2">
          <MessageCircle size={28} strokeWidth={2.5} className="text-fuchsia-500 dark:text-fuchsia-400" />
          <p className="text-xs font-black uppercase tracking-widest text-fuchsia-500 dark:text-fuchsia-400">
            Fase de Debate
          </p>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-widest text-center">
          Tiempo de Debate
        </h1>

        <div
          className={`w-full border-4 border-black dark:border-white p-8 text-center transition-colors duration-300 ${
            isUrgent
              ? 'bg-red-500 dark:bg-red-600 shadow-brutal-lg dark:shadow-brutal-lg-dark animate-pulse'
              : isOver
                ? 'bg-gray-300 dark:bg-gray-700 shadow-brutal dark:shadow-brutal-dark'
                : 'bg-white dark:bg-gray-800 shadow-brutal dark:shadow-brutal-dark'
          }`}
        >
          <Clock
            size={40}
            strokeWidth={2.5}
            className={`mx-auto mb-4 ${
              isUrgent
                ? 'text-white'
                : isOver
                  ? 'text-gray-500 dark:text-gray-400'
                  : 'text-black dark:text-white'
            }`}
          />
          <p
            className={`text-6xl sm:text-7xl font-black tabular-nums ${
              isUrgent
                ? 'text-white'
                : isOver
                  ? 'text-gray-500 dark:text-gray-400'
                  : 'text-black dark:text-white'
            }`}
          >
            {isOver ? '00:00' : display}
          </p>
          <p
            className={`text-xs font-black uppercase tracking-wider mt-3 ${
              isUrgent
                ? 'text-white'
                : isOver
                  ? 'text-gray-500 dark:text-gray-400'
                  : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {isOver ? 'Tiempo agotado' : isUrgent ? '¡Ultimos segundos!' : 'Tiempo restante'}
          </p>
        </div>

        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 text-center max-w-xs">
          Discutan y defiendan sus posturas. Los civiles deben encontrar al impostor.
        </p>
      </div>

      <div className="pb-6 max-w-md mx-auto w-full">
        <button
          onClick={handleEnd}
          className="w-full flex items-center justify-center gap-2 py-4 border-4 border-black dark:border-white bg-yellow-300 dark:bg-yellow-400 text-black dark:text-gray-900 font-black uppercase tracking-wider text-base sm:text-lg shadow-brutal dark:shadow-brutal-dark active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
        >
          <MessageCircle size={22} strokeWidth={2.5} />
          {isOver ? 'Ir a Votacion' : 'Finalizar Debate / Ir a Votacion'}
        </button>
      </div>
    </div>
  )
}
