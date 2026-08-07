import { useEffect, useState } from 'react'
import {
  Users,
  Plus,
  LogIn,
  Loader2,
  Copy,
  Check,
  Play,
  Crown,
  LogOut,
  Vote,
  RotateCcw,
  Trophy,
  Skull,
  HelpCircle,
} from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'
import GameHeader from '../../../components/GameHeader'
import ImpostorCard from '../components/ImpostorCard'
import { categoryMap } from '../data/words'
import { useImpostorOnline } from '../hooks/useImpostorOnline'
import type { ImpostorPlayer } from '../../../firebase/services'

function AvatarBox({
  player,
  size = 'w-9 h-9',
}: {
  player: { name: string; avatar: string }
  size?: string
}) {
  return (
    <div
      className={`${size} border-2 border-black flex items-center justify-center text-sm font-black text-black shrink-0`}
      style={{ backgroundColor: player.avatar || '#fbbf24' }}
    >
      {(player.name || '?').charAt(0).toUpperCase()}
    </div>
  )
}

function computeVoteCounts(votes: Record<string, string>): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const targetId of Object.values(votes)) {
    counts[targetId] = (counts[targetId] ?? 0) + 1
  }
  return counts
}

interface ImpostorOnlinePageProps {
  onExit: () => void
}

export default function ImpostorOnlinePage({ onExit }: ImpostorOnlinePageProps) {
  const { user, userProfile } = useAuth()
  const userId = user?.uid ?? ''
  const displayName = userProfile?.nickname || user?.displayName || 'Invitado'
  const avatar = userProfile?.avatar || '#fbbf24'

  const [screen, setScreen] = useState<'menu' | 'room'>('menu')
  const [panel, setPanel] = useState<'none' | 'create' | 'join'>('none')
  const [codeInput, setCodeInput] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    () => new Set(categoryMap.map((c) => c.name)),
  )
  const [cluesEnabled, setCluesEnabled] = useState(true)

  const game = useImpostorOnline({ userId, displayName, avatar, onError: setError })
  const room = game.room
  const isHost = game.isHost

  useEffect(() => {
    if (screen === 'room' && room?.status === 'LOBBY') {
      setSelectedCategories((prev) => {
        if (room.categories.length === 0) return prev
        const next = new Set(room.categories)
        const same =
          next.size === prev.size && Array.from(next).every((c) => prev.has(c))
        return same ? prev : next
      })
      setCluesEnabled(room.cluesEnabled)
    }
  }, [screen, room?.status, room?.categories, room?.cluesEnabled])

  const handleCreate = async () => {
    setError('')
    const ok = await game.createRoom(Array.from(selectedCategories), cluesEnabled)
    if (ok) setScreen('room')
  }

  const handleJoin = async () => {
    setError('')
    const code = codeInput.trim().toUpperCase()
    if (code.length < 5) {
      setError('Ingresa el codigo de la sala')
      return
    }
    const ok = await game.joinRoom(code)
    if (ok) setScreen('room')
  }

  const handleLeave = async () => {
    await game.leaveRoom()
    setScreen('menu')
    setPanel('none')
    setCodeInput('')
    setError('')
  }

  const handleCopy = () => {
    if (!game.roomCode) return
    navigator.clipboard.writeText(game.roomCode).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const toggleCategory = (cat: string) => {
    const next = new Set(selectedCategories)
    if (next.has(cat)) {
      next.delete(cat)
    } else {
      next.add(cat)
    }
    setSelectedCategories(next)
    if (room?.status === 'LOBBY') {
      game.updateConfig({ categories: Array.from(next) })
    }
  }

  const toggleClues = () => {
    const next = !cluesEnabled
    setCluesEnabled(next)
    if (room?.status === 'LOBBY') {
      game.updateConfig({ cluesEnabled: next })
    }
  }

  if (screen === 'menu' || !game.roomCode) {
    return (
      <div className="min-h-[100dvh] bg-gray-50 dark:bg-gray-950 text-black dark:text-white flex flex-col animate-fade-in-up">
        <div className="w-full max-w-md mx-auto p-4">
          <GameHeader title="El Impostor" backTo="/arcade" />
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-6 max-w-md mx-auto w-full p-4 pb-12">
          <div className="text-center space-y-2">
            <p className="text-xs font-black uppercase tracking-widest text-fuchsia-500 dark:text-fuchsia-400">
              Sala en linea
            </p>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wider">
              Juega con amigos
            </h1>
          </div>

          {error && (
            <p className="text-red-500 font-black text-xs uppercase tracking-wider text-center">
              {error}
            </p>
          )}

          {panel === 'create' ? (
            <div className="w-full border-4 border-black dark:border-white bg-white dark:bg-gray-800 p-5 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] space-y-4">
              <div>
                <p className="font-black uppercase tracking-wider text-sm mb-2">
                  Categorias
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {categoryMap.map(({ name, icon: Icon }) => {
                    const active = selectedCategories.has(name)
                    return (
                      <button
                        key={name}
                        onClick={() => toggleCategory(name)}
                        className={`flex items-center gap-2 px-2 py-2 border-2 border-black text-[10px] font-black uppercase tracking-wider transition-all ${
                          active
                            ? 'bg-yellow-300 text-black shadow-[3px_3px_0px_rgba(0,0,0,1)]'
                            : 'bg-white text-gray-500'
                        }`}
                      >
                        <Icon size={14} strokeWidth={2.5} />
                        {name}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div className="flex items-center justify-between border-t-2 border-black pt-3">
                <div className="flex items-center gap-2">
                  <HelpCircle size={16} strokeWidth={2.5} />
                  <p className="font-black uppercase tracking-wider text-xs">
                    Pistas para el impostor
                  </p>
                </div>
                <button
                  onClick={toggleClues}
                  aria-pressed={cluesEnabled}
                  className={`w-12 h-7 border-2 border-black ${
                    cluesEnabled ? 'bg-emerald-400' : 'bg-gray-200'
                  }`}
                >
                  <div
                    className={`w-4 h-4 border-2 border-black bg-white transition-transform duration-200 ${
                      cluesEnabled ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
              <button
                onClick={handleCreate}
                disabled={game.loading || !userId}
                className="w-full flex items-center justify-center gap-2 py-4 border-4 border-black bg-fuchsia-400 text-black font-black uppercase tracking-wider text-lg shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {game.loading ? (
                  <Loader2 size={22} className="animate-spin" strokeWidth={2.5} />
                ) : (
                  <Plus size={22} strokeWidth={2.5} />
                )}
                Crear Sala
              </button>
              <button
                onClick={() => {
                  setPanel('none')
                  setError('')
                }}
                className="w-full py-3 border-2 border-black bg-gray-200 text-black font-black uppercase tracking-wider text-xs active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
              >
                Cancelar
              </button>
            </div>
          ) : panel === 'join' ? (
            <div className="w-full border-4 border-black dark:border-white bg-white dark:bg-gray-800 p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] space-y-4">
              <p className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 text-center">
                Ingresa el codigo de 5 o 6 letras
              </p>
              <input
                type="text"
                value={codeInput}
                onChange={(e) =>
                  setCodeInput(e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 6))
                }
                placeholder="ABCDE"
                maxLength={6}
                className="w-full text-center py-4 px-4 border-4 border-black dark:border-white bg-white dark:bg-gray-700 text-black dark:text-white font-black uppercase tracking-widest text-3xl placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none"
              />
              <button
                onClick={handleJoin}
                disabled={game.loading || codeInput.trim().length < 5}
                className="w-full flex items-center justify-center gap-2 py-4 border-4 border-black bg-fuchsia-400 text-black font-black uppercase tracking-wider text-lg shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {game.loading ? (
                  <Loader2 size={22} className="animate-spin" strokeWidth={2.5} />
                ) : (
                  <LogIn size={22} strokeWidth={2.5} />
                )}
                Unirse
              </button>
              <button
                onClick={() => {
                  setPanel('none')
                  setError('')
                }}
                className="w-full py-3 border-2 border-black bg-gray-200 text-black font-black uppercase tracking-wider text-xs active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <div className="w-full space-y-5">
              <button
                onClick={() => setPanel('create')}
                className="w-full flex items-center gap-4 p-5 border-4 border-black bg-fuchsia-300 text-black shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
              >
                <div className="w-12 h-12 border-2 border-black bg-white flex items-center justify-center shrink-0">
                  <Plus size={24} strokeWidth={2.5} />
                </div>
                <div className="text-left">
                  <p className="font-black uppercase tracking-wider text-lg">Crear sala</p>
                  <p className="text-xs font-bold text-black/70">
                    Invita a tus amigos con un codigo
                  </p>
                </div>
              </button>
              <button
                onClick={() => setPanel('join')}
                className="w-full flex items-center gap-4 p-5 border-4 border-black bg-cyan-300 text-black shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
              >
                <div className="w-12 h-12 border-2 border-black bg-white flex items-center justify-center shrink-0">
                  <LogIn size={24} strokeWidth={2.5} />
                </div>
                <div className="text-left">
                  <p className="font-black uppercase tracking-wider text-lg">Unirse con codigo</p>
                  <p className="text-xs font-bold text-black/70">Entra a la sala de un amigo</p>
                </div>
              </button>
              <button
                onClick={onExit}
                className="w-full py-3 border-2 border-black bg-white text-gray-500 font-black uppercase tracking-wider text-xs active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
              >
                Volver al menu de modos
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (!room) {
    return (
      <div className="min-h-[100dvh] bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-black dark:text-white">
          <Loader2 size={32} className="animate-spin" strokeWidth={2.5} />
          <p className="font-black uppercase tracking-wider text-sm">Conectando a la sala...</p>
        </div>
      </div>
    )
  }

  const leaveButton = (
    <button
      onClick={handleLeave}
      className="w-full flex items-center justify-center gap-2 py-3 border-2 border-black bg-red-300 text-black font-black uppercase tracking-wider text-xs active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
    >
      <LogOut size={16} strokeWidth={2.5} />
      Salir de la sala
    </button>
  )

  if (room.status === 'LOBBY') {
    return (
      <div className="min-h-[100dvh] bg-gray-50 dark:bg-gray-950 text-black dark:text-white flex flex-col animate-fade-in-up">
        <div className="w-full max-w-md mx-auto p-4">
          <GameHeader title="El Impostor" backTo="/arcade" />
        </div>
        <div className="flex-1 w-full max-w-md mx-auto flex flex-col gap-5 p-4 pb-10">
          <div className="w-full border-4 border-black dark:border-white bg-white dark:bg-gray-800 p-5 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] text-center">
            <p className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">
              Codigo de sala
            </p>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-2 text-4xl font-black tracking-widest text-fuchsia-500 dark:text-fuchsia-400 hover:underline underline-offset-4"
            >
              {copied ? <Check size={24} strokeWidth={2.5} /> : <Copy size={24} strokeWidth={2.5} />}
              {room.code}
            </button>
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-3 uppercase tracking-wider">
              Comparte este codigo con tus amigos
            </p>
          </div>

          <div className="w-full border-4 border-black dark:border-white bg-white dark:bg-gray-800 p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]">
            <p className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
              <Users size={16} strokeWidth={2.5} />
              Jugadores ({room.players.length})
            </p>
            <div className="space-y-2">
              {room.players.map((p: ImpostorPlayer) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 border-2 border-black dark:border-white bg-gray-50 dark:bg-gray-700 px-3 py-2"
                >
                  <AvatarBox player={p} />
                  <span className="font-bold text-sm uppercase tracking-wider text-black dark:text-white truncate">
                    {p.name.split(' ')[0]}
                  </span>
                  {p.id === room.hostId && (
                    <span className="ml-auto flex items-center gap-1 border-2 border-black bg-yellow-300 text-black text-[10px] font-black uppercase tracking-widest px-2 py-0.5">
                      <Crown size={12} strokeWidth={2.5} />
                      Anfitrion
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-red-500 font-black text-xs uppercase tracking-wider text-center">
              {error}
            </p>
          )}

          {isHost ? (
            <>
              <div className="w-full border-4 border-black dark:border-white bg-white dark:bg-gray-800 p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] space-y-3">
                <p className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                  Configuracion
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {categoryMap.map(({ name, icon: Icon }) => {
                    const active = selectedCategories.has(name)
                    return (
                      <button
                        key={name}
                        onClick={() => toggleCategory(name)}
                        className={`flex items-center gap-2 px-2 py-2 border-2 border-black text-[10px] font-black uppercase tracking-wider transition-all ${
                          active
                            ? 'bg-yellow-300 text-black shadow-[3px_3px_0px_rgba(0,0,0,1)]'
                            : 'bg-white text-gray-500'
                        }`}
                      >
                        <Icon size={14} strokeWidth={2.5} />
                        {name}
                      </button>
                    )
                  })}
                </div>
                <div className="flex items-center justify-between border-t-2 border-black pt-3">
                  <div className="flex items-center gap-2">
                    <HelpCircle size={16} strokeWidth={2.5} />
                    <p className="font-black uppercase tracking-wider text-xs">
                      Pistas para el impostor
                    </p>
                  </div>
                  <button
                    onClick={toggleClues}
                    aria-pressed={cluesEnabled}
                    className={`w-12 h-7 border-2 border-black ${
                      cluesEnabled ? 'bg-emerald-400' : 'bg-gray-200'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 border-2 border-black bg-white transition-transform duration-200 ${
                        cluesEnabled ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
              </div>
              <button
                onClick={game.startGame}
                disabled={room.players.length < 3 || game.loading}
                className="w-full flex items-center justify-center gap-2 py-4 border-4 border-black bg-yellow-300 text-black font-black uppercase tracking-wider text-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {game.loading ? (
                  <Loader2 size={22} className="animate-spin" strokeWidth={2.5} />
                ) : (
                  <Play size={22} strokeWidth={2.5} />
                )}
                Iniciar Partida
              </button>
              {room.players.length < 3 && (
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 text-center uppercase tracking-wider">
                  Se necesitan al menos 3 jugadores
                </p>
              )}
            </>
          ) : (
            <div className="w-full border-4 border-black dark:border-white bg-white dark:bg-gray-800 p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] text-center">
              <p className="font-black uppercase tracking-wider text-sm text-gray-500 dark:text-gray-400">
                Esperando al anfitrion para iniciar...
              </p>
            </div>
          )}

          {leaveButton}
        </div>
      </div>
    )
  }

  if (room.status === 'PLAYING') {
    return (
      <div className="min-h-[100dvh] bg-gray-50 dark:bg-gray-950 text-black dark:text-white flex flex-col animate-fade-in-up">
        <div className="w-full max-w-md mx-auto p-4">
          <GameHeader title="El Impostor" backTo="/arcade" />
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-6 max-w-md mx-auto w-full p-4">
          <div className="text-center">
            <p className="text-xs font-black uppercase tracking-widest text-fuchsia-500 dark:text-fuchsia-400">
              Ronda {room.rounds}
            </p>
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider mt-1">
              Tu carta secreta
            </h1>
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-1">
              No muestres tu rol a nadie
            </p>
          </div>

          {game.mySecret ? (
            <ImpostorCard
              isImpostor={game.mySecret.isImpostor}
              word={game.mySecret.word}
              description={game.mySecret.description}
              clue={game.mySecret.clue}
              categoria={game.mySecret.categoria}
              cluesEnabled={room.cluesEnabled}
              onPass={() => {}}
              isOnlineMode
            />
          ) : (
            <div className="flex items-center gap-3 border-4 border-black bg-white p-5 shadow-[6px_6px_0px_rgba(0,0,0,1)]">
              <Loader2 size={24} className="animate-spin" strokeWidth={2.5} />
              <p className="font-black uppercase tracking-wider text-sm">Cargando tu carta...</p>
            </div>
          )}

          {isHost ? (
            <button
              onClick={game.passToVoting}
              className="w-full flex items-center justify-center gap-2 py-4 border-4 border-black bg-cyan-300 text-black font-black uppercase tracking-wider text-lg shadow-[8px_8px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
            >
              <Vote size={22} strokeWidth={2.5} />
              Pasar a votacion
            </button>
          ) : (
            <div className="w-full border-2 border-dashed border-gray-400 dark:border-gray-600 bg-white dark:bg-gray-800 p-4 text-center">
              <p className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                Esperando a que el anfitrion inicie la votacion...
              </p>
            </div>
          )}

          {leaveButton}
        </div>
      </div>
    )
  }

  if (room.status === 'VOTING') {
    const myVote = room.votes[userId]
    const counts = computeVoteCounts(room.votes)
    return (
      <div className="min-h-[100dvh] bg-gray-50 dark:bg-gray-950 text-black dark:text-white flex flex-col animate-fade-in-up">
        <div className="w-full max-w-md mx-auto p-4">
          <GameHeader title="El Impostor" backTo="/arcade" />
        </div>
        <div className="flex-1 w-full max-w-md mx-auto flex flex-col gap-5 p-4 pb-10">
          <div className="text-center">
            <p className="text-xs font-black uppercase tracking-widest text-fuchsia-500 dark:text-fuchsia-400">
              Ronda {room.rounds}
            </p>
            <h1 className="text-2xl font-black uppercase tracking-wider mt-1">Votacion</h1>
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-1">
              {myVote
                ? 'Voto registrado. Espera a los demas...'
                : 'Elige a quien crees que es el impostor'}
            </p>
          </div>

          <div className="w-full border-4 border-black dark:border-white bg-white dark:bg-gray-800 p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] space-y-2">
            {room.players.map((p: ImpostorPlayer) => {
              const isMe = p.id === userId
              const count = counts[p.id] ?? 0
              const votedForMe = myVote === p.id
              return (
                <button
                  key={p.id}
                  onClick={() => game.vote(p.id)}
                  disabled={isMe || !!myVote}
                  className={`w-full flex items-center gap-3 border-2 border-black px-3 py-3 font-black uppercase tracking-wider text-sm transition-all disabled:cursor-not-allowed ${
                    votedForMe
                      ? 'bg-emerald-300 text-black'
                      : isMe
                        ? 'bg-gray-100 text-gray-400'
                        : 'bg-white text-black hover:bg-yellow-200 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none shadow-[3px_3px_0px_rgba(0,0,0,1)]'
                  }`}
                >
                  <AvatarBox player={p} />
                  <span className="truncate">{p.name.split(' ')[0]}</span>
                  <span className="ml-auto flex items-center gap-2">
                    <span className="border-2 border-black bg-white px-2 py-0.5 text-xs">
                      {count} {count === 1 ? 'voto' : 'votos'}
                    </span>
                    {votedForMe && <Check size={18} strokeWidth={3} />}
                  </span>
                </button>
              )
            })}
          </div>

          {error && (
            <p className="text-red-500 font-black text-xs uppercase tracking-wider text-center">
              {error}
            </p>
          )}

          {game.allVoted ? (
            <div className="w-full border-4 border-black bg-yellow-200 p-4 shadow-[6px_6px_0px_rgba(0,0,0,1)] text-center">
              <p className="font-black uppercase tracking-wider text-sm">
                Todos votaron. Calculando resultados...
              </p>
            </div>
          ) : (
            isHost && (
              <button
                onClick={game.finishVoting}
                className="w-full flex items-center justify-center gap-2 py-4 border-4 border-black bg-cyan-300 text-black font-black uppercase tracking-wider text-lg shadow-[8px_8px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
              >
                <Check size={22} strokeWidth={2.5} />
                Cerrar votacion
              </button>
            )
          )}

          {leaveButton}
        </div>
      </div>
    )
  }

  const counts = computeVoteCounts(room.votes)
  const impostorPlayers = room.players.filter((p) => room.impostorIds.includes(p.id))
  const civilPlayer = room.players.find((p) => !room.impostorIds.includes(p.id))
  const secretWord = civilPlayer ? room.secrets[civilPlayer.id]?.word ?? '' : ''

  const mostVotedCount = room.players.reduce(
    (max, p) => Math.max(max, counts[p.id] ?? 0),
    0,
  )
  const mostVotedIds = new Set(
    room.players.filter((p) => (counts[p.id] ?? 0) === mostVotedCount).map((p) => p.id),
  )
  const impostorSpotted =
    mostVotedCount > 0 && room.impostorIds.some((id) => mostVotedIds.has(id))

  const resultType =
    mostVotedCount === 0 ? 'none' : impostorSpotted ? 'civilians_win' : 'impostor_wins'
  const bannerClass =
    resultType === 'civilians_win'
      ? 'bg-emerald-500'
      : resultType === 'impostor_wins'
        ? 'bg-red-500'
        : 'bg-gray-400'
  const bannerText =
    resultType === 'civilians_win'
      ? '¡Los civiles ganan!'
      : resultType === 'impostor_wins'
        ? '¡El impostor gana!'
        : 'Sin votos'

  return (
    <div className="min-h-[100dvh] bg-gray-50 dark:bg-gray-950 text-black dark:text-white flex flex-col animate-fade-in-up">
      <div className="w-full max-w-md mx-auto p-4">
        <GameHeader title="El Impostor" backTo="/arcade" />
      </div>
      <div className="flex-1 w-full max-w-md mx-auto flex flex-col gap-5 p-4 pb-10">
        <div className={`w-full border-4 border-black p-6 text-center shadow-[8px_8px_0px_rgba(0,0,0,1)] ${bannerClass}`}>
          {resultType === 'civilians_win' ? (
            <Trophy size={44} strokeWidth={2.5} className="mx-auto mb-2 text-black" />
          ) : resultType === 'impostor_wins' ? (
            <Skull size={44} strokeWidth={2.5} className="mx-auto mb-2 text-black" />
          ) : null}
          <p className="text-2xl sm:text-3xl font-black uppercase tracking-widest text-black">
            {bannerText}
          </p>
        </div>

        <div className="w-full border-4 border-black dark:border-white bg-white dark:bg-gray-800 p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] space-y-4">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">
              El impostor era
            </p>
            {impostorPlayers.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 border-2 border-black bg-gray-50 dark:bg-gray-700 px-3 py-2"
              >
                <AvatarBox player={p} />
                <span className="font-black uppercase tracking-wider text-sm text-black dark:text-white">
                  {p.name.split(' ')[0]}
                </span>
                <span className="ml-auto flex items-center gap-1 border-2 border-black bg-red-500 text-black text-[10px] font-black uppercase tracking-widest px-2 py-0.5">
                  <Skull size={12} strokeWidth={2.5} />
                  Impostor
                </span>
              </div>
            ))}
          </div>
          <div className="border-t-2 border-black pt-4">
            <p className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1">
              La palabra era
            </p>
            <p className="text-2xl font-black uppercase tracking-wider text-black dark:text-white">
              {secretWord}
            </p>
          </div>
          <div className="border-t-2 border-black pt-4">
            <p className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">
              Votos finales
            </p>
            <div className="space-y-1">
              {room.players.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between text-sm font-bold uppercase tracking-wider text-black dark:text-white"
                >
                  <span className="truncate">{p.name.split(' ')[0]}</span>
                  <span>{counts[p.id] ?? 0} votos</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {isHost ? (
          <button
            onClick={game.playAgain}
            className="w-full flex items-center justify-center gap-2 py-4 border-4 border-black bg-yellow-300 text-black font-black uppercase tracking-wider text-lg shadow-[8px_8px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
          >
            <RotateCcw size={22} strokeWidth={2.5} />
            Jugar otra vez
          </button>
        ) : (
          <div className="w-full border-4 border-black dark:border-white bg-white dark:bg-gray-800 p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] text-center">
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              El anfitrion iniciara la siguiente partida...
            </p>
          </div>
        )}

        {leaveButton}
      </div>
    </div>
  )
}