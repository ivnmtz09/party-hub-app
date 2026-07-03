import { useState, useRef } from 'react'
import {
  enviarIntentoCodigo,
  type CodigoRoom,
} from '../../../firebase/services'
import GameHeader from '../../../components/GameHeader'
import { ArrowRight, RotateCcw, X, Trophy, Frown } from 'lucide-react'

interface Props {
  room: CodigoRoom
  userId: string
  roomCode: string
  isHost: boolean
  onReplay: () => Promise<void>
  onLeave: () => Promise<void>
}

function calcularFijasPicas(guess: string, code: string): { fijas: number; picas: number } {
  let fijas = 0
  let picas = 0
  for (let i = 0; i < 4; i++) {
    if (guess[i] === code[i]) {
      fijas++
    } else if (code.includes(guess[i]!)) {
      picas++
    }
  }
  return { fijas, picas }
}

const INTENTOS_MAX = 10

export default function CodigoSecretoGame({ room, userId, roomCode, onReplay, onLeave }: Props) {
  const playerIndex = room.players.findIndex((p) => p.id === userId)
  const opponentIndex = playerIndex === 0 ? 1 : 0
  const myKey = playerIndex === 0 ? 'p1' : 'p2'
  const opponentKey = playerIndex === 0 ? 'p2' : 'p1'
  const myGuesses = room.guesses[myKey]
  const opponentGuesses = room.guesses[opponentKey]
  const myCode = room.secretCode[myKey]
  const opponentCode = room.secretCode[opponentKey]
  const opponent = room.players[opponentIndex]

  const [digits, setDigits] = useState<string[]>(['', '', '', ''])
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const isFinished = room.phase === 'finished'
  const iWon = room.winner === userId
  const iLost = room.winner !== null && room.winner !== userId
  const isTie = room.winner === null && isFinished
  const canGuess = !isFinished && myGuesses.length < INTENTOS_MAX

  const handleDigitChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1)
    if (!/^\d*$/.test(value)) return
    const newDigits = [...digits]
    newDigits[index] = value
    setDigits(newDigits)
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleGuess = async () => {
    const guess = digits.join('')
    if (guess.length !== 4) {
      setError('Ingresa 4 digitos')
      return
    }
    if (new Set(guess).size !== 4) {
      setError('Los digitos deben ser unicos')
      return
    }
    setError('')
    setSending(true)
    const { fijas, picas } = calcularFijasPicas(guess, opponentCode)
    try {
      await enviarIntentoCodigo(roomCode, userId, guess, fijas, picas)
      setDigits(['', '', '', ''])
      inputRefs.current[0]?.focus()
    } catch {
      setError('Error al enviar intento')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-black dark:text-white flex flex-col p-4 sm:p-6 transition-colors">
      <div className="w-full max-w-md mx-auto pt-2 pb-4">
        <GameHeader title="Codigo Secreto" backTo="/arcade" />
      </div>

      {isFinished && (
        <div className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center p-4">
          <div className="w-full max-w-sm border-4 border-black dark:border-white bg-white dark:bg-gray-800 p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:shadow-[12px_12px_0px_0px_rgba(255,255,255,1)] text-center relative z-50">
            {iWon && (
              <>
                <Trophy size={48} strokeWidth={2.5} className="mx-auto mb-4 text-yellow-500" />
                <p className="text-2xl font-black uppercase tracking-wider text-black dark:text-white mb-2">
                  GANASTE
                </p>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-6">
                  Descifraste el codigo en {myGuesses.length} intentos
                </p>
              </>
            )}
            {iLost && (
              <>
                <Frown size={48} strokeWidth={2.5} className="mx-auto mb-4 text-red-500" />
                <p className="text-2xl font-black uppercase tracking-wider text-black dark:text-white mb-2">
                  PERDISTE
                </p>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-6">
                  {room.winner === null ? 'Nadie descifro el codigo' : 'Tu rival descifro el codigo primero'}
                </p>
              </>
            )}
            {isTie && (
              <>
                <Frown size={48} strokeWidth={2.5} className="mx-auto mb-4 text-gray-400" />
                <p className="text-2xl font-black uppercase tracking-wider text-black dark:text-white mb-2">
                  EMPATE
                </p>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-6">
                  Ambos agotaron los 10 intentos
                </p>
              </>
            )}

            <div className="flex gap-4 mb-6">
              <div className="flex-1 border-2 border-black dark:border-white bg-gray-50 dark:bg-gray-700 p-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1">
                  Tu codigo
                </p>
                <p className="text-xl font-black tracking-widest text-black dark:text-white">
                  {myCode.split('').join(' ')}
                </p>
              </div>
              <div className="flex-1 border-2 border-black dark:border-white bg-gray-50 dark:bg-gray-700 p-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1">
                  Codigo rival
                </p>
                <p className="text-xl font-black tracking-widest text-cyan-500 dark:text-cyan-400">
                  {opponentCode.split('').join(' ')}
                </p>
              </div>
            </div>

            <button
              onClick={onReplay}
              className="w-full flex items-center justify-center gap-2 py-4 border-4 border-black dark:border-white bg-yellow-400 dark:bg-yellow-500 text-black font-black uppercase tracking-wider text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all mb-3"
            >
              <RotateCcw size={20} strokeWidth={2.5} />
              JUGAR DE NUEVO
            </button>
            <button
              onClick={onLeave}
              className="w-full flex items-center justify-center gap-2 py-3 border-2 border-black dark:border-white bg-gray-200 dark:bg-gray-600 text-black dark:text-white font-black uppercase tracking-wider text-xs active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
            >
              <X size={16} strokeWidth={2.5} />
              SALIR
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 w-full max-w-md mx-auto flex flex-col gap-4">
        {!isFinished && (
          <div className="flex items-center justify-between">
            <div className="border-2 border-black dark:border-white bg-gray-100 dark:bg-gray-800 px-3 py-1.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                Tu codigo:
              </span>
              <span className="ml-2 text-sm font-black tracking-widest text-black dark:text-white">
                {myCode.split('').join(' ')}
              </span>
            </div>
            <div className="border-2 border-black dark:border-white bg-gray-100 dark:bg-gray-800 px-3 py-1.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                Intento
              </span>
              <span className="ml-2 text-sm font-black text-black dark:text-white">
                {myGuesses.length + 1}/{INTENTOS_MAX}
              </span>
            </div>
          </div>
        )}

        {canGuess ? (
          <div className="w-full border-4 border-black dark:border-white bg-white dark:bg-gray-800 p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] space-y-4">
            <p className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 text-center">
              Adivina el codigo de {opponent?.name ?? 'rival'}
            </p>

            <div className="flex justify-center gap-3">
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={(e) => handleDigitChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="w-14 h-14 text-center border-4 border-black dark:border-white bg-white dark:bg-gray-700 text-black dark:text-white font-black text-2xl outline-none"
                />
              ))}
            </div>

            {error && (
              <p className="text-red-500 font-black text-xs uppercase tracking-wider text-center">
                {error}
              </p>
            )}

            <button
              onClick={handleGuess}
              disabled={sending || digits.some((d) => !d)}
              className="w-full flex items-center justify-center gap-2 py-4 border-4 border-black dark:border-white bg-cyan-400 dark:bg-cyan-500 text-black dark:text-gray-900 font-black uppercase tracking-wider text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ArrowRight size={22} strokeWidth={2.5} />
              ADIVINAR
            </button>
          </div>
        ) : !isFinished && (
          <div className="w-full border-4 border-black dark:border-white bg-white dark:bg-gray-800 p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] text-center">
            <p className="text-lg font-black uppercase tracking-wider text-black dark:text-white">
              Agotaste tus {INTENTOS_MAX} intentos
            </p>
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-2 uppercase tracking-wider">
              Esperando a que tu rival termine...
            </p>
          </div>
        )}

        <div className="w-full border-4 border-black dark:border-white bg-white dark:bg-gray-800 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]">
          <div className="border-b-4 border-black dark:border-white px-4 py-3 bg-gray-100 dark:bg-gray-700">
            <p className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
              Historial de intentos
            </p>
          </div>

          <div className="p-4">
            {myGuesses.length === 0 ? (
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 text-center uppercase tracking-wider py-4">
                Aun no has adivinado
              </p>
            ) : (
              <div className="space-y-2">
                {myGuesses.map((g, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 border-2 border-black dark:border-white bg-gray-50 dark:bg-gray-700 px-3 py-2"
                  >
                    <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 w-6 shrink-0">
                      #{i + 1}
                    </span>
                    <span className="text-sm font-black tracking-widest text-black dark:text-white w-20 shrink-0">
                      {g.guess.split('').join(' ')}
                    </span>
                    <span className="text-xs font-black text-green-600 dark:text-green-400 flex-1">
                      {g.fijas} Fija{g.fijas !== 1 ? 's' : ''}
                    </span>
                    <span className="text-xs font-black text-yellow-600 dark:text-yellow-400 flex-1 text-right">
                      {g.picas} Pica{g.picas !== 1 ? 's' : ''}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {Array.from({ length: INTENTOS_MAX - myGuesses.length }).map((_, i) => (
              <div
                key={myGuesses.length + i}
                className="flex items-center gap-2 px-3 py-2 border-b border-dashed border-gray-200 dark:border-gray-600 last:border-b-0"
              >
                <span className="text-[10px] font-black text-gray-300 dark:text-gray-600 w-6 shrink-0">
                  #{myGuesses.length + i + 1}
                </span>
                <span className="text-sm font-black tracking-widest text-gray-200 dark:text-gray-700 w-20 shrink-0">
                  _ _ _ _
                </span>
                <span className="text-xs font-black text-gray-200 dark:text-gray-700 flex-1">
                  - Fijas
                </span>
                <span className="text-xs font-black text-gray-200 dark:text-gray-700 flex-1 text-right">
                  - Picas
                </span>
              </div>
            ))}
          </div>
        </div>

        {opponent && (
          <div className="flex items-center justify-between border-2 border-black dark:border-white bg-white dark:bg-gray-800 px-4 py-3 shadow-brutal-sm dark:shadow-brutal-sm-dark">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
              {opponent.name}
            </span>
            <span className="text-xs font-black text-cyan-500 dark:text-cyan-400">
              {opponentGuesses.length}/{INTENTOS_MAX} intentos
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
