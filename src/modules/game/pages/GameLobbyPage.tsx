import { useState } from 'react'
import {
  Plus,
  LogIn,
  Users,

  Copy,
  Check,
  Loader2,
  Play,
} from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'
import { useGameRoom } from '../hooks/useGameRoom'
import GameHeader from '../../../components/GameHeader'
import BackButton from '../../../components/BackButton'
import VotingEngine from '../engine/VotingEngine'
import CardGameEngine from '../../arcade/components/CardGameEngine'
import { getDeckById } from '../../arcade/data/decks'

export default function GameLobbyPage() {
  const { user, userProfile } = useAuth()
  const [mode, setMode] = useState<'menu' | 'create' | 'join' | null>('menu')
  const [joinCode, setJoinCode] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const gameRoom = useGameRoom({
    userId: user?.uid ?? '',
    displayName: userProfile?.nickname || user?.displayName || 'Invitado',
    onError: (msg) => setError(msg),
  })

  const deck = getDeckById('dedo-en-la-llaga')!

  const handleCreate = async () => {
    setError('')
    await gameRoom.createRoom('dedo-en-la-llaga')
    setMode(null)
  }

  const handleJoin = async () => {
    if (joinCode.trim().length !== 4) return
    setError('')
    await gameRoom.joinRoom(joinCode.trim().toUpperCase())
    setMode(null)
  }

  const handleCopyCode = () => {
    if (!gameRoom.roomCode) return
    navigator.clipboard.writeText(gameRoom.roomCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleStartGame = async () => {
    await gameRoom.startGame()
  }

  if (gameRoom.sala && gameRoom.sala.status !== 'LOBBY') {
    return (
      <VotingEngine
        sala={gameRoom.sala}
        userId={user?.uid ?? ''}
        isHost={gameRoom.isHost}
        allVoted={gameRoom.allVoted ?? false}
        myVote={gameRoom.myVote}
        onStartVoting={gameRoom.startVoting}
        onVote={gameRoom.vote}
        onRevealResults={gameRoom.revealResults}
        onNextRound={gameRoom.nextRound}
      />
    )
  }

  if (gameRoom.roomCode && gameRoom.sala) {
    return (
      <div className="min-h-[100dvh] bg-gray-950 text-white flex flex-col animate-fade-in-up">
        <GameHeader title="Dedo en la Llaga" backTo="/arcade" />
        <div className="w-full max-w-md mx-auto p-4 flex-1 flex flex-col items-center justify-center gap-8">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-yellow-400 bg-yellow-400 flex items-center justify-center mx-auto mb-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <Users size={32} strokeWidth={2.5} className="text-black" />
            </div>
            <p className="text-xs font-black uppercase tracking-widest text-yellow-400 mb-1">
              Sala de Juego
            </p>
          </div>

          <div className="w-full border-4 border-white bg-black p-6 shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] text-center">
            <p className="text-xs font-black uppercase tracking-widest text-gray-500 mb-2">
              Codigo de Sala
            </p>
            <button
              onClick={handleCopyCode}
              className="inline-flex items-center gap-2 text-4xl font-black tracking-widest text-yellow-400 hover:underline underline-offset-4"
            >
              {copied ? (
                <>
                  <Check size={24} strokeWidth={2.5} />
                  {gameRoom.roomCode}
                </>
              ) : (
                <>
                  <Copy size={24} strokeWidth={2.5} />
                  {gameRoom.roomCode}
                </>
              )}
            </button>
            <p className="text-xs font-bold text-gray-500 mt-3 uppercase tracking-wider">
              Comparte este codigo con tus amigos
            </p>
          </div>

          <div className="w-full border-4 border-white bg-black p-4 shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]">
            <p className="text-xs font-black uppercase tracking-widest text-yellow-400 mb-3">
              Jugadores ({gameRoom.activePlayers.length})
            </p>
            <div className="space-y-2">
              {gameRoom.activePlayers.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 border-2 border-gray-700 bg-gray-900 px-3 py-2"
                >
                  <div className="w-8 h-8 border-2 border-yellow-400 bg-yellow-400 flex items-center justify-center text-xs font-black text-black">
                    {p.displayName.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-bold text-sm uppercase tracking-wider text-white">
                    {p.displayName.split(' ')[0]}
                    {p.id === gameRoom.sala?.hostId && (
                      <span className="text-[10px] text-yellow-400 ml-2">
                        (Anfitrion)
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-red-500 font-black text-sm uppercase tracking-wider">
              {error}
            </p>
          )}

          {gameRoom.isHost ? (
            <button
              onClick={handleStartGame}
              disabled={gameRoom.loading || gameRoom.activePlayers.length < 2}
              className="w-full flex items-center justify-center gap-2 py-4 border-4 border-yellow-400 bg-yellow-400 text-black font-black uppercase tracking-wider text-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {gameRoom.loading ? (
                <Loader2 size={22} className="animate-spin" strokeWidth={2.5} />
              ) : (
                <Play size={22} strokeWidth={2.5} />
              )}
              INICIAR PARTIDA
            </button>
          ) : (
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Esperando al anfitrion...
            </p>
          )}
        </div>
      </div>
    )
  }

  if (mode === 'create' || mode === 'join') {
    return (
      <div className="min-h-[100dvh] bg-gray-950 text-white flex flex-col">
        <div className="w-full max-w-md mx-auto p-4 pt-20 flex-1 flex flex-col gap-6">
          <div className="self-start">
            <BackButton onClick={() => { setMode('menu'); setError('') }} />
          </div>
          <div className="flex flex-col items-center justify-center gap-6 flex-1">

          {mode === 'create' && (
            <>
              <div className="text-center">
                <Plus size={40} strokeWidth={2.5} className="mx-auto mb-3 text-yellow-400" />
                <p className="text-xl font-black uppercase tracking-tighter">
                  Crear Sala
                </p>
                <p className="text-xs font-bold text-gray-500 mt-1 uppercase tracking-wider">
                  Inicia una partida de Dedo en la Llaga
                </p>
              </div>

              <button
                onClick={handleCreate}
                disabled={gameRoom.loading}
                className="w-full flex items-center justify-center gap-2 py-4 border-4 border-yellow-400 bg-yellow-400 text-black font-black uppercase tracking-wider text-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all disabled:opacity-50"
              >
                {gameRoom.loading ? (
                  <Loader2 size={22} className="animate-spin" strokeWidth={2.5} />
                ) : (
                  <Plus size={22} strokeWidth={2.5} />
                )}
                CREAR SALA
              </button>

              {error && (
                <p className="text-red-500 font-black text-sm uppercase tracking-wider">
                  {error}
                </p>
              )}
            </>
          )}

          {mode === 'join' && (
            <>
              <div className="text-center">
                <LogIn size={40} strokeWidth={2.5} className="mx-auto mb-3 text-yellow-400" />
                <p className="text-xl font-black uppercase tracking-tighter">
                  Unirse a Sala
                </p>
                <p className="text-xs font-bold text-gray-500 mt-1 uppercase tracking-wider">
                  Ingresa el codigo de 4 caracteres
                </p>
              </div>

              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 4))}
                placeholder="XJ7K"
                maxLength={4}
                className="w-full text-center py-4 px-4 border-4 border-white bg-black text-white font-black uppercase tracking-widest text-3xl placeholder:text-gray-700 focus:outline-none focus:ring-0"
              />

              <button
                onClick={handleJoin}
                disabled={gameRoom.loading || joinCode.trim().length !== 4}
                className="w-full flex items-center justify-center gap-2 py-4 border-4 border-yellow-400 bg-yellow-400 text-black font-black uppercase tracking-wider text-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all disabled:opacity-50"
              >
                {gameRoom.loading ? (
                  <Loader2 size={22} className="animate-spin" strokeWidth={2.5} />
                ) : (
                  <LogIn size={22} strokeWidth={2.5} />
                )}
                UNIRSE
              </button>

              {error && (
                <p className="text-red-500 font-black text-sm uppercase tracking-wider">
                  {error}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col p-4 sm:p-6 transition-colors text-black dark:text-white">
      <div className="w-full max-w-md mx-auto pt-2 pb-8">
        <GameHeader title="El Dedo en la Llaga" backTo="/arcade" />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md mx-auto pb-12">
        <CardGameEngine deck={deck} />
      </div>
    </div>
    )
  }
