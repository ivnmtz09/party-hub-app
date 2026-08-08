import { useState, useEffect, useRef } from 'react'
import { Clock, Zap, Skull, RotateCcw, Square, Loader2 } from 'lucide-react'
import {
  pasarTurnoBomba,
  explotarBomba,
  continuarBomba,
  nuevaRondaBomba,
  actualizarPenitenciaPersonalizada,
  reiniciarSalaBomba,
  type BombaRoom,
} from '../../../firebase/services'
import GameHeader from '../../../components/GameHeader'
import GameInfoModal from '../../../components/GameInfoModal'
import UserAvatar from '../../../components/UserAvatar'
import { BOMBA_RULES } from '../data/bombaRules'

interface Props {
  sala: BombaRoom
  userId: string
  isHost: boolean
  roomCode: string
  preguntas: string[]
  penitencias: string[]
}

const INITIAL_TIME = 25
const MIN_TIME = 10

function pickRandom<T>(pool: T[], used: Set<T>, fallback: T): T {
  const available = pool.filter((c) => !used.has(c))
  if (available.length === 0) return fallback
  return available[Math.floor(Math.random() * available.length)]!
}

function shuffleIds(ids: string[]): string[] {
  const a = [...ids]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j]!, a[i]!]
  }
  return a
}

