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

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex flex-col p-4">
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md mx-auto">
        <div className="w-full max-w-sm">
          <div className="flex items-center justify-between mb-6">
            <div className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest ${isTurbio ? 'text-yellow-400' : 'text-gray-500 dark:text-gray-400'}`}>
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
            <div className="flex items-center justify-center gap-2 text-red-500 font-black uppercase tracking-widest text-[10px] border-2 border-red-500 py-1 mb-6">
              CONTENIDO SENSIBLE
            </div>
          )}

          {cartaActual ? (
            <div
              onClick={obtenerSiguiente}
              className="bg-white dark:bg-gray-800 border-4 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] p-8 w-full max-w-sm mx-auto flex flex-col justify-center items-center text-center my-auto rounded-none cursor-pointer select-none active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
            >
              <Hand size={40} strokeWidth={2.5} className="mb-6 opacity-40 text-black dark:text-white" />
              <p className="text-2xl font-black text-black dark:text-white uppercase tracking-tighter leading-tight">
                {cartaActual}
              </p>
              {isTurbio && cartaActual && (
                <p className="mt-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Contenido sensible
                </p>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <Loader2 size={32} className="animate-spin" strokeWidth={2.5} />
              <p className="text-sm font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Mazo agotado
              </p>
              <button
                onClick={barajar}
                className="mt-8 w-full py-4 font-black text-xl uppercase bg-yellow-400 dark:bg-yellow-500 text-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
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
              className="mt-8 w-full py-4 font-black text-xl uppercase bg-yellow-400 dark:bg-yellow-500 text-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
            >
              Siguiente Carta
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
