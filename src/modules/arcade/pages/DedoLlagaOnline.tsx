import { useEffect, useRef } from 'react'
import { Hand, Loader2, Crown } from 'lucide-react'
import {
  emitirVotoDedo,
  avanzarFaseDedo,
  siguienteCartaDedo,
  type DedoRoom,
} from '../../../firebase/services'
import GameHeader from '../../../components/GameHeader'
import UserAvatar from '../../../components/UserAvatar'
import type { DeckContenido } from '../../../firebase/content'

interface Props {
  room: DedoRoom
  userId: string
  isHost: boolean
  roomCode: string
  deck?: DeckContenido
  usedCards: Set<string>
  onCardUsed: (card: string) => void
}

function pickRandomCard(deck: DeckContenido | undefined, used: Set<string>): string {
  const cartas = deck?.cartas ?? []
  const pool = cartas.length > 0 ? cartas : ['¿Quien es mas probable que...?']
  const available = pool.filter((c) => !used.has(c))
  if (available.length === 0) return pool[Math.floor(Math.random() * pool.length)]!
  return available[Math.floor(Math.random() * available.length)]!
}

function AvatarDeJugador({ p }: { p: { name: string; avatar?: string; avatarType?: string; avatarIcon?: string } }) {
  return (
    <UserAvatar
      name={p.name}
      color={p.avatar || '#fbbf24'}
      type={p.avatarType === 'shape' ? 'shape' : 'letter'}
      avatarIcon={p.avatarIcon || 'Gamepad2'}
      size={32}
      className="shrink-0"
    />
  )
}

