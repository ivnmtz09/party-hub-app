import { useState, useEffect, useRef, useCallback } from 'react'
import {
  finalizarTurnoFrente,
  type FrenteRoom,
} from '../../../firebase/services'
import { playWinSound, playTapSound } from '../../../utils/audio'
import { FAMOSOS } from '../data/famosos'
import GameHeader from '../../../components/GameHeader'
import { Check, X as XIcon, Trophy, Play, Clock } from 'lucide-react'

interface Props {
  room: FrenteRoom
  roomCode: string
  onLeave: () => Promise<void>
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!]
  }
  return shuffled
}

const TIEMPO_TURNO = 60

export default function FrenteGame({ room, roomCode, onLeave }: Props) {
  const [localPhase, setLocalPhase] = useState<'waiting' | 'playing' | 'round_over'>('waiting')
  const [timeLeft, setTimeLeft] = useState(TIEMPO_TURNO)
  const [score, setScore] = useState(0)
  const [currentName, setCurrentName] = useState('')
  const [namesRemaining, setNamesRemaining] = useState<string[]>(() => shuffleArray(FAMOSOS))
  const [nameIndex, setNameIndex] = useState(0)
  const [sending, setSending] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const currentTeam = room.teams[room.currentTeam]
  const isFinished = room.phase === 'finished'

  const advanceName = useCallback(() => {
    const idx = nameIndex + 1
    if (idx >= namesRemaining.length) {
      const reshuffled = shuffleArray(FAMOSOS)
      setNamesRemaining(reshuffled)
      setNameIndex(0)
      setCurrentName(reshuffled[0]!)
    } else {
      setNameIndex(idx)
      setCurrentName(namesRemaining[idx]!)
    }
  }, [nameIndex, namesRemaining])

  useEffect(() => {
    if (namesRemaining.length > 0 && nameIndex < namesRemaining.length) {
      setCurrentName(namesRemaining[nameIndex]!)
    }
  }, [nameIndex, namesRemaining])

  const startTimer = useCallback(() => {
    if (timerRef.current) return
    setTimeLeft(TIEMPO_TURNO)
    setScore(0)
    setLocalPhase('playing')
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current)
          timerRef.current = null
          setLocalPhase('round_over')
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  useEffect(() => {
    if (localPhase === 'round_over') {
      const sendScore = async () => {
        setSending(true)
        try {
          await finalizarTurnoFrente(roomCode, room.currentTeam, score)
        } catch {
          /* ignore */
        } finally {
          setSending(false)
        }
      }
      sendScore()
    }
  }, [localPhase, roomCode, room.currentTeam, score])

  useEffect(() => {
    if (room.phase === 'playing' && localPhase !== 'round_over') {
      setLocalPhase('waiting')
      setTimeLeft(TIEMPO_TURNO)
      setScore(0)
      setNamesRemaining(shuffleArray(FAMOSOS))
      setNameIndex(0)
    }
  }, [room.currentTeam, room.phase])

  const handleCorrect = () => {
    if (localPhase !== 'playing') return
    playWinSound()
    setScore((prev) => prev + 1)
    advanceName()
  }

  const handlePass = () => {
    if (localPhase !== 'playing') return
    playTapSound()
    advanceName()
  }

  const sortedTeams = [...room.teams].sort((a, b) => b.score - a.score)

  if (isFinished) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-black dark:text-white flex flex-col p-4 sm:p-6 transition-colors">
        <div className="w-full max-w-md mx-auto pt-2 pb-8">
          <GameHeader title="Frente a Frente" backTo="/arcade" />
        </div>

        <div className="flex-1 w-full max-w-md mx-auto flex flex-col gap-6">
          <div className="text-center">
            <Trophy size={48} strokeWidth={2.5} className="mx-auto mb-2 text-yellow-500" />
            <p className="text-2xl font-black uppercase tracking-wider text-black dark:text-white">
              Resultados Finales
            </p>
          </div>

          <div className="space-y-3">
            {sortedTeams.map((team, i) => (
              <div
                key={i}
                className={`border-4 border-black dark:border-white p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] ${
                  i === 0 ? 'bg-yellow-100 dark:bg-yellow-900/30' : 'bg-white dark:bg-gray-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {i === 0 && <Trophy size={20} strokeWidth={2.5} className="text-yellow-500" />}
                    <span className="text-lg font-black uppercase tracking-wider text-black dark:text-white">
                      {team.name}
                    </span>
                  </div>
                  <span className="text-2xl font-black text-purple-500 dark:text-purple-400">
                    {team.score}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={onLeave}
            className="w-full py-3 border-2 border-black dark:border-white bg-red-300 dark:bg-red-500 text-black dark:text-gray-900 font-black uppercase tracking-wider text-xs active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
          >
            <div className="flex items-center justify-center gap-2">
              <XIcon size={16} strokeWidth={2.5} />
              VOLVER AL LOBBY
            </div>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-black dark:text-white transition-colors overflow-hidden">
      {localPhase === 'waiting' && (
        <div className="h-screen flex flex-col p-4 sm:p-6">
          <div className="w-full max-w-md mx-auto pt-2 pb-8">
            <GameHeader title="Frente a Frente" backTo="/arcade" />
          </div>

          <div className="flex-1 w-full max-w-md mx-auto flex flex-col items-center justify-center gap-8">
            <div className="text-center">
              <div className="w-20 h-20 border-4 border-black dark:border-white bg-purple-300 dark:bg-purple-500 flex items-center justify-center mx-auto mb-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
                <Clock size={40} strokeWidth={2.5} className="text-black dark:text-gray-900" />
              </div>
              <p className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">
                Turno de
              </p>
              <p className="text-3xl font-black uppercase tracking-wider text-black dark:text-white">
                {currentTeam?.name ?? 'Equipo'}
              </p>
            </div>

            <button
              onClick={startTimer}
              className="w-full flex flex-col items-center justify-center gap-4 py-12 border-4 border-black dark:border-white bg-purple-400 dark:bg-purple-500 text-black dark:text-gray-900 font-black uppercase tracking-wider shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:shadow-[12px_12px_0px_0px_rgba(255,255,255,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
            >
              <Play size={40} strokeWidth={2.5} />
              <span className="text-xl">INICIAR TURNO ({TIEMPO_TURNO} SEGUNDOS)</span>
            </button>

            <button
              onClick={onLeave}
              className="w-full py-3 border-2 border-black dark:border-white bg-red-300 dark:bg-red-500 text-black dark:text-gray-900 font-black uppercase tracking-wider text-xs active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
            >
              <div className="flex items-center justify-center gap-2">
                <XIcon size={16} strokeWidth={2.5} />
                ABANDONAR
              </div>
            </button>
          </div>
        </div>
      )}

      {localPhase === 'playing' && (
        <div className="fixed inset-0 bg-gray-50 dark:bg-gray-950">
          {/* Tap zones (non-rotated) */}
          <div
            onClick={handlePass}
            className="absolute left-0 top-0 w-1/2 h-full z-30 flex items-center justify-center"
          >
            <div className="w-16 h-16 border-4 border-black dark:border-white bg-red-400 dark:bg-red-500 flex items-center justify-center opacity-60">
              <XIcon size={32} strokeWidth={2.5} className="text-black" />
            </div>
          </div>
          <div
            onClick={handleCorrect}
            className="absolute right-0 top-0 w-1/2 h-full z-30 flex items-center justify-center"
          >
            <div className="w-16 h-16 border-4 border-black dark:border-white bg-green-400 dark:bg-green-500 flex items-center justify-center opacity-60">
              <Check size={32} strokeWidth={2.5} className="text-black" />
            </div>
          </div>

          {/* Timer + Score (non-rotated) */}
          <div className="absolute top-4 left-4 z-40 flex items-center gap-2 border-2 border-black dark:border-white bg-white dark:bg-gray-800 px-3 py-1.5">
            <span className="text-lg font-black text-black dark:text-white">{timeLeft}s</span>
          </div>
          <div className="absolute top-4 right-4 z-40 flex items-center gap-2 border-2 border-black dark:border-white bg-white dark:bg-gray-800 px-3 py-1.5">
            <span className="text-lg font-black text-purple-500 dark:text-purple-400">{score}</span>
          </div>

          {/* Rotated content (for forehead mode) */}
          <div
            className="absolute inset-0 z-20 flex items-center justify-center"
            style={{ transform: 'rotate(90deg)', pointerEvents: 'none' }}
          >
            <p
              key={currentName}
              className="text-6xl sm:text-7xl md:text-8xl font-black uppercase text-center text-black dark:text-white px-8 leading-tight"
            >
              {currentName}
            </p>
          </div>
        </div>
      )}

      {localPhase === 'round_over' && (
        <div className="h-screen flex flex-col p-4 sm:p-6 items-center justify-center">
          <div className="w-full max-w-md mx-auto flex flex-col items-center gap-8">
            <div className="text-center">
              <div className="w-20 h-20 border-4 border-black dark:border-white bg-purple-300 dark:bg-purple-500 flex items-center justify-center mx-auto mb-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
                <Trophy size={40} strokeWidth={2.5} className="text-black dark:text-gray-900" />
              </div>
              <p className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">
                {currentTeam?.name ?? 'Equipo'}
              </p>
              <p className="text-5xl font-black text-purple-500 dark:text-purple-400">
                {score}
              </p>
              <p className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mt-1">
                Puntos
              </p>
            </div>

            <div className="w-full space-y-2">
              <p className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 text-center">
                Ranking actual
              </p>
              {sortedTeams.map((team, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between border-2 border-black dark:border-white bg-white dark:bg-gray-800 px-4 py-2"
                >
                  <div className="flex items-center gap-2">
                    {i === 0 && <Trophy size={14} strokeWidth={2.5} className="text-yellow-500" />}
                    <span className="text-sm font-black uppercase tracking-wider text-black dark:text-white">
                      {team.name}
                    </span>
                  </div>
                  <span className="text-sm font-black text-purple-500 dark:text-purple-400">
                    {team.score}
                  </span>
                </div>
              ))}
            </div>

            {sending && (
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Enviando puntaje...
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
