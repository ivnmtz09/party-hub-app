import { useState, useEffect } from 'react'
import { useAuth } from '../../../context/AuthContext'
import {
  crearSalaFrente,
  unirseSalaFrente,
  observarSalaFrente,
  agregarEquipoFrente,
  cambiarEquipoJugadorFrente,
  iniciarJuegoFrente,
  abandonarSalaFrente,
  type FrenteRoom,
} from '../../../firebase/services'
import GameHeader from '../../../components/GameHeader'
import FrenteGame from './FrenteGame'
import { Users, Plus, LogIn, Copy, Check, Loader2, X, Shuffle } from 'lucide-react'

type LobbyPhase = 'menu' | 'joining' | 'inside'

export default function FrenteLobby() {
  const { user } = useAuth()
  const [phase, setPhase] = useState<LobbyPhase>('menu')
  const [roomCode, setRoomCode] = useState('')
  const [nameInput, setNameInput] = useState('')
  const [codeInput, setCodeInput] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [room, setRoom] = useState<FrenteRoom | null>(null)
  const [loading, setLoading] = useState(false)

  const userId = user?.uid ?? ''
  const displayName = user?.displayName ?? (nameInput.trim() || 'Invitado')
  const isHost = room?.hostId === userId

  useEffect(() => {
    if (!roomCode) return
    const unsub = observarSalaFrente(roomCode, (data) => {
      setRoom(data)
    })
    return unsub
  }, [roomCode])

  const handleCreate = async () => {
    if (!userId) return
    setLoading(true)
    setError('')
    try {
      const code = await crearSalaFrente(userId, displayName)
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
      await unirseSalaFrente(codeInput.trim().toUpperCase(), userId, nameInput.trim(), 0)
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

  const handleChangeTeam = async (teamIndex: number) => {
    if (!roomCode || !userId) return
    await cambiarEquipoJugadorFrente(roomCode, userId, teamIndex)
  }

  const handleAddTeam = async () => {
    if (!roomCode) return
    const nextNum = (room?.teams.length ?? 0) + 1
    await agregarEquipoFrente(roomCode, `Equipo ${nextNum}`)
  }

  const handleStart = async () => {
    if (!roomCode) return
    setError('')
    try {
      await iniciarJuegoFrente(roomCode)
    } catch {
      setError('Error al iniciar')
    }
  }

  const handleLeave = async () => {
    if (!roomCode || !userId) return
    await abandonarSalaFrente(roomCode, userId)
    setPhase('menu')
    setRoom(null)
    setRoomCode('')
  }

  if (room && (room.phase === 'playing' || room.phase === 'finished')) {
    return (
      <FrenteGame
        room={room}
        roomCode={roomCode}
        onLeave={handleLeave}
      />
    )
  }

  if (phase === 'inside' && room) {
    const myPlayer = room.players.find((p) => p.id === userId)
    const myTeamIndex = myPlayer?.teamIndex ?? 0

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-black dark:text-white flex flex-col p-4 sm:p-6 transition-colors">
        <div className="w-full max-w-md mx-auto pt-2 pb-8">
          <GameHeader title="Frente a Frente" backTo="/arcade" />
        </div>

        <div className="flex-1 w-full max-w-md mx-auto flex flex-col gap-6">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-black dark:border-white bg-purple-300 dark:bg-purple-500 flex items-center justify-center mx-auto mb-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
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
              className="inline-flex items-center gap-2 text-4xl font-black tracking-widest text-purple-500 dark:text-purple-400 hover:underline underline-offset-4"
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
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                Equipos
              </p>
              {isHost && (
                <button
                  onClick={handleAddTeam}
                  className="flex items-center gap-1 text-xs font-black uppercase tracking-widest text-purple-500 dark:text-purple-400"
                >
                  <Plus size={14} strokeWidth={2.5} />
                  Agregar
                </button>
              )}
            </div>

            <div className="space-y-3">
              {room.teams.map((team, ti) => {
                const teamPlayers = room.players.filter((p) => p.teamIndex === ti)
                const isMyTeam = myTeamIndex === ti
                return (
                  <div
                    key={ti}
                    className={`border-2 border-black dark:border-white p-3 ${isMyTeam ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-gray-50 dark:bg-gray-700'}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-black text-sm uppercase tracking-wider text-black dark:text-white">
                        {team.name}
                      </span>
                      {isMyTeam && (
                        <span className="text-[10px] font-black uppercase tracking-widest text-purple-500 dark:text-purple-400">
                          Tu equipo
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {teamPlayers.map((p) => (
                        <span
                          key={p.id}
                          className="text-[10px] font-bold uppercase tracking-wider bg-white dark:bg-gray-600 border border-black dark:border-white px-1.5 py-0.5 text-black dark:text-white"
                        >
                          {p.name}
                          {p.id === room.hostId && ' (Host)'}
                        </span>
                      ))}
                    </div>
                    {room.phase === 'lobby' && !isMyTeam && (
                      <button
                        onClick={() => handleChangeTeam(ti)}
                        className="mt-2 text-[10px] font-black uppercase tracking-widest text-purple-500 dark:text-purple-400 hover:underline"
                      >
                        Unirse a este equipo
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {error && (
            <p className="text-red-500 font-black text-sm uppercase tracking-wider text-center">
              {error}
            </p>
          )}

          {isHost ? (
            <button
              onClick={handleStart}
              disabled={room.teams.some((_, ti) => room.players.filter((p) => p.teamIndex === ti).length === 0)}
              className="w-full flex items-center justify-center gap-2 py-4 border-4 border-black dark:border-white bg-purple-400 dark:bg-purple-500 text-black font-black uppercase tracking-wider text-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Shuffle size={22} strokeWidth={2.5} />
              EMPEZAR JUEGO
            </button>
          ) : (
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 text-center uppercase tracking-wider">
              Esperando al anfitrion...
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
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col p-4 sm:p-6 text-black dark:text-white transition-colors">
      <div className="w-full max-w-md mx-auto pt-2 pb-8">
        <GameHeader title="FRENTE A FRENTE" backTo="/arcade" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md mx-auto pb-12 gap-6">
        <button
          onClick={handleCreate}
          disabled={loading || !userId}
          className="w-full flex flex-col items-center justify-center gap-4 py-10 border-4 border-black dark:border-white bg-purple-400 dark:bg-purple-500 text-black dark:text-gray-900 font-black uppercase tracking-wider shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all disabled:opacity-40 disabled:cursor-not-allowed"
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
              className="w-full flex items-center justify-center gap-2 py-4 border-4 border-black dark:border-white bg-purple-400 dark:bg-purple-500 text-black dark:text-gray-900 font-black uppercase tracking-wider text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all disabled:opacity-40 disabled:cursor-not-allowed"
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
