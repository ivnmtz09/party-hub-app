import { useState, useEffect, useRef } from 'react'
import {
  Bomb,
  RotateCcw,
  Square,
  Play,
  UserPlus,
  X,
  ShieldAlert,
  Clock,
  Zap,
} from 'lucide-react'
import ArcadeHeader from '../components/ArcadeHeader'
import GameHeader from '../../../components/GameHeader'
import { preguntas, penitencias } from '../data/bomba'
import { playExplosionSound } from '../../../utils/audio'

type GamePhase = 'setup' | 'playing' | 'exploded' | 'resolution'
type PenitenceMode = 'aleatoria' | 'personalizada'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j]!, a[i]!]
  }
  return a
}

function pickRandomIndex(exclude: Set<number>, total: number): number {
  const available: number[] = []
  for (let i = 0; i < total; i++) {
    if (!exclude.has(i)) available.push(i)
  }
  if (available.length === 0) return Math.floor(Math.random() * total)
  return available[Math.floor(Math.random() * available.length)]!
}

export default function BombaPage() {
  const [phase, setPhase] = useState<GamePhase>('setup')
  const [names, setNames] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('bomba_players')
      return stored ? (JSON.parse(stored) as string[]) : []
    } catch {
      return []
    }
  })
  const [inputName, setInputName] = useState('')
  const [penitenceMode, setPenitenceMode] = useState<PenitenceMode>('aleatoria')
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [currentQuestion, setCurrentQuestion] = useState('')
  const [turnCount, setTurnCount] = useState(1)
  const [totalTime, setTotalTime] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [penitencia, setPenitencia] = useState('')
  const [customPenitencia, setCustomPenitencia] = useState('')
  const [usedQuestions, setUsedQuestions] = useState<Set<number>>(new Set())
  const [usedPenitencias, setUsedPenitencias] = useState<Set<number>>(new Set())
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('bomba_players', JSON.stringify(names))
    } catch { /* no storage */ }
  }, [names])

  const addName = () => {
    const trimmed = inputName.trim()
    if (trimmed && !names.includes(trimmed)) {
      setNames([...names, trimmed])
      setInputName('')
    }
  }

  const removeName = (name: string) => {
    setNames(names.filter((n) => n !== name))
  }

  const startGame = () => {
    if (names.length < 2) return

    const qIdx = pickRandomIndex(usedQuestions, preguntas.length)
    const initialTime = 25
    const newUsed = new Set(usedQuestions)
    newUsed.add(qIdx)

    setCurrentPlayerIndex(0)
    setCurrentQuestion(preguntas[qIdx]!)
    setTurnCount(1)
    setTotalTime(initialTime)
    setTimeLeft(initialTime)
    setUsedQuestions(newUsed)
    setCustomPenitencia('')
    setPhase('playing')

    try {
      localStorage.setItem('bomba_players', JSON.stringify(names))
    } catch { /* no storage */ }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handlePass = () => {
    if (timerRef.current) clearInterval(timerRef.current)

    const nextIndex = (currentPlayerIndex + 1) % names.length
    const qIdx = pickRandomIndex(usedQuestions, preguntas.length)
    const newUsed = new Set(usedQuestions)
    newUsed.add(qIdx)
    setUsedQuestions(newUsed)
    setCurrentQuestion(preguntas[qIdx]!)

    const nextTurn = turnCount + 1
    const nextDuration = Math.max(10, 25 - nextTurn)
    setCurrentPlayerIndex(nextIndex)
    setTurnCount(nextTurn)
    setTotalTime(nextDuration)
    setTimeLeft(nextDuration)

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  useEffect(() => {
    if (timeLeft > 0 || phase !== 'playing') return
    playExplosionSound()
    setPhase('exploded')

    if (penitenceMode === 'aleatoria') {
      const pIdx = pickRandomIndex(usedPenitencias, penitencias.length)
      const newUsed = new Set(usedPenitencias)
      newUsed.add(pIdx)
      setUsedPenitencias(newUsed)
      setPenitencia(penitencias[pIdx]!)
    }
  }, [timeLeft, phase, penitenceMode, usedPenitencias])

  const handleExplosionContinue = () => {
    setPhase('resolution')
  }

  const handleCumplido = () => {
    if (timerRef.current) clearInterval(timerRef.current)

    const shuffled = shuffle(names)
    const qIdx = pickRandomIndex(usedQuestions, preguntas.length)
    const initialTime = 25
    const newUsed = new Set(usedQuestions)
    newUsed.add(qIdx)

    setNames(shuffled)
    setCurrentPlayerIndex(0)
    setCurrentQuestion(preguntas[qIdx]!)
    setTurnCount(1)
    setTotalTime(initialTime)
    setTimeLeft(initialTime)
    setUsedQuestions(newUsed)
    setPenitencia('')
    setCustomPenitencia('')
    setPhase('playing')

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleCobarde = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setPhase('setup')
    setPenitencia('')
    setCustomPenitencia('')
  }

  const progress = totalTime > 0 ? timeLeft / totalTime : 0
  const tensionMultiplier = Math.max(0.4, totalTime / 25)
  const pulseDuration = Math.max(0.3, progress * tensionMultiplier * 2.5)

  const bombColor =
    progress > 0.5
      ? 'bg-green-500'
      : progress > 0.25
        ? 'bg-yellow-400'
        : 'bg-red-600'

  if (phase === 'setup') {
    return (
      <div className="min-h-[100dvh] bg-gray-50 dark:bg-gray-950 text-black dark:text-white flex flex-col">
        <ArcadeHeader />
        <div className="flex-1 w-full max-w-md mx-auto p-4 space-y-5">
          <GameHeader title="Bomba de Tiempo" backTo="/arcade" />
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-center">
            Configura la partida
          </p>

          <div className="border-4 border-black dark:border-white bg-white dark:bg-gray-800 p-4 shadow-brutal dark:shadow-brutal-dark space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 border-2 border-black dark:border-white bg-red-300 dark:bg-red-500 flex items-center justify-center">
                <Bomb size={20} strokeWidth={2.5} className="text-black dark:text-gray-900" />
              </div>
              <div>
                <p className="font-black uppercase tracking-wider text-sm">
                  Jugadores ({names.length})
                </p>
                <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400">
                  Minimo 2 para jugar
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addName()}
                placeholder="Nombre del jugador"
                className="flex-1 border-2 border-black dark:border-white bg-white dark:bg-gray-700 px-3 py-2 text-sm font-bold text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none"
              />
              <button
                onClick={addName}
                disabled={!inputName.trim()}
                className="px-4 border-2 border-black dark:border-white bg-emerald-300 dark:bg-emerald-500 text-black dark:text-gray-900 font-black text-sm shadow-brutal-sm dark:shadow-brutal-sm-dark active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-50"
              >
                <UserPlus size={18} strokeWidth={2.5} />
              </button>
            </div>

            {names.length > 0 && (
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {names.map((name) => (
                  <div
                    key={name}
                    className="flex items-center justify-between border-2 border-black dark:border-white bg-gray-50 dark:bg-gray-700 px-3 py-2"
                  >
                    <span className="font-bold text-sm text-black dark:text-white truncate">
                      {name}
                    </span>
                    <button
                      onClick={() => removeName(name)}
                      className="p-1 border border-black dark:border-white bg-red-300 dark:bg-red-500 text-black dark:text-gray-900"
                    >
                      <X size={14} strokeWidth={3} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-4 border-black dark:border-white bg-white dark:bg-gray-800 p-4 shadow-brutal dark:shadow-brutal-dark space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 border-2 border-black dark:border-white bg-fuchsia-300 dark:bg-fuchsia-500 flex items-center justify-center">
                <ShieldAlert size={20} strokeWidth={2.5} className="text-black dark:text-gray-900" />
              </div>
              <div>
                <p className="font-black uppercase tracking-wider text-sm">
                  Tipo de Penitencia
                </p>
                <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400">
                  Al explotar la bomba
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setPenitenceMode('aleatoria')}
                className={`py-3 border-2 border-black dark:border-white text-xs font-black uppercase tracking-wider transition-all ${
                  penitenceMode === 'aleatoria'
                    ? 'bg-yellow-300 dark:bg-yellow-400 text-black dark:text-gray-900 shadow-brutal-sm dark:shadow-brutal-sm-dark'
                    : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                Aleatoria (Algoritmo)
              </button>
              <button
                onClick={() => setPenitenceMode('personalizada')}
                className={`py-3 border-2 border-black dark:border-white text-xs font-black uppercase tracking-wider transition-all ${
                  penitenceMode === 'personalizada'
                    ? 'bg-yellow-300 dark:bg-yellow-400 text-black dark:text-gray-900 shadow-brutal-sm dark:shadow-brutal-sm-dark'
                    : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                Personalizada por el Grupo
              </button>
            </div>
          </div>

          <button
            onClick={startGame}
            disabled={names.length < 2}
            className="w-full flex items-center justify-center gap-2 py-4 border-4 border-black dark:border-white bg-red-500 dark:bg-red-600 text-white font-black uppercase tracking-wider text-lg shadow-brutal dark:shadow-brutal-dark active:translate-x-1 active:translate-y-1 active:shadow-none transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Play size={22} strokeWidth={2.5} />
            Iniciar Partida
          </button>
        </div>
      </div>
    )
  }

  if (phase === 'exploded') {
    const loser = names[currentPlayerIndex] ?? '???'
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-red-600 dark:bg-red-700 animate-pulse">
        <div className="text-center p-8 space-y-6">
          <Zap size={64} strokeWidth={2.5} className="text-white mx-auto" />
          <p className="text-5xl sm:text-7xl font-black uppercase tracking-tighter text-white leading-tight">
            BUM!
          </p>
          <p className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-white">
            EXPLOTO EN LAS MANOS DE
          </p>
          <p className="text-5xl sm:text-6xl font-black uppercase tracking-tighter text-yellow-300">
            {loser}
          </p>
          <button
            onClick={handleExplosionContinue}
            className="mt-8 px-10 py-4 border-4 border-white bg-yellow-300 text-black font-black uppercase tracking-wider text-lg shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
          >
            Continuar
          </button>
        </div>
      </div>
    )
  }

  if (phase === 'resolution') {
    return (
      <div className="min-h-[100dvh] bg-gray-50 dark:bg-gray-950 text-black dark:text-white flex flex-col">
        <ArcadeHeader />
        <div className="flex-1 flex flex-col items-center justify-center gap-8 max-w-md mx-auto w-full p-4">
          <GameHeader title="Bomba de Tiempo" backTo="/arcade" />
          <div className="w-20 h-20 border-4 border-black dark:border-white bg-yellow-300 dark:bg-yellow-400 flex items-center justify-center shadow-brutal dark:shadow-brutal-dark">
            <ShieldAlert size={40} strokeWidth={2.5} className="text-black dark:text-gray-900" />
          </div>

          {penitenceMode === 'personalizada' ? (
            <div className="w-full space-y-3">
              <p className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 text-center">
                Escriban la penitencia para el perdedor
              </p>
              <textarea
                value={customPenitencia}
                onChange={(e) => setCustomPenitencia(e.target.value)}
                placeholder="Ej: Toma 3 tragos, cuenta un secreto..."
                rows={4}
                className="w-full border-4 border-black dark:border-white bg-white dark:bg-gray-800 text-black dark:text-white font-bold text-sm p-4 placeholder:text-gray-400 focus:outline-none focus:ring-0 resize-none"
              />
            </div>
          ) : (
            <div className="w-full border-4 border-black dark:border-white bg-white dark:bg-gray-800 p-6 shadow-brutal dark:shadow-brutal-dark">
              <p className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-4 text-center">
                Penitencia
              </p>
              <p className="text-xl sm:text-2xl font-black uppercase tracking-tighter text-black dark:text-white text-center leading-relaxed">
                {penitencia}
              </p>
            </div>
          )}

          <div className="w-full flex gap-3">
            <button
              onClick={handleCumplido}
              disabled={penitenceMode === 'personalizada' && !customPenitencia.trim()}
              className="flex-1 flex items-center justify-center gap-2 py-4 border-4 border-black dark:border-white bg-emerald-400 dark:bg-emerald-500 text-black dark:text-gray-900 font-black uppercase tracking-wider text-sm shadow-brutal dark:shadow-brutal-dark active:translate-x-1 active:translate-y-1 active:shadow-none transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <RotateCcw size={20} strokeWidth={2.5} />
              CUMPLIDO
            </button>
            <button
              onClick={handleCobarde}
              className="flex-1 flex items-center justify-center gap-2 py-4 border-4 border-black dark:border-white bg-red-400 dark:bg-red-500 text-black dark:text-gray-900 font-black uppercase tracking-wider text-sm shadow-brutal dark:shadow-brutal-dark active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
            >
              <Square size={20} strokeWidth={2.5} />
              COBARDE
            </button>
          </div>
        </div>
      </div>
    )
  }

  const currentName = names[currentPlayerIndex] ?? '?'

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const timeDisplay = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  return (
    <div className="min-h-[100dvh] bg-gray-50 dark:bg-gray-950 text-black dark:text-white flex flex-col">
      <ArcadeHeader />
      <GameHeader title="Bomba de Tiempo" backTo="/arcade" />
      <div className="flex-1 flex flex-col items-center justify-center gap-6 max-w-md mx-auto w-full p-4">
        <div className="text-center">
          <p className="text-xs font-black uppercase tracking-widest text-red-500 dark:text-red-400">
            Turno de
          </p>
          <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-wider text-black dark:text-white mt-1">
            {currentName}
          </h2>
        </div>

        <div className="relative flex items-center justify-center">
          <div
            className={`w-48 h-48 sm:w-56 sm:h-56 rounded-full border-[6px] border-black flex flex-col items-center justify-center ${bombColor} shadow-brutal-lg dark:shadow-brutal-lg-dark`}
            style={{
              animation: `pulse-scale ${pulseDuration}s ease-in-out infinite`,
            }}
          >
            <Clock size={32} strokeWidth={2.5} className="text-white mb-2" />
            <span className="text-4xl sm:text-5xl font-black tabular-nums text-white">
              {timeDisplay}
            </span>
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full border-[4px] border-black bg-red-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] animate-ping" />
        </div>

        <div className="w-full border-4 border-black dark:border-white bg-white dark:bg-gray-800 p-5 shadow-brutal dark:shadow-brutal-dark min-h-[120px] flex items-center justify-center">
          <p className="text-xl sm:text-2xl font-black uppercase tracking-tighter text-black dark:text-white text-center leading-relaxed">
            {currentQuestion}
          </p>
        </div>

        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 text-center">
          Responde en voz alta y presiona el boton para pasar el turno
        </p>
      </div>

      <div className="pb-6 max-w-md mx-auto w-full px-4">
        <button
          onClick={handlePass}
          className="w-full flex items-center justify-center gap-3 py-5 border-4 border-black dark:border-white bg-yellow-300 dark:bg-yellow-400 text-black dark:text-gray-900 font-black uppercase tracking-wider text-xl shadow-brutal dark:shadow-brutal-dark active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
        >
          <Zap size={28} strokeWidth={2.5} />
          RESPONDER Y PASAR
        </button>
      </div>
    </div>
  )
}
