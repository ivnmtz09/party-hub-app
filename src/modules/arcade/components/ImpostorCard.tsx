import { useState } from 'react'
import { Eye, EyeOff, HelpCircle } from 'lucide-react'

interface ImpostorCardProps {
  isImpostor: boolean
  word: string
  description: string
  clue: string
  cluesEnabled: boolean
  onPass: () => void
}

const QUESTION_PATTERN =
  "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Ctext x='6' y='42' font-family='monospace' font-size='34' font-weight='700' fill='%23404040'%3E%3F%3C/text%3E%3C/svg%3E\")"

export default function ImpostorCard({
  isImpostor,
  word,
  description,
  clue,
  cluesEnabled,
  onPass,
}: ImpostorCardProps) {
  const [revealed, setRevealed] = useState(false)

  const handlePass = () => {
    setRevealed(false)
    onPass()
  }

  return (
    <div className="w-full max-w-xs mx-auto flex flex-col gap-4">
      <div className="relative w-full aspect-[3/4] [perspective:1000px]">
        <div
          className="relative w-full h-full [transform-style:preserve-3d] transition-transform duration-500"
          style={{ transform: revealed ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
        >
          <div
            className="absolute inset-0 border-4 border-black [backface-visibility:hidden] bg-neutral-900 flex flex-col items-center justify-center gap-6 p-4 shadow-[4px_4px_0px_rgba(0,0,0,1)]"
            style={{ backgroundImage: QUESTION_PATTERN }}
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-black bg-white flex items-center justify-center">
              <HelpCircle size={36} strokeWidth={2.5} className="text-black sm:w-10 sm:h-10" />
            </div>
            <button
              onClick={() => setRevealed(true)}
              className="flex items-center gap-2 px-6 py-4 border-4 border-black bg-yellow-300 text-black font-black uppercase tracking-widest text-base sm:text-lg shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
            >
              <Eye size={22} strokeWidth={2.5} />
              Ver Rol y Palabra
            </button>
          </div>

          <div
            className={`absolute inset-0 [transform:rotateY(180deg)] [backface-visibility:hidden] border-4 border-black flex flex-col p-5 shadow-[4px_4px_0px_rgba(0,0,0,1)] ${
              isImpostor ? 'bg-red-500' : 'bg-blue-400'
            }`}
          >
            <p className="text-xl sm:text-2xl font-black uppercase tracking-wider text-black text-center">
              {isImpostor ? 'Eres Impostor' : 'Eres Civil'}
            </p>

            <div className="flex-1 flex flex-col items-center justify-center gap-4 min-h-0">
              {isImpostor ? (
                <>
                  <div className="w-14 h-14 border-4 border-black bg-black flex items-center justify-center">
                    <EyeOff size={28} strokeWidth={2.5} className="text-red-500" />
                  </div>
                  <p className="text-4xl sm:text-5xl font-black uppercase tracking-wider text-black text-center break-words leading-tight">
                    {cluesEnabled && clue ? clue : '¡Estas a ciegas!'}
                  </p>
                  {cluesEnabled && clue && (
                    <p className="text-[10px] font-black uppercase tracking-widest text-black/70 text-center">
                      No te descubran
                    </p>
                  )}
                </>
              ) : (
                <>
                  <p className="text-4xl sm:text-5xl font-black uppercase tracking-wider text-black text-center break-words leading-tight">
                    {word}
                  </p>
                  <p className="text-sm sm:text-base font-bold text-black text-center leading-snug max-w-[90%]">
                    {description}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {revealed && (
        <button
          onClick={handlePass}
          className="w-full flex items-center justify-center gap-2 py-4 border-4 border-black bg-white text-black font-black uppercase tracking-wider text-base sm:text-lg shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
        >
          <EyeOff size={22} strokeWidth={2.5} />
          Ocultar y Pasar
        </button>
      )}
    </div>
  )
}