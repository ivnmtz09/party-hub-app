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

  const isTurbio = deck.esTurbio
  const isDedoEnLaLlaga = deck.id === 'dedo-en-la-llaga'
  const counterLabel = isTurbio ? 'text-yellow-400' : 'text-gray-500 dark:text-gray-400'

  return (
    <div className="flex-1 flex flex-col justify-center items-center w-full pb-10">
      <div className="flex items-center justify-between w-full mb-6">
        <div className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest ${counterLabel}`}>
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

      {isTurbio && (
        <div className="flex items-center justify-center gap-2 text-red-500 font-black uppercase tracking-widest text-[10px] border-2 border-red-500 py-1 mb-6 w-full">
          CONTENIDO SENSIBLE
        </div>
      )}

      {cartaActual ? (
        <div
          onClick={obtenerSiguiente}
          className="bg-white dark:bg-gray-800 border-4 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] p-8 w-full flex flex-col justify-center items-center text-center rounded-none transition-all cursor-pointer select-none active:translate-x-1 active:translate-y-1 active:shadow-none"
        >
          <Hand size={40} strokeWidth={2.5} className="mb-6 opacity-40 text-black dark:text-white" />
          {isDedoEnLaLlaga && (
            <p className="text-sm font-black uppercase tracking-widest text-fuchsia-500 dark:text-fuchsia-400 mb-4">
              ¿QUIEN ES MAS PROBABLE QUE...
            </p>
          )}
          <p className="text-2xl sm:text-3xl font-black text-black dark:text-white uppercase tracking-tighter leading-tight">
            {cartaActual}
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 w-full">
          <Loader2 size={32} className="animate-spin" strokeWidth={2.5} />
          <p className="text-sm font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Mazo agotado
          </p>
          <button
            onClick={barajar}
            className="mt-8 w-full py-4 font-black text-xl uppercase bg-yellow-400 dark:bg-yellow-500 text-black border-4 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
          >
            <div className="flex items-center justify-center gap-2">
              <Shuffle size={22} strokeWidth={2.5} />
              Barajar de nuevo
            </div>
          </button>
        </div>
      )}

      {cartaActual && (
        <button
          onClick={obtenerSiguiente}
          className="mt-12 w-full py-4 font-black text-xl uppercase bg-yellow-400 dark:bg-yellow-500 text-black border-4 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
        >
          SIGUIENTE CARTA
        </button>
      )}
    </div>
  )
}
