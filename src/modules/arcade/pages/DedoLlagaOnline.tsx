import { useEffect, useRef } from 'react'
import { Hand, Loader2 } from 'lucide-react'
import {
  emitirVotoDedo,
  avanzarFaseDedo,
  siguienteCartaDedo,
  type DedoRoom,
} from '../../../firebase/services'
import { getDeckById } from '../data/decks'
import GameHeader from '../../../components/GameHeader'

const DECK = getDeckById('dedo-en-la-llaga')!

interface Props {
  room: DedoRoom
  userId: string
  isHost: boolean
  roomCode: string
  usedCards: Set<string>
  onCardUsed: (card: string) => void
}

function pickRandomCard(used: Set<string>): string {
  const available = DECK.cartas.filter((c) => !used.has(c))
  if (available.length === 0) return DECK.cartas[Math.floor(Math.random() * DECK.cartas.length)]!
  return available[Math.floor(Math.random() * available.length)]!
}

export default function DedoLlagaOnline({
  room,
  userId,
  isHost,
  roomCode,
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
    const card = pickRandomCard(usedCards)
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
          <GameHeader title="El Dedo en la Llaga" backTo="/arcade" />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md mx-auto pb-12 gap-6">
          <div className="w-full border-4 border-black dark:border-white bg-white dark:bg-gray-800 p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] text-center">
            {tiedPlayers.length > 1 ? (
              <>
                <p className="text-lg font-black uppercase tracking-wider text-fuchsia-500 dark:text-fuchsia-400 mb-2">
                  EMPATE
                </p>
                <p className="text-2xl font-black uppercase tracking-tighter text-black dark:text-white animate-pulse">
                  {tiedPlayers.map((p) => p.name.split(' ')[0]).join(' Y ')} SE TOMAN UN SHOT
                </p>
              </>
            ) : winner ? (
              <p className="text-2xl font-black uppercase tracking-tighter text-black dark:text-white animate-pulse">
                {winner.name.split(' ')[0]} RECIBE LA PENITENCIA
              </p>
            ) : (
              <p className="text-2xl font-black uppercase tracking-tighter text-black dark:text-white">
                Sin resultados
              </p>
            )}

            <div className="mt-6 space-y-1">
              {room.players.map((p) => (
                <div
                  key={p.id}
                  className="flex justify-between text-xs font-bold text-gray-500 dark:text-gray-400 border-b border-black dark:border-white py-1"
                >
                  <span>{p.name.split(' ')[0]}</span>
                  <span>{voteCounts[p.id] || 0} voto{ (voteCounts[p.id] || 0) !== 1 ? 's' : '' }</span>
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
      <div className="w-full max-w-md mx-auto pt-2 pb-8">
        <GameHeader title="El Dedo en la Llaga" backTo="/arcade" />
      </div>

      <div className="flex-1 flex flex-col items-center w-full max-w-md mx-auto pb-12">
        <div className="bg-white dark:bg-gray-800 border-4 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] p-8 w-full flex flex-col justify-center items-center text-center rounded-none select-none mb-6">
          <Hand size={40} strokeWidth={2.5} className="mb-6 opacity-40 text-black dark:text-white" />
          <p className="text-sm font-black uppercase tracking-widest text-fuchsia-500 dark:text-fuchsia-400 mb-4">
            QUIEN ES MAS PROBABLE QUE...
          </p>
          <p className="text-2xl sm:text-3xl font-black text-black dark:text-white uppercase tracking-tighter leading-tight">
            {room.currentCard}
          </p>
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
                  className="py-4 border-4 border-black dark:border-white bg-white dark:bg-gray-800 text-black dark:text-white font-black uppercase tracking-wider text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all hover:bg-fuchsia-100 dark:hover:bg-fuchsia-900/30"
                >
                  {p.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
