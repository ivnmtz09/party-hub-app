import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../../context/AuthContext'
import {
  crearSalaCodigo,
  unirseSalaCodigo,
  observarSalaCodigo,
  guardarCodigoSecreto,
  reiniciarJuegoCodigo,
  abandonarSalaCodigo,
  type CodigoRoom,
} from '../../../firebase/services'
import GameHeader from '../../../components/GameHeader'
import CodigoSecretoGame from './CodigoSecretoGame'
import { Users, Plus, LogIn, Copy, Check, Loader2, X, Shuffle, Lock, Unlock } from 'lucide-react'

function generarCodigoAleatorio(): string {
  const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
  for (let i = digits.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [digits[i], digits[j]] = [digits[j]!, digits[i]!]
  }
  return digits.slice(0, 4).join('')
}

type LobbyPhase = 'menu' | 'joining' | 'inside'

export default function CodigoSecretoLobby() {
  const { user } = useAuth()
  const [phase, setPhase] = useState<LobbyPhase>('menu')
  const [roomCode, setRoomCode] = useState('')
  const [nameInput, setNameInput] = useState('')
  const [codeInput, setCodeInput] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [room, setRoom] = useState<CodigoRoom | null>(null)
  const [loading, setLoading] = useState(false)

  const [secretDigits, setSecretDigits] = useState<string[]>(['', '', '', ''])
  const secretInputRefs = useRef<(HTMLInputElement | null)[]>([])

  const userId = user?.uid ?? ''
  const displayName = user?.displayName ?? (nameInput.trim() || 'Invitado')
  const isHost = room?.hostId === userId

  useEffect(() => {
    if (!roomCode) return
    const unsub = observarSalaCodigo(roomCode, (data) => {
      setRoom(data)
    })
    return unsub
  }, [roomCode])

  const handleCreate = async () => {
    if (!userId) return
    setLoading(true)
    setError('')
    try {
      const code = await crearSalaCodigo(userId, displayName)
      setRoomCode(code)
      setPhase('inside')
    } catch {
      setError('Error al crear la sala')
    } finally {
      setLoading(false)
    }
  }

  const handleJoin = async () => {
    if (!userId || codeInput.trim().length !== 4 || !nameInput.trim()) return
    setLoading(true)
    setError('')
    try {
      await unirseSalaCodigo(codeInput.trim().toUpperCase(), userId, nameInput.trim())
      setRoomCode(codeInput.trim().toUpperCase())
      setPhase('inside')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al unirse')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyCode = () => {
    if (!roomCode) return
    navigator.clipboard.writeText(roomCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSecretDigitChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1)
    if (!/^\d*$/.test(value)) return
    const newDigits = [...secretDigits]
    newDigits[index] = value
    setSecretDigits(newDigits)
    if (value && index < 3) {
      secretInputRefs.current[index + 1]?.focus()
    }
  }

  const handleSecretKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !secretDigits[index] && index > 0) {
      secretInputRefs.current[index - 1]?.focus()
    }
  }

  const handleGenerateRandom = () => {
    const code = generarCodigoAleatorio()
    const arr = code.split('')
    setSecretDigits(arr)
    secretInputRefs.current[0]?.focus()
  }

  const handleSaveCode = async () => {
    const code = secretDigits.join('')
    if (code.length !== 4) {
      setError('Ingresa 4 digitos')
      return
    }
    if (new Set(code).size !== 4) {
      setError('Los digitos deben ser unicos')
      return
    }
    setError('')
    setLoading(true)
    try {
      await guardarCodigoSecreto(roomCode, userId, code)
    } catch {
      setError('Error al guardar el codigo')
    } finally {
      setLoading(false)
    }
  }

  const handleReplay = async () => {
    if (!roomCode) return
    setError('')
    setSecretDigits(['', '', '', ''])
    try {
      await reiniciarJuegoCodigo(roomCode)
    } catch {
      setError('Error al reiniciar')
    }
  }

  const handleLeave = async () => {
    if (!roomCode || !userId) return
    await abandonarSalaCodigo(roomCode, userId)
    setPhase('menu')
    setRoom(null)
    setRoomCode('')
    setSecretDigits(['', '', '', ''])
  }

  if (room && (room.phase === 'playing' || room.phase === 'finished')) {
    return (
      <CodigoSecretoGame
        room={room}
        userId={userId}
        roomCode={roomCode}
        isHost={isHost}
        onReplay={handleReplay}
        onLeave={handleLeave}
      />
    )
  }

  if (phase === 'inside' && room) {
    const playerIndex = room.players.findIndex((p) => p.id === userId)
    const myCodeSaved = playerIndex !== -1 && (playerIndex === 0 ? room.secretCode.p1 : room.secretCode.p2) !== ''

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-black dark:text-white flex flex-col p-4 sm:p-6 transition-colors">
        <div className="w-full max-w-md mx-auto pt-2 pb-8">
          <GameHeader title="Codigo Secreto" backTo="/arcade" />
        </div>

        <div className="flex-1 w-full max-w-md mx-auto flex flex-col gap-6">
          {room.players.length === 1 ? (
            <>
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-black dark:border-white bg-cyan-300 dark:bg-cyan-500 flex items-center justify-center mx-auto mb-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                  <Users size={32} strokeWidth={2.5} className="text-black dark:text-gray-900" />
                </div>
                <p className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                  Sala de Juego
                </p>
              </div>

              <div className="w-full border-4 border-black dark:border-white bg-white dark:bg-gray-800 p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] text-center">
                <p className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">
                  Codigo de Sala
                </p>
                <button
                  onClick={handleCopyCode}
                  className="inline-flex items-center gap-2 text-4xl font-black tracking-widest text-cyan-500 dark:text-cyan-400 hover:underline underline-offset-4"
                >
                  {copied ? (
                    <>
                      <Check size={24} strokeWidth={2.5} />
                      {roomCode}
                    </>
                  ) : (
                    <>
                      <Copy size={24} strokeWidth={2.5} />
                      {roomCode}
                    </>
                  )}
                </button>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-3 uppercase tracking-wider">
                  Comparte este codigo con un amigo
                </p>
              </div>

              <div className="w-full border-4 border-black dark:border-white bg-white dark:bg-gray-800 p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]">
                <p className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3">
                  Jugadores ({room.players.length}/2)
                </p>
                <div className="space-y-2">
                  {room.players.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center gap-3 border-2 border-black dark:border-white bg-gray-50 dark:bg-gray-700 px-3 py-2"
                    >
                      <div className="w-8 h-8 border-2 border-black dark:border-white bg-cyan-300 dark:bg-cyan-500 flex items-center justify-center text-xs font-black text-black dark:text-gray-900">
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-bold text-sm uppercase tracking-wider text-black dark:text-white">
                        {p.name}
                        {p.id === room.hostId && (
                          <span className="text-[10px] text-cyan-500 dark:text-cyan-400 ml-2">
                            (Anfitrion)
                          </span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {error && (
                <p className="text-red-500 font-black text-sm uppercase tracking-wider text-center">
                  {error}
                </p>
              )}

              <button
                onClick={handleLeave}
                className="w-full py-3 border-2 border-black dark:border-white bg-red-300 dark:bg-red-500 text-black dark:text-gray-900 font-black uppercase tracking-wider text-xs active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
              >
                <div className="flex items-center justify-center gap-2">
                  <X size={16} strokeWidth={2.5} />
                  ABANDONAR SALA
                </div>
              </button>
            </>
          ) : (
            <>
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-black dark:border-white bg-cyan-300 dark:bg-cyan-500 flex items-center justify-center mx-auto mb-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                  <Lock size={32} strokeWidth={2.5} className="text-black dark:text-gray-900" />
                </div>
                <p className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                  Configura tu codigo secreto
                </p>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider">
                  4 digitos unicos
                </p>
              </div>

              {myCodeSaved ? (
                <div className="w-full border-4 border-black dark:border-white bg-white dark:bg-gray-800 p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] text-center">
                  <Unlock size={32} strokeWidth={2.5} className="mx-auto mb-3 text-green-500" />
                  <p className="font-black uppercase tracking-wider text-sm text-black dark:text-white">
                    Codigo guardado
                  </p>
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider">
                    Esperando a tu rival...
                  </p>
                </div>
              ) : (
                <div className="w-full border-4 border-black dark:border-white bg-white dark:bg-gray-800 p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] space-y-4">
                  <p className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 text-center">
                    Ingresa tu codigo
                  </p>

                  <div className="flex justify-center gap-3">
                    {secretDigits.map((d, i) => (
                      <input
                        key={i}
                        ref={(el) => { secretInputRefs.current[i] = el }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={d}
                        onChange={(e) => handleSecretDigitChange(i, e.target.value)}
                        onKeyDown={(e) => handleSecretKeyDown(i, e)}
                        className="w-14 h-14 text-center border-4 border-black dark:border-white bg-white dark:bg-gray-700 text-black dark:text-white font-black text-2xl outline-none"
                      />
                    ))}
                  </div>

                  <button
                    onClick={handleGenerateRandom}
                    className="w-full flex items-center justify-center gap-2 py-2 border-2 border-black dark:border-white bg-gray-200 dark:bg-gray-600 text-black dark:text-white font-black uppercase tracking-wider text-xs active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
                  >
                    <Shuffle size={14} strokeWidth={2.5} />
                    GENERAR AL AZAR
                  </button>

                  {error && (
                    <p className="text-red-500 font-black text-xs uppercase tracking-wider text-center">
                      {error}
                    </p>
                  )}

                  <button
                    onClick={handleSaveCode}
                    disabled={loading || secretDigits.some((d) => !d)}
                    className="w-full flex items-center justify-center gap-2 py-4 border-4 border-black dark:border-white bg-cyan-400 dark:bg-cyan-500 text-black dark:text-gray-900 font-black uppercase tracking-wider text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <Loader2 size={22} className="animate-spin" strokeWidth={2.5} />
                    ) : (
                      <Lock size={22} strokeWidth={2.5} />
                    )}
                    GUARDAR CODIGO
                  </button>
                </div>
              )}

              <div className="w-full border-4 border-black dark:border-white bg-white dark:bg-gray-800 p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]">
                <p className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3">
                  Jugadores ({room.players.length}/2)
                </p>
                <div className="space-y-2">
                  {room.players.map((p) => {
                    const pIndex = room.players.findIndex((pl) => pl.id === p.id)
                    const codeKey = pIndex === 0 ? 'p1' : 'p2'
                    const codeReady = room.secretCode[codeKey] !== ''
                    return (
                      <div
                        key={p.id}
                        className="flex items-center gap-3 border-2 border-black dark:border-white bg-gray-50 dark:bg-gray-700 px-3 py-2"
                      >
                        <div className="w-8 h-8 border-2 border-black dark:border-white bg-cyan-300 dark:bg-cyan-500 flex items-center justify-center text-xs font-black text-black dark:text-gray-900">
                          {p.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-sm uppercase tracking-wider text-black dark:text-white flex-1">
                          {p.name}
                          {p.id === room.hostId && (
                            <span className="text-[10px] text-cyan-500 dark:text-cyan-400 ml-2">
                              (Anfitrion)
                            </span>
                          )}
                        </span>
                        {codeReady ? (
                          <span className="text-[10px] font-black uppercase tracking-widest text-green-500 flex items-center gap-1">
                            <Check size={12} strokeWidth={2.5} />
                            Listo
                          </span>
                        ) : (
                          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                            Configurando...
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              <button
                onClick={handleLeave}
                className="w-full py-3 border-2 border-black dark:border-white bg-red-300 dark:bg-red-500 text-black dark:text-gray-900 font-black uppercase tracking-wider text-xs active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
              >
                <div className="flex items-center justify-center gap-2">
                  <X size={16} strokeWidth={2.5} />
                  ABANDONAR SALA
                </div>
              </button>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col p-4 sm:p-6 text-black dark:text-white transition-colors">
      <div className="w-full max-w-md mx-auto pt-2 pb-8">
        <GameHeader title="CODIGO SECRETO" backTo="/arcade" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md mx-auto pb-12 gap-6">
        <button
          onClick={handleCreate}
          disabled={loading || !userId}
          className="w-full flex flex-col items-center justify-center gap-4 py-10 border-4 border-black dark:border-white bg-cyan-400 dark:bg-cyan-500 text-black dark:text-gray-900 font-black uppercase tracking-wider shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 size={28} className="animate-spin" strokeWidth={2.5} />
          ) : (
            <Plus size={28} strokeWidth={2.5} />
          )}
          <span className="text-xl">CREAR SALA</span>
        </button>

        {phase === 'joining' ? (
          <div className="w-full border-4 border-black dark:border-white bg-white dark:bg-gray-800 p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] space-y-4">
            <input
              type="text"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value.toUpperCase().slice(0, 4))}
              placeholder="CODIGO"
              maxLength={4}
              className="w-full text-center py-4 px-4 border-4 border-black dark:border-white bg-white dark:bg-gray-700 text-black dark:text-white font-black uppercase tracking-widest text-3xl placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none"
            />
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Tu nombre"
              className="w-full py-3 px-4 border-4 border-black dark:border-white bg-white dark:bg-gray-700 text-black dark:text-white font-bold text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none"
            />
            <button
              onClick={handleJoin}
              disabled={loading || codeInput.trim().length !== 4 || !nameInput.trim() || !userId}
              className="w-full flex items-center justify-center gap-2 py-4 border-4 border-black dark:border-white bg-cyan-400 dark:bg-cyan-500 text-black dark:text-gray-900 font-black uppercase tracking-wider text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 size={22} className="animate-spin" strokeWidth={2.5} />
              ) : (
                <LogIn size={22} strokeWidth={2.5} />
              )}
              UNIRSE
            </button>
            {error && (
              <p className="text-red-500 font-black text-xs uppercase tracking-wider text-center">
                {error}
              </p>
            )}
            <button
              onClick={() => { setPhase('menu'); setError('') }}
              className="w-full py-3 border-2 border-black dark:border-white bg-gray-200 dark:bg-gray-600 text-black dark:text-white font-black uppercase tracking-wider text-xs active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
            >
              CANCELAR
            </button>
          </div>
        ) : (
          <button
            onClick={() => setPhase('joining')}
            className="w-full flex flex-col items-center justify-center gap-4 py-10 border-4 border-black dark:border-white bg-white dark:bg-gray-800 text-black dark:text-white font-black uppercase tracking-wider shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
          >
            <LogIn size={28} strokeWidth={2.5} />
            <span className="text-xl">UNIRSE CON CODIGO</span>
          </button>
        )}
      </div>
    </div>
  )
}
