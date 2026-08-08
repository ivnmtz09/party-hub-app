import { useState } from 'react'
import { Skull, Loader2 } from 'lucide-react'
import {
  siguienteCartaDedo,
  type DedoRoom,
} from '../../../firebase/services'
import GameHeader from '../../../components/GameHeader'
import GameInfoModal from '../../../components/GameInfoModal'
import type { DeckContenido } from '../../../firebase/content'

interface Props {
  room: DedoRoom
  isHost: boolean
  roomCode: string
  deck?: DeckContenido
  usedCards: Set<string>
  onCardUsed: (card: string) => void
}

function pickRandomCard(deck: DeckContenido | undefined, used: Set<string>): string {
  const cartas = deck?.cartas ?? []
  const pool = cartas.length > 0 ? cartas : ['Yo nunca he...']
  const available = pool.filter((c) => !used.has(c))
  if (available.length === 0) return pool[Math.floor(Math.random() * pool.length)]!
  return available[Math.floor(Math.random() * available.length)]!
}

export default function YoNuncaOnline({
  room,
  isHost,
  roomCode,
  deck,
  usedCards,
  onCardUsed,
}: Props) {
  const [showInfo, setShowInfo] = useState(false)

  const rules = [
    'Lee la carta en voz alta: "Yo nunca he..."',
    'Si lo hiciste: TOMA UN TRAGO. Si no lo hiciste: los demas te levantan la mano.',
    'Nada de mentir: el grupo conoce tus pecados.',
    'El anfitrion avanza a la siguiente carta con SIGUIENTE CARTA.',
  ]

  const handleNextCard = async () => {
    const card = pickRandomCard(deck, usedCards)
    onCardUsed(card)
    try {
      await siguienteCartaDedo(roomCode, card)
    } catch {
      // error silencioso
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-black dark:text-white flex flex-col p-4 sm:p-6 transition-colors">
      <div className="w-full max-w-3xl mx-auto pt-2 pb-8">
        <GameHeader title="Yo Nunca" backTo="/arcade" onInfo={() => setShowInfo(true)} />
      </div>

      <div className="flex-1 flex flex-col items-center w-full max-w-3xl mx-auto pb-12">
        <div className="relative bg-gradient-to-br from-violet-100 via-white to-purple-200 dark:from-violet-950 dark:via-gray-900 dark:to-purple-950 border-4 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] p-8 w-full flex flex-col justify-center items-center text-center rounded-none select-none mb-6 overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.06] dark:opacity-[0.12] pointer-events-none"
            style={{
              backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 8px, transparent 8px, transparent 20px)',
            }}
          />
          <div className="relative flex flex-col items-center z-10">
            <div className="w-14 h-14 border-2 border-black dark:border-white bg-violet-400 dark:bg-violet-500 flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] -rotate-3 mb-5">
              <Skull size={28} strokeWidth={2.5} className="text-black dark:text-gray-900" />
            </div>
            <span className="px-3 py-1.5 bg-violet-500 dark:bg-violet-400 text-white dark:text-gray-900 border-2 border-black dark:border-white font-black text-[10px] sm:text-xs uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              YO NUNCA...
            </span>
            <p className="mt-6 text-2xl sm:text-3xl font-black text-black dark:text-white uppercase tracking-tighter leading-tight max-w-sm drop-shadow-[2px_2px_0px_rgba(139,92,246,0.35)] dark:drop-shadow-[2px_2px_0px_rgba(255,255,255,0.25)]">
              {room.currentCard}
            </p>
          </div>
        </div>

        <div className="w-full border-2 border-black dark:border-white bg-white dark:bg-gray-800 p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] mb-6">
          <p className="text-[11px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 text-center">
            Si lo hiciste: TOMA UN TRAGO. Si no: los demas levanten la mano
          </p>
        </div>

        {isHost ? (
          <button
            onClick={handleNextCard}
            className="w-full py-4 font-black text-xl uppercase bg-violet-400 dark:bg-violet-500 text-black dark:text-gray-900 border-4 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
          >
            SIGUIENTE CARTA
          </button>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Loader2 size={22} className="animate-spin" strokeWidth={2.5} />
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">
              Esperando a que el anfitrion avance...
            </p>
          </div>
        )}
      </div>

      {showInfo && (
        <GameInfoModal
          title="Yo Nunca"
          rules={rules}
          onClose={() => setShowInfo(false)}
        />
      )}
    </div>
  )
}
