import { useState } from 'react'
import { UserPlus, X, Play, Hand, Shuffle, Layers, Loader2 } from 'lucide-react'
import GameHeader from '../../../components/GameHeader'
import { useCardGame } from '../hooks/useCardGame'
import { getDeckById } from '../data/decks'

const deck = getDeckById('dedo-en-la-llaga')!

type GamePhase = 'setup' | 'voting' | 'resolution'

interface VoteCount {
  [playerName: string]: number
}

export default function DedoLlagaSetupPage() {
  const [phase, setPhase] = useState<GamePhase>('setup')
  const [names, setNames] = useState<string[]>([])
  const [inputName, setInputName] = useState('')
  const [votes, setVotes] = useState<VoteCount>({})
  const [result, setResult] = useState<{
    winner: string
    tiedNames?: string[]
  } | null>(null)

  const {
    cartaActual,
    totalCartas,
    cartasJugadas,
    obtenerSiguiente,
    barajar,
  } = useCardGame(deck.cartas)

  const addName = () => {
    const trimmed = inputName.trim()
    if (trimmed && !names.includes(trimmed)) {
      setNames([...names, trimmed])
      setInputName('')
    }
  }

  const removeName = (name: string) => {
    setNames(names.filter((n) => n !== name))
  }

  const startGame = () => {
    const initialVotes: VoteCount = {}
    names.forEach((n) => { initialVotes[n] = 0 })
    setVotes(initialVotes)
    setResult(null)
    setPhase('voting')
  }

  const totalVotesCast = Object.values(votes).reduce((a, b) => a + b, 0)

  const handleVote = (playerName: string) => {
    if (phase !== 'voting') return

    const newVotes = { ...votes, [playerName]: (votes[playerName] || 0) + 1 }
    setVotes(newVotes)

    const newTotal = Object.values(newVotes).reduce((a, b) => a + b, 0)
    if (newTotal >= names.length) {
      const maxVotes = Math.max(...Object.values(newVotes))
      const topPlayers = names.filter((n) => newVotes[n] === maxVotes)
      if (topPlayers.length > 1) {
        setResult({ winner: topPlayers[Math.floor(Math.random() * topPlayers.length)]!, tiedNames: topPlayers })
      } else {
        setResult({ winner: topPlayers[0]!, tiedNames: undefined })
      }
      setPhase('resolution')
    }
  }

  const handleNextCard = () => {
    obtenerSiguiente()
    const resetVotes: VoteCount = {}
    names.forEach((n) => { resetVotes[n] = 0 })
    setVotes(resetVotes)
    setResult(null)
    setPhase('voting')
  }

  if (phase === 'setup') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-black dark:text-white flex flex-col">
        <div className="flex-1 w-full max-w-md mx-auto p-4 space-y-5">
          <GameHeader title="El Dedo en la Llaga" backTo="/arcade" />
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-center">
            Configura la partida
          </p>

          <div className="border-4 border-black dark:border-white bg-white dark:bg-gray-800 p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 border-2 border-black dark:border-white bg-fuchsia-300 dark:bg-fuchsia-500 flex items-center justify-center">
                <Hand size={20} strokeWidth={2.5} className="text-black dark:text-gray-900" />
              </div>
              <div>
                <p className="font-black uppercase tracking-wider text-sm">
                  Jugadores ({names.length})
                </p>
                <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400">
                  Minimo 3 para jugar
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addName()}
                placeholder="Nombre del jugador"
                className="flex-1 border-2 border-black dark:border-white bg-white dark:bg-gray-700 px-3 py-2 text-sm font-bold text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none"
              />
              <button
                onClick={addName}
                disabled={!inputName.trim()}
                className="px-4 border-2 border-black dark:border-white bg-emerald-300 dark:bg-emerald-500 text-black dark:text-gray-900 font-black text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-50"
              >
                <UserPlus size={18} strokeWidth={2.5} />
              </button>
            </div>

            {names.length > 0 && (
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {names.map((name) => (
                  <div
                    key={name}
                    className="flex items-center justify-between border-2 border-black dark:border-white bg-gray-50 dark:bg-gray-700 px-3 py-2"
                  >
                    <span className="font-bold text-sm text-black dark:text-white truncate">
                      {name}
                    </span>
                    <button
                      onClick={() => removeName(name)}
                      className="p-1 border border-black dark:border-white bg-red-300 dark:bg-red-500 text-black dark:text-gray-900"
                    >
                      <X size={14} strokeWidth={3} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={startGame}
            disabled={names.length < 3}
            className="w-full flex items-center justify-center gap-2 py-4 border-4 border-black dark:border-white bg-fuchsia-400 dark:bg-fuchsia-500 text-black dark:text-gray-900 font-black uppercase tracking-wider text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Play size={22} strokeWidth={2.5} />
            Iniciar Partida
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-black dark:text-white flex flex-col">
      <div className="w-full max-w-md mx-auto p-4 pt-2 pb-8">
        <GameHeader title="El Dedo en la Llaga" backTo="/arcade" />
      </div>

      <div className="flex-1 flex flex-col items-center w-full max-w-md mx-auto pb-12 px-4">
        <div className="flex items-center justify-between w-full mb-6">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
            <Layers size={16} strokeWidth={2.5} />
            <span>
              {cartasJugadas} / {totalCartas} cartas
            </span>
          </div>
          <button
            onClick={barajar}
            className="flex items-center gap-1 p-2 border-2 border-black dark:border-white bg-gray-100 dark:bg-gray-700 text-black dark:text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
          >
            <Shuffle size={16} strokeWidth={2.5} />
          </button>
        </div>

        {cartaActual ? (
          <div className="bg-white dark:bg-gray-800 border-4 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] p-8 w-full flex flex-col justify-center items-center text-center rounded-none select-none mb-6">
            <Hand size={40} strokeWidth={2.5} className="mb-6 opacity-40 text-black dark:text-white" />
            <p className="text-sm font-black uppercase tracking-widest text-fuchsia-500 dark:text-fuchsia-400 mb-4">
              QUIEN ES MAS PROBABLE QUE...
            </p>
            <p className="text-2xl sm:text-3xl font-black text-black dark:text-white uppercase tracking-tighter leading-tight">
              {cartaActual}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 w-full mb-6">
            <Loader2 size={32} className="animate-spin" strokeWidth={2.5} />
            <p className="text-sm font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Mazo agotado
            </p>
          </div>
        )}

        {phase === 'voting' && cartaActual && (
          <>
            <div className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-4">
              Votos: {totalVotesCast} / {names.length}
            </div>

            <div className="grid grid-cols-2 gap-3 w-full mb-6">
              {names.map((playerName) => (
                <button
                  key={playerName}
                  onClick={() => handleVote(playerName)}
                  disabled={phase !== 'voting'}
                  className="py-4 border-4 border-black dark:border-white bg-white dark:bg-gray-800 text-black dark:text-white font-black uppercase tracking-wider text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all hover:bg-fuchsia-100 dark:hover:bg-fuchsia-900/30"
                >
                  {playerName}
                </button>
              ))}
            </div>
          </>
        )}

        {phase === 'resolution' && result && (
          <div className="w-full border-4 border-black dark:border-white bg-white dark:bg-gray-800 p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] text-center mb-6">
            {result.tiedNames ? (
              <>
                <p className="text-lg font-black uppercase tracking-wider text-fuchsia-500 dark:text-fuchsia-400 mb-2">
                  EMPATE
                </p>
                <p className="text-2xl font-black uppercase tracking-tighter text-black dark:text-white">
                  {result.tiedNames.join(' Y ')} SE TOMAN UN SHOT
                </p>
              </>
            ) : (
              <p className="text-2xl font-black uppercase tracking-tighter text-black dark:text-white">
                {result.winner} SE TOMA UN SHOT
              </p>
            )}
            <div className="mt-4 space-y-1">
              {names.map((name) => (
                <div
                  key={name}
                  className="flex justify-between text-xs font-bold text-gray-500 dark:text-gray-400 border-b border-black dark:border-white py-1"
                >
                  <span>{name}</span>
                  <span>{votes[name]} voto{ votes[name] !== 1 ? 's' : '' }</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {cartaActual && phase === 'resolution' && (
          <button
            onClick={handleNextCard}
            className="w-full py-4 font-black text-xl uppercase bg-yellow-400 dark:bg-yellow-500 text-black border-4 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
          >
            SIGUIENTE CARTA
          </button>
        )}

        {!cartaActual && (
          <button
            onClick={barajar}
            className="w-full py-4 font-black text-xl uppercase bg-yellow-400 dark:bg-yellow-500 text-black border-4 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
          >
            <div className="flex items-center justify-center gap-2">
              <Shuffle size={22} strokeWidth={2.5} />
              Barajar de nuevo
            </div>
          </button>
        )}
      </div>
    </div>
  )
}