export default function BombaOnline({ sala, userId, isHost, roomCode, preguntas, penitencias }: Props) {
  const {
    phase,
    players,
    currentPlayerId,
    currentQuestion,
    totalTime,
    deadline,
    penitenceMode,
    penitencia,
    customPenitencia,
    order,
    turnCount,
  } = sala

  const currentPlayer = players.find((p) => p.id === currentPlayerId)

  const [localSeconds, setLocalSeconds] = useState(0)
  const [hasExploded, setHasExploded] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [localCustom, setLocalCustom] = useState('')
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    setLocalSeconds(Math.max(0, Math.round((deadline - Date.now()) / 1000)))
    if (tickRef.current) clearInterval(tickRef.current)
    tickRef.current = setInterval(() => {
      setLocalSeconds(Math.max(0, Math.round((deadline - Date.now()) / 1000)))
    }, 250)
    return () => {
      if (tickRef.current) clearInterval(tickRef.current)
    }
  }, [deadline])

  useEffect(() => {
    setHasExploded(false)
  }, [phase])

  const amICurrent = currentPlayerId === userId

  const handlePass = async () => {
    if (phase !== 'playing') return
    const used = new Set(sala.usedQuestions)
    used.add(currentQuestion)
    const nextQuestion = pickRandom(preguntas, used, '¡Responde ya!')
    const remaining = order.filter((id, i, arr) => arr.indexOf(id) === i)
    const curPos = remaining.indexOf(currentPlayerId)
    const nextPos = (curPos + 1) % remaining.length
    const nextPlayerId = remaining[nextPos]!
    const nextTurn = turnCount + 1
    const nextDuration = Math.max(MIN_TIME, INITIAL_TIME - nextTurn)
    const ok = await pasarTurnoBomba(roomCode, userId, {
      question: nextQuestion,
      totalTime: nextDuration,
      nextPlayerId,
      turnCount: nextTurn,
    })
    if (!ok) {
      // no-op: turno no actual
    }
  }

  const handleExplode = async () => {
    if (phase !== 'playing' || hasExploded) return
    setHasExploded(true)
    let pen = ''
    if (penitenceMode === 'aleatoria') {
      const used = new Set(sala.usedPenitencias)
      pen = pickRandom(penitencias, used, 'Toma un trago')
    }
    await explotarBomba(roomCode, userId, { penitencia: pen })
  }

  const handleContinue = async () => {
    await continuarBomba(roomCode)
  }

  const handleCumplir = async () => {
    const newUsed = [...new Set(sala.usedQuestions)]
    const questionUsed = new Set(sala.usedQuestions)
    const nextQuestion = pickRandom(preguntas, questionUsed, '¡Responde ya!')
    newUsed.push(nextQuestion)
    const nextOrder = shuffleIds(order)
    const nextTurn = turnCount + 1
    const nextDuration = Math.max(MIN_TIME, INITIAL_TIME - nextTurn)
    await nuevaRondaBomba(roomCode, {
      question: nextQuestion,
      totalTime: nextDuration,
      order: nextOrder,
      turnCount: nextTurn,
      usedQuestions: newUsed,
    })
  }

  const handleCobarde = async () => {
    await reiniciarSalaBomba(roomCode)
  }

  const progress = totalTime > 0 ? localSeconds / totalTime : 0
  const bombColor =
    progress > 0.5 ? 'bg-green-500' : progress > 0.25 ? 'bg-yellow-400' : 'bg-red-600'
  const pulseDuration = Math.max(0.3, progress * 1.6 + 0.3)
  const isUrgent = localSeconds <= 10 && localSeconds > 0
  const isTimerOver = localSeconds === 0 && phase === 'playing'

  useEffect(() => {
    if (!isTimerOver) return
    const t = setTimeout(() => handleExplode(), 150)
    return () => clearTimeout(t)
  }, [isTimerOver])

  if (phase === 'exploded') {
    const loser = currentPlayer?.name ?? '???'
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-red-600 dark:bg-red-700 text-white">
        <div className="text-center p-8 space-y-8 animate-bomb-zoom">
          <Zap size={72} strokeWidth={2.5} className="text-white mx-auto drop-shadow-[0_0_12px_#fff]" />
          <p className="text-6xl sm:text-8xl font-black uppercase tracking-tighter animate-bomb-shake">
            BUM!
          </p>
          <div className="space-y-3">
            <p className="text-2xl sm:text-3xl font-black uppercase tracking-wider">
              EXPLOTÓ EN LAS MANOS DE
            </p>
            <p className="text-5xl sm:text-6xl font-black uppercase tracking-tighter text-yellow-300">
              {loser}
            </p>
          </div>
          {penitenceMode === 'aleatoria' && penitencia ? (
            <div className="border-4 border-white bg-white text-red-700 p-5 max-w-sm mx-auto mt-4">
              <p className="text-xs font-black uppercase tracking-widest text-red-600 mb-2">
                PENITENCIA
              </p>
              <p className="text-lg font-black uppercase tracking-tight leading-relaxed">
                {penitencia}
              </p>
            </div>
          ) : null}
          {(isHost || amICurrent) && (
            <button
              onClick={handleContinue}
              className="mt-8 px-10 py-4 border-4 border-white bg-yellow-300 text-black font-black uppercase tracking-wider text-lg shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
            >
              Continuar
            </button>
          )}
        </div>
      </div>
    )
  }

  if (phase === 'resolution') {
    const loser = currentPlayer?.name ?? '???'
    const isLoser = amICurrent
    const penText = localCustom || customPenitencia
    const canConfirm = penitenceMode === 'aleatoria' || (!!localCustom.trim() && isLoser)

    const handleCustomChange = async (text: string) => {
      setLocalCustom(text)
      await actualizarPenitenciaPersonalizada(roomCode, text)
    }

    return (
      <div className="min-h-[100vh] bg-gray-50 dark:bg-gray-950 text-black dark:text-white flex flex-col animate-fade-in-up">
        <div className="w-full max-w-md mx-auto pt-2 pb-8">
          <GameHeader title="Bomba de Tiempo" backTo="/arcade" onInfo={() => setShowInfo(true)} />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center gap-8 max-w-md mx-auto w-full p-4">
          <div className="w-20 h-20 border-4 border-black dark:border-white flex items-center justify-center bg-yellow-300 dark:bg-yellow-400 shadow-brutal dark:shadow-brutal-dark">
            <Skull size={44} strokeWidth={2.5} className="text-black dark:text-gray-900" />
          </div>

          <div className="text-center">
            <p className="text-xs font-black uppercase tracking-widest text-red-500 dark:text-red-400">
              Penitencia
            </p>
            <p className="text-xl font-black uppercase tracking-wider mt-1 text-black dark:text-white">
              {loser}
            </p>
          </div>

          {penitenceMode === 'personalizada' && isLoser ? (
            <div className="w-full space-y-2">
              <p className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 text-center">
                Escribe la penitencia para ti mismo
              </p>
              <textarea
                value={localCustom}
                onChange={(e) => handleCustomChange(e.target.value)}
                placeholder="Ej: Toma 3 tragos, cuenta un secreto..."
                rows={3}
                className="w-full border-4 border-black dark:border-white bg-white dark:bg-gray-800 text-black dark:text-white font-bold text-sm p-4 placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none resize-none"
                maxLength={120}
              />
            </div>
          ) : penitenceMode === 'personalizada' && !isLoser ? (
            <div className="w-full border-4 border-black dark:border-white bg-white dark:bg-gray-800 p-5 min-h-[100px] flex items-center justify-center">
              <p className="text-sm font-black uppercase tracking-tight text-center text-black dark:text-white leading-relaxed">
                {penText || 'El perdedor escribe su penitencia...'}
              </p>
            </div>
          ) : (
            <div className="w-full border-4 border-black dark:border-white bg-white dark:bg-gray-800 p-5 min-h-[100px] flex items-center justify-center">
              <p className="text-xl sm:text-2xl font-black uppercase tracking-tight text-center text-black dark:text-white leading-relaxed">
                {penitencia || 'Nueva penitencia...'}
              </p>
            </div>
          )}

          <div className="w-full flex gap-3">
            <button
              onClick={handleCumplir}
              disabled={!canConfirm || !isHost}
              className="flex-1 flex items-center justify-center gap-2 py-4 border-4 border-black dark:border-white bg-emerald-400 dark:bg-emerald-500 text-black dark:text-gray-900 font-black uppercase tracking-wider text-sm active:translate-x-1 active:translate-y-1 active:shadow-none transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <RotateCcw size={20} strokeWidth={2.5} />
              CUMPLIDO
            </button>
            <button
              onClick={handleCobarde}
              disabled={!isHost}
              className="flex-1 flex items-center justify-center gap-2 py-4 border-4 border-black dark:border-white bg-red-400 dark:bg-red-500 text-black dark:text-gray-900 font-black uppercase tracking-wider text-sm active:translate-x-1 active:translate-y-1 active:shadow-none transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Square size={20} strokeWidth={2.5} />
              COBARDE
            </button>
          </div>
        </div>

        {showInfo && (
          <GameInfoModal title="Bomba de Tiempo" rules={BOMBA_RULES} onClose={() => setShowInfo(false)} />
        )}
      </div>
    )
  }

  // phase === 'playing'
  const minutes = Math.floor(localSeconds / 60)
  const seconds = localSeconds % 60
  const timeDisplay = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  return (
    <div className="min-h-[100vh] bg-gray-50 dark:bg-gray-950 text-black dark:text-white flex flex-col animate-fade-in-up">
      <div className="w-full max-w-md mx-auto pt-2 pb-8">
        <GameHeader title="Bomba de Tiempo" backTo="/arcade" onInfo={() => setShowInfo(true)} />
      </div>

      <div className="flex-1 flex flex-col items-center w-full max-w-md mx-auto pb-12">
        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="flex items-center gap-2.5">
            <UserAvatar
              name={currentPlayer?.name || '?'}
              color={currentPlayer?.avatar || '#fca5a5'}
              type={currentPlayer?.avatarType === 'shape' ? 'shape' : 'letter'}
              avatarIcon={currentPlayer?.avatarIcon || 'Bomb'}
              size={40}
              className="shrink-0"
            />
            <span className="text-xs font-black uppercase text-gray-500 dark:text-gray-400 tracking-widest">
              Turno de
            </span>
            <h2 className="text-2xl font-black uppercase tracking-wider text-black dark:text-white">
              {currentPlayer?.name.split(' ')[0] || '...'}
            </h2>
          </div>
          <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Ronda {turnCount} / Pregunta {players.length}
          </span>
        </div>

        <div className="relative flex items-center justify-center mb-8">
          <div
            className={`w-48 h-48 sm:w-56 sm:h-56 rounded-full border-[6px] border-black flex flex-col items-center justify-center ${bombColor} shadow-brutal-lg dark:shadow-brutal-lg-dark transition-colors ${isUrgent ? 'animate-bomb-urgent' : 'animate-pulse-scale'}`}
            style={{ animationDuration: `${pulseDuration}s` }}
          >
            <Clock size={32} strokeWidth={2.5} className="text-white mb-2" />
            <span
              className={`text-4xl sm:text-5xl font-black tabular-nums text-white ${isUrgent ? 'animate-bomb-flicker' : ''}`}
              style={{ animationDuration: `${Math.max(0.6, pulseDuration + 0.3)}s` }}
            >
              {timeDisplay}
            </span>
          </div>
          <div
            className={`absolute -top-2 -right-2 w-8 h-8 rounded-full border-[4px] border-black bg-red-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${progress < 0.5 ? 'animate-ping' : 'animate-bomb-spark'}`}
          />
        </div>

        <div className="w-full border-4 border-black dark:border-white bg-white dark:bg-gray-800 p-5 shadow-brutal dark:shadow-brutal-dark min-h-[120px] flex items-center justify-center mb-4">
          <p className="text-xl sm:text-2xl font-black uppercase tracking-tighter text-black dark:text-white text-center leading-relaxed">
            {currentQuestion}
          </p>
        </div>

        {!amICurrent && !isHost ? (
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 text-center uppercase tracking-wider">
            Espera a tu turno...
          </p>
        ) : (
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400 text-center uppercase tracking-wider">
            <Loader2 size={14} className="animate-spin" />
            Responde en voz alta y pasa el turno
          </div>
        )}
      </div>

      {(amICurrent || isHost) && phase === 'playing' && (
        <div className="pb-6 max-w-md mx-auto w-full px-4">
          <button
            onClick={handlePass}
            disabled={isTimerOver}
            className="w-full flex items-center justify-center gap-3 py-5 border-4 border-black dark:border-white bg-yellow-300 dark:bg-yellow-400 text-black dark:text-gray-900 font-black uppercase tracking-wider text-xl shadow-brutal dark:shadow-brutal-dark active:translate-x-1 active:translate-y-1 active:shadow-none transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Zap size={28} strokeWidth={2.5} />
            RESPONDER Y PASAR
          </button>
        </div>
      )}

      {showInfo && (
        <GameInfoModal title="Bomba de Tiempo" rules={BOMBA_RULES} onClose={() => setShowInfo(false)} />
      )}
    </div>
  )
}
