import { useEffect, useState } from 'react'
import { Hand, Vote, Trophy, ChevronRight } from 'lucide-react'
import { getDeckById } from '../../arcade/data/decks'
import type { Sala } from '../../../firebase/services'

interface Props {
  sala: Sala
  userId: string
  isHost: boolean
  allVoted: boolean
  myVote: string | null
  onStartVoting: () => void
  onVote: (toPlayerId: string) => void
  onRevealResults: () => void
  onNextRound: () => void
}

export default function VotingEngine({
  sala,
  isHost,
  allVoted,
  myVote,
  onStartVoting,
  onVote,
  onRevealResults,
  onNextRound,
}: Props) {
  const deck = getDeckById(sala.deckId)
  const cartas = deck?.cartas ?? []
  const [cardIndex, setCardIndex] = useState(0)

  useEffect(() => {
    setCardIndex((sala.currentRound - 1) % Math.max(cartas.length, 1))
  }, [sala.currentRound, cartas.length])

  const currentCard = cartas[cardIndex] ?? 'Sin preguntas'
  const activePlayers = sala.players.filter((p) => p.active)

  const votes = sala.votes || {}
  const voteCounts: Record<string, number> = {}
  for (const toId of Object.values(votes)) {
    voteCounts[toId] = (voteCounts[toId] || 0) + 1
  }
  let winnerId = ''
  let maxVotes = 0
  for (const [pid, count] of Object.entries(voteCounts)) {
    if (count > maxVotes) {
      maxVotes = count
      winnerId = pid
    }
  }
  const winner = sala.players.find((p) => p.id === winnerId)

  if (sala.status === 'CARD') {
    return (
      <div className="min-h-[100dvh] bg-gray-950 text-white flex flex-col animate-fade-in-up">
        <div className="w-full max-w-md mx-auto p-4 flex-1 flex flex-col items-center justify-center gap-8">
          <div className="text-center">
            <p className="text-xs font-black uppercase tracking-widest text-yellow-400 mb-2">
              Ronda {sala.currentRound}
            </p>
            <Hand size={36} strokeWidth={2.5} className="mx-auto mb-4 text-yellow-400" />
          </div>

          <div className="w-full border-4 border-yellow-400 bg-black p-8 shadow-[8px_8px_0px_0px_rgba(234,179,8,1)]">
            <p className="font-black uppercase tracking-tighter text-2xl text-center leading-tight text-white">
              {currentCard}
            </p>
          </div>

          {isHost && (
            <button
              onClick={onStartVoting}
              className="w-full flex items-center justify-center gap-2 py-4 border-4 border-yellow-400 bg-yellow-400 text-black font-black uppercase tracking-wider text-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
            >
              <Vote size={22} strokeWidth={2.5} />
              CONTINUAR A VOTACION
            </button>
          )}

          {!isHost && (
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Esperando al anfitrion...
            </p>
          )}
        </div>
      </div>
    )
  }

  if (sala.status === 'VOTING') {
    return (
      <div className="min-h-[100dvh] bg-gray-950 text-white flex flex-col animate-fade-in-up">
        <div className="w-full max-w-md mx-auto p-4 flex-1 flex flex-col gap-6">
          <div className="text-center">
            <p className="text-xs font-black uppercase tracking-widest text-yellow-400 mb-1">
              Ronda {sala.currentRound} - Votacion
            </p>
            <p className="font-black uppercase tracking-tighter text-lg text-white/60">
              {currentCard}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 flex-1 content-center">
            {activePlayers.map((p) => {
              const selected = myVote === p.id
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    if (myVote) return
                    onVote(p.id)
                  }}
                  disabled={!!myVote}
                  className={`flex flex-col items-center gap-2 py-6 border-4 font-black uppercase tracking-wider transition-all ${
                    selected
                      ? 'bg-yellow-400 text-black border-yellow-400 shadow-[8px_8px_0px_0px_rgba(234,179,8,1)]'
                      : myVote
                        ? 'bg-gray-800 text-gray-500 border-gray-700 opacity-50 cursor-not-allowed'
                        : 'bg-gray-900 text-white border-white hover:bg-yellow-400 hover:text-black hover:border-yellow-400 active:translate-x-1 active:translate-y-1 active:shadow-none'
                  }`}
                >
                  <div
                    className={`w-14 h-14 border-2 flex items-center justify-center text-xl font-black ${
                      selected
                        ? 'bg-white text-black border-black'
                        : 'bg-gray-700 text-white border-white'
                    }`}
                  >
                    {p.displayName.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm">{p.displayName}</span>
                </button>
              )
            })}
          </div>

          <div className="text-center">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              {Object.keys(votes).length} / {activePlayers.length} votaron
            </p>
          </div>

          {isHost && allVoted && (
            <button
              onClick={onRevealResults}
              className="w-full flex items-center justify-center gap-2 py-4 border-4 border-yellow-400 bg-yellow-400 text-black font-black uppercase tracking-wider text-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
            >
              <Trophy size={22} strokeWidth={2.5} />
              VER RESULTADOS
            </button>
          )}
          {isHost && !allVoted && (
            <p className="text-xs font-bold text-gray-500 text-center uppercase tracking-wider">
              Esperando votos...
            </p>
          )}
        </div>
      </div>
    )
  }

  if (sala.status === 'RESULTS') {
    const sorted = [...sala.players].sort((a, b) => b.score - a.score)

    return (
      <div className="min-h-[100dvh] bg-gray-950 text-white flex flex-col animate-fade-in-up">
        <div className="w-full max-w-md mx-auto p-4 flex-1 flex flex-col items-center justify-center gap-8">
          <div className="text-center">
            <p className="text-xs font-black uppercase tracking-widest text-yellow-400 mb-2">
              Resultados - Ronda {sala.currentRound}
            </p>
          </div>

          {winner ? (
            <div className="w-full border-4 border-yellow-400 bg-yellow-400 p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center">
              <Trophy size={40} strokeWidth={2.5} className="mx-auto mb-3 text-black" />
              <p className="font-black uppercase tracking-tighter text-2xl text-black">
                EL MAS PROBABLE ES:
              </p>
              <p className="font-black uppercase tracking-tighter text-3xl text-black mt-2">
                {winner.displayName}
              </p>
              <p className="text-black/60 font-bold text-sm mt-2">
                {maxVotes} voto{maxVotes !== 1 ? 's' : ''}
              </p>
            </div>
          ) : (
            <div className="w-full border-4 border-gray-600 bg-gray-800 p-8 shadow-[8px_8px_0px_0px_rgba(75,85,99,1)] text-center">
              <p className="font-black uppercase tracking-tighter text-xl text-gray-400">
                Nadie recibio votos
              </p>
            </div>
          )}

          <div className="w-full border-4 border-white bg-black p-4 shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
            <p className="text-xs font-black uppercase tracking-widest text-yellow-400 mb-3">
              Puntuaciones
            </p>
            <div className="space-y-2">
              {sorted.map((p, i) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between border-2 border-gray-700 bg-gray-900 px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-gray-500 w-4">
                      {i + 1}
                    </span>
                    <span className="font-bold text-sm uppercase tracking-wider text-white">
                      {p.displayName}
                    </span>
                  </div>
                  <span className="font-black text-yellow-400">
                    {p.score}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {isHost && (
            <button
              onClick={onNextRound}
              className="w-full flex items-center justify-center gap-2 py-4 border-4 border-yellow-400 bg-yellow-400 text-black font-black uppercase tracking-wider text-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
            >
              <ChevronRight size={22} strokeWidth={2.5} />
              SIGUIENTE RONDA
            </button>
          )}

          {!isHost && (
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Esperando al anfitrion...
            </p>
          )}
        </div>
      </div>
    )
  }

  return null
}
