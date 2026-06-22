import { HelpCircle, EyeOff, Shield } from 'lucide-react'

interface FlipCardProps {
  flipped: boolean
  isImpostor: boolean
  word: string
  hint: string
  ejemplo: string
}

export default function FlipCard({ flipped, isImpostor, word, hint, ejemplo }: FlipCardProps) {
  return (
    <div className="relative w-full max-w-xs mx-auto aspect-[3/4] [perspective:800px]">
      <div
        className="relative w-full h-full [transform-style:preserve-3d] transition-transform duration-500"
        style={{ transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
      >
        <div className="absolute inset-0 border-4 border-black dark:border-white bg-white dark:bg-gray-800 shadow-brutal dark:shadow-brutal-dark flex flex-col items-center justify-center gap-3 p-4 [backface-visibility:hidden]">
          <div className="w-16 h-16 sm:w-20 sm:h-20 border-2 border-black dark:border-white bg-cyan-300 dark:bg-cyan-500 flex items-center justify-center">
            <HelpCircle size={32} strokeWidth={2.5} className="text-black dark:text-gray-900 sm:w-10 sm:h-10" />
          </div>
          <p className="text-lg sm:text-2xl font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Tu Rol
          </p>
          <p className="text-[10px] sm:text-xs font-bold text-gray-400 dark:text-gray-500 text-center px-4">
            Toca el boton para revelar
          </p>
        </div>

        <div className="absolute inset-0 border-4 border-black dark:border-white flex flex-col items-center justify-center p-4 [backface-visibility:hidden] [transform:rotateY(180deg)]">
          {isImpostor ? (
            <>
              <div className="w-16 h-16 sm:w-20 sm:h-20 border-2 border-black dark:border-white bg-red-400 dark:bg-red-500 flex items-center justify-center mb-3">
                <EyeOff size={32} strokeWidth={2.5} className="text-black dark:text-gray-900 sm:w-10 sm:h-10" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-red-600 dark:text-red-400 text-center leading-tight uppercase">
                ERES EL
                <br />
                IMPOSTOR
              </p>
              <p className="text-[10px] sm:text-xs font-bold text-gray-600 dark:text-gray-300 mt-4 text-center max-w-[90%] leading-relaxed">
                {hint}
              </p>
              <p className="text-[9px] sm:text-xs text-gray-400 dark:text-gray-500 mt-3 font-black uppercase tracking-wider text-center">
                No te descubran
              </p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 sm:w-20 sm:h-20 border-2 border-black dark:border-white bg-emerald-300 dark:bg-emerald-500 flex items-center justify-center mb-3">
                <Shield size={32} strokeWidth={2.5} className="text-black dark:text-gray-900 sm:w-10 sm:h-10" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-300 text-center leading-tight uppercase">
                ERES
                <br />
                CIVIL
              </p>
              <p className="text-sm sm:text-lg font-black uppercase tracking-wider text-black dark:text-white mt-4 text-center">
                {word}
              </p>
              <p className="text-[10px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 mt-2 text-center max-w-[90%] leading-relaxed">
                {ejemplo}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