export default function DedoLlagaOnline({
  room,
  userId,
  isHost,
  roomCode,
  deck,
  usedCards,
  onCardUsed,
}: Props) {
  const votes = room.votes || {}
  const totalPlayers = room.players.length
  const totalVotes = Object.keys(votes).length
  const myVote = votes[userId] ?? null
  const hasVotedLocal = useRef(false)

  useEffect(() => {
    if (hasVotedLocal.current && !myVote) {
      hasVotedLocal.current = false
    }
  }, [myVote])

  useEffect(() => {
    if (room.phase === 'voting' && totalVotes >= totalPlayers && totalPlayers > 0) {
      const timer = setTimeout(async () => {
        try {
          await avanzarFaseDedo(roomCode, 'results')
        } catch {
          // error silencioso
        }
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [room.phase, totalVotes, totalPlayers, roomCode])

  const handleVote = async (targetId: string) => {
    if (myVote || hasVotedLocal.current) return
    hasVotedLocal.current = true
    try {
      await emitirVotoDedo(roomCode, userId, targetId)
    } catch {
      hasVotedLocal.current = false
    }
  }

  const handleNextCard = async () => {
    const card = pickRandomCard(deck, usedCards)
    onCardUsed(card)
    try {
      await siguienteCartaDedo(roomCode, card)
    } catch {
      // error silencioso
    }
  }

  const voteCounts: Record<string, number> = {}
  for (const targetId of Object.values(votes)) {
    voteCounts[targetId] = (voteCounts[targetId] || 0) + 1
  }

  let maxVotes = 0
  let winnerId = ''
  for (const [pid, count] of Object.entries(voteCounts)) {
    if (count > maxVotes) {
      maxVotes = count
      winnerId = pid
    }
  }
  const winner = room.players.find((p) => p.id === winnerId)
  const tiedPlayers = room.players.filter((p) => voteCounts[p.id] === maxVotes && maxVotes > 0)

  if (room.phase === 'results') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-black dark:text-white flex flex-col p-4 sm:p-6 transition-colors">
        <div className="w-full max-w-md mx-auto pt-2 pb-8">
          <GameHeader title="¿Quién Es Más Probable...?" backTo="/arcade" />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md mx-auto pb-12 gap-6">
          <div
            className={`w-full border-4 border-black dark:border-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] text-center ${
              tiedPlayers.length > 1
                ? 'bg-yellow-200 dark:bg-yellow-950'
                : 'bg-fuchsia-200 dark:bg-fuchsia-950'
            }`}
          >
            {tiedPlayers.length > 1 ? (
              <>
                <p className="text-lg font-black uppercase tracking-wider text-fuchsia-700 dark:text-yellow-400 mb-2">
                  EMPATE
                </p>
                <p className="text-2xl font-black uppercase tracking-tighter text-black dark:text-yellow-100 animate-pulse">
                  {tiedPlayers.map((p) => p.name.split(' ')[0]).join(' Y ')} SE TOMAN UN SHOT
                </p>
              </>
            ) : winner ? (
              <>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Crown size={22} strokeWidth={2.5} className="text-yellow-600 dark:text-yellow-400" />
                  <p className="text-lg font-black uppercase tracking-wider text-fuchsia-700 dark:text-fuchsia-300">
                    EL MÁS PROBABLE
                  </p>
                  <Crown size={22} strokeWidth={2.5} className="text-yellow-600 dark:text-yellow-400" />
                </div>
                <p className="text-2xl font-black uppercase tracking-tighter text-black dark:text-white animate-pulse">
                  {winner.name.split(' ')[0]} RECIBE LA PENITENCIA
                </p>
              </>
            ) : (
              <p className="text-2xl font-black uppercase tracking-tighter text-black dark:text-white">
                Sin resultados
              </p>
            )}

            <div className="mt-6 space-y-1">
              {room.players.map((p) => (
                <div
                  key={p.id}
                  className={`flex items-center justify-between gap-3 text-xs font-bold border border-black dark:border-white py-1.5 px-2 ${
                    p.id === winnerId && tiedPlayers.length <= 1
                      ? 'bg-yellow-300 dark:bg-yellow-500 text-black'
                      : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-300'
                  }`}
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <AvatarDeJugador p={p} />
                    <span className="truncate">{p.name.split(' ')[0]}</span>
                  </span>
                  <span className="shrink-0">
                    {voteCounts[p.id] || 0} voto{ (voteCounts[p.id] || 0) !== 1 ? 's' : '' }
                  </span>
                </div>
              ))}
            </div>
          </div>

          {isHost && (
            <button
              onClick={handleNextCard}
              className="w-full py-4 font-black text-xl uppercase bg-yellow-400 dark:bg-yellow-500 text-black border-4 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
            >
              SIGUIENTE CARTA
            </button>
          )}

          {!isHost && (
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">
              Esperando a que el anfitrion avance...
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-black dark:text-white flex flex-col p-4 sm:p-6 transition-colors">
      <div className="w-full max-w-3xl mx-auto pt-2 pb-8">
        <GameHeader title="¿Quién Es Más Probable...?" backTo="/arcade" />
      </div>

      <div className="flex-1 flex flex-col items-center w-full max-w-3xl mx-auto pb-12">
        <div className="relative bg-gradient-to-br from-fuchsia-100 via-white to-violet-200 dark:from-fuchsia-950 dark:via-gray-900 dark:to-violet-950 border-4 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] p-8 w-full flex flex-col justify-center items-center text-center rounded-none select-none mb-6 overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.06] dark:opacity-[0.12] pointer-events-none"
            style={{
              backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 8px, transparent 8px, transparent 20px)',
            }}
          />
          <div className="relative flex flex-col items-center z-10">
            <div className="w-14 h-14 border-2 border-black dark:border-white bg-fuchsia-400 dark:bg-fuchsia-500 flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rotate-3 mb-5">
              <Hand size={28} strokeWidth={2.5} className="text-black dark:text-gray-900" />
            </div>
            <span className="px-3 py-1.5 bg-fuchsia-500 dark:bg-fuchsia-400 text-white dark:text-gray-900 border-2 border-black dark:border-white font-black text-[10px] sm:text-xs uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              ¿QUIÉN ES MÁS PROBABLE...?
            </span>
            <p className="mt-6 text-2xl sm:text-3xl font-black text-black dark:text-white uppercase tracking-tighter leading-tight max-w-sm drop-shadow-[2px_2px_0px_rgba(217,70,239,0.35)] dark:drop-shadow-[2px_2px_0px_rgba(255,255,255,0.25)]">
              {room.currentCard}
            </p>
          </div>
        </div>

        {myVote ? (
          <div className="flex flex-col items-center gap-4 w-full mb-6">
            <Loader2 size={24} className="animate-spin" strokeWidth={2.5} />
            <p className="text-sm font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
              ESPERANDO A LOS DEMAS... (Votos: {totalVotes}/{totalPlayers})
            </p>
          </div>
        ) : (
          <>
            <div className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-4">
              Votos: {totalVotes} / {totalPlayers}
            </div>

            <div className="grid grid-cols-2 gap-3 w-full mb-6">
              {room.players.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleVote(p.id)}
                  className="flex flex-col items-center gap-2 py-4 px-2 border-4 border-black dark:border-white bg-white dark:bg-gray-800 text-black dark:text-white font-black uppercase tracking-wider text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all hover:bg-fuchsia-100 dark:hover:bg-fuchsia-900/40 hover:-translate-y-0.5"
                >
                  <AvatarDeJugador p={p} />
                  <span className="text-xs truncate w-full">{p.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}