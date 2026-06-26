import { useEffect } from 'react'
import { Shuffle, Layers, Hand, Loader2 } from 'lucide-react'
import { useCardGame } from '../hooks/useCardGame'
import type { GameDeck } from '../data/decks'

interface Props {
  deck: GameDeck
}

export default function CardGameEngine({ deck }: Props) {
  const {
    cartaActual,
    totalCartas,
    cartasJugadas,
    obtenerSiguiente,
    barajar,
  } = useCardGame(deck.cartas)

  useEffect(() => {
    if (!cartaActual && cartasJugadas === 0) {
      obtenerSiguiente()
    }
  }, [])

  const isTurbio = deck.esTurbio

  // Card styling
  let cardClasses = 'w-full min-h-[300px] flex flex-col items-center justify-center p-8 cursor-pointer select-none shadow-brutal dark:shadow-brutal-dark active:translate-x-1 active:translate-y-1 active:shadow-none transition-all';

  if (isTurbio) {
    cardClasses += ' bg-black text-red-400 border-yellow-400';
  } else {
    cardClasses += ' bg-gray-100 dark:bg-gray-800 border-2 border-black dark:border-white text-black dark:text-white';
  }

  const counterLabel = isTurbio ? 'text-yellow-400' : 'text-gray-500 dark:text-gray-400'

  return (
    <div className="w-full max-w-md mx-auto p-4 flex-1 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-2 ${counterLabel} font-black uppercase tracking-widest text-xs`}>
            <Layers size={16} strokeWidth={2.5} />
            <span>
              {cartasJugadas} / {totalCartas} cartas
            </span>
          </div>

          <button
            onClick={barajar}
            className="flex items-center gap-1 p-2 border-2 border-black dark:border-white bg-gray-100 dark:bg-gray-700 text-black dark:text-white shadow-brutal-sm dark:shadow-brutal-sm-dark active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
          >
            <Shuffle size={16} strokeWidth={2.5} />
          </button>
        </div>

        {isTurbio && (
          <div className="flex items-center justify-center gap-2 text-red-500 font-black uppercase tracking-widest text-[10px] border-2 border-red-500 py-1">
            CONTENIDO SENSIBLE
          </div>
        )}

        <div className="flex-1 flex items-center justify-center">
          {cartaActual ? (
        <div onClick={obtenerSiguiente} className={cardClasses}>
              <Hand size={32} strokeWidth={2.5} className="mb-6 opacity-60" />
              <p className="font-black uppercase tracking-tighter text-2xl text-center leading-tight">
                {cartaActual}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <Loader2 size={32} className="animate-spin" strokeWidth={2.5} />
              <p className="font-black uppercase tracking-wider text-sm text-gray-500 dark:text-gray-400">
                Mazo agotado
              </p>
              <button
                onClick={barajar}
                className="flex items-center gap-2 py-3 px-6 border-4 border-black dark:border-white bg-yellow-300 dark:bg-yellow-400 text-black dark:text-gray-900 font-black uppercase tracking-wider shadow-brutal dark:shadow-brutal-dark active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
              >
                <Shuffle size={18} strokeWidth={2.5} />
                Barajar de nuevo
              </button>
            </div>
          )}
        </div>

        {cartaActual && (
          <p className={`text-[10px] font-bold uppercase tracking-wider text-center ${counterLabel}`}>
            Toca la carta para la siguiente pregunta
          </p>
        )}
      </div>
  )
}
