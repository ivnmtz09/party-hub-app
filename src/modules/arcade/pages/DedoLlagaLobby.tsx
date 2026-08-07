import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../../context/AuthContext'
import {
  crearSalaDedo,
  unirseSalaDedo,
  observarSalaDedo,
  iniciarJuegoDedo,
  type DedoRoom,
} from '../../../firebase/services'
import GameHeader from '../../../components/GameHeader'
import UserAvatar from '../../../components/UserAvatar'
import DedoLlagaOnline from './DedoLlagaOnline'
import { useAppContent } from '../../../context/ContentContext'
import type { DeckContenido } from '../../../firebase/content'
import { Users, Play, Plus, LogIn, Copy, Check, Loader2, X } from 'lucide-react'

function pickRandomCard(deck: DeckContenido | undefined, used: Set<string>): string {
  const cartas = deck?.cartas ?? []
  const pool = cartas.length > 0 ? cartas : ['¿Quien es mas probable que...?']
  const available = pool.filter((c) => !used.has(c))
  if (available.length === 0) return pool[Math.floor(Math.random() * pool.length)]!
  return available[Math.floor(Math.random() * available.length)]!
}

type LobbyPhase = 'menu' | 'creating' | 'joining' | 'inside'

export default function DedoLlagaLobby() {
  const { user, userProfile } = useAuth()
  const { getDeck } = useAppContent()
  const deck = getDeck('dedo-en-la-llaga')
  const [phase, setPhase] = useState<LobbyPhase>('menu')
  const [roomCode, setRoomCode] = useState('')
  const [codeInput, setCodeInput] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [room, setRoom] = useState<DedoRoom | null>(null)
  const [usedCards, setUsedCards] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)

  const userId = user?.uid ?? ''
  const displayName = userProfile?.nickname || user?.displayName || 'Invitado'
  const avatarColor = userProfile?.avatar || '#fbbf24'
  const avatarType = userProfile?.avatarType || 'letter'
  const avatarIcon = userProfile?.avatarIcon || 'Gamepad2'
  const isHost = room?.hostId === userId

  useEffect(() => {
    if (!roomCode) return
    const unsub = observarSalaDedo(roomCode, (data) => {
      setRoom(data)
    })
    return unsub
  }, [roomCode])

  const handleCreate = async () => {
    if (!userId) return
    setLoading(true)
    setError('')
    try {
      const code = await crearSalaDedo(userId, displayName, avatarColor, avatarType, avatarIcon)
      setRoomCode(code)
      setPhase('inside')
    } catch (e) {
      setError('Error al crear la sala')
    } finally {
      setLoading(false)
    }
  }

  const handleJoin = async () => {
    if (!userId || codeInput.trim().length !== 4) return
    setLoading(true)
    setError('')
    try {
      await unirseSalaDedo(codeInput.trim().toUpperCase(), userId, displayName, avatarColor, avatarType, avatarIcon)
      setRoomCode(codeInput.trim().toUpperCase())
      setPhase('inside')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al unirse')
    } finally {
      setLoading(false)
    }
  }

  const handleStartGame = useCallback(async () => {
    if (!roomCode) return
    setError('')
    try {
      const card = pickRandomCard(deck, usedCards)
      setUsedCards((prev) => new Set(prev).add(card))
      await iniciarJuegoDedo(roomCode, card)
    } catch {
      setError('Error al iniciar el juego')
    }
  }, [roomCode, usedCards, deck])

  const handleCopyCode = () => {
    if (!roomCode) return
    navigator.clipboard.writeText(roomCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (room && room.phase !== 'lobby') {
    return (
      <DedoLlagaOnline
        room={room}
        userId={userId}
        isHost={isHost}
        roomCode={roomCode}
        deck={deck}
        usedCards={usedCards}
        onCardUsed={(card) => setUsedCards((prev) => new Set(prev).add(card))}
      />
    )
  }

  if (phase === 'inside' && room) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-black dark:text-white flex flex-col p-4 sm:p-6 transition-colors">
        <div className="w-full max-w-md mx-auto pt-2 pb-8">
          <GameHeader title="¿Quién Es Más Probable...?" backTo="/arcade" />
        </div>

        <div className="flex-1 w-full max-w-md mx-auto flex flex-col gap-6">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-black dark:border-white bg-fuchsia-300 dark:bg-fuchsia-500 flex items-center justify-center mx-auto mb-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
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
              className="inline-flex items-center gap-2 text-4xl font-black tracking-widest text-fuchsia-500 dark:text-fuchsia-400 hover:underline underline-offset-4"
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
              Comparte este codigo con tus amigos
            </p>
          </div>

          <div className="w-full border-4 border-black dark:border-white bg-white dark:bg-gray-800 p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]">
            <p className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3">
              Jugadores ({room.players.length})
            </p>
            <div className="space-y-2">
              {room.players.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 border-2 border-black dark:border-white bg-gray-50 dark:bg-gray-700 px-3 py-2"
                >
                  <UserAvatar
                    name={p.name}
                    color={p.avatar || '#fbbf24'}
                    type={p.avatarType === 'shape' ? 'shape' : 'letter'}
                    avatarIcon={p.avatarIcon || 'Gamepad2'}
                    size={32}
                    className="shrink-0"
                  />
                  <span className="font-bold text-sm uppercase tracking-wider text-black dark:text-white">
                    {p.name.split(' ')[0]}
                    {p.id === room.hostId && (
                      <span className="text-[10px] text-fuchsia-500 dark:text-fuchsia-400 ml-2">
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

          {isHost ? (
            <button
              onClick={handleStartGame}
              disabled={room.players.length < 3}
              className="w-full flex items-center justify-center gap-2 py-4 border-4 border-black dark:border-white bg-yellow-400 dark:bg-yellow-500 text-black font-black uppercase tracking-wider text-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Play size={22} strokeWidth={2.5} />
              EMPEZAR JUEGO
            </button>
          ) : (
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 text-center uppercase tracking-wider">
              Esperando al anfitrion...
            </p>
          )}

          <button
            onClick={() => {
              setPhase('menu')
              setRoom(null)
              setRoomCode('')
            }}
            className="w-full py-3 border-2 border-black dark:border-white bg-red-300 dark:bg-red-500 text-black dark:text-gray-900 font-black uppercase tracking-wider text-xs active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
          >
            <div className="flex items-center justify-center gap-2">
              <X size={16} strokeWidth={2.5} />
              ABANDONAR SALA
            </div>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col p-4 sm:p-6 text-black dark:text-white transition-colors">
      <div className="w-full max-w-md mx-auto pt-2 pb-8">
        <GameHeader title="¿Quién Es Más Probable...?" backTo="/arcade" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md mx-auto pb-12 gap-6">
        <button
          onClick={handleCreate}
          disabled={loading || !userId}
          className="w-full flex flex-col items-center justify-center gap-4 py-10 border-4 border-black dark:border-white bg-fuchsia-400 dark:bg-fuchsia-500 text-black dark:text-gray-900 font-black uppercase tracking-wider shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading && phase === 'creating' ? (
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
            <div className="flex items-center gap-3 border-2 border-black dark:border-white bg-gray-50 dark:bg-gray-700 px-3 py-2">
              <UserAvatar
                name={displayName}
                color={avatarColor}
                type={avatarType === 'shape' ? 'shape' : 'letter'}
                avatarIcon={avatarIcon}
                size={36}
                className="shrink-0"
              />
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                  Entrando como
                </p>
                <p className="font-bold text-sm uppercase tracking-wider text-black dark:text-white truncate">
                  {displayName.split(' ')[0]}
                </p>
              </div>
            </div>
            <button
              onClick={handleJoin}
              disabled={loading || codeInput.trim().length !== 4 || !userId}
              className="w-full flex items-center justify-center gap-2 py-4 border-4 border-black dark:border-white bg-fuchsia-400 dark:bg-fuchsia-500 text-black dark:text-gray-900 font-black uppercase tracking-wider text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all disabled:opacity-40 disabled:cursor-not-allowed"
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
