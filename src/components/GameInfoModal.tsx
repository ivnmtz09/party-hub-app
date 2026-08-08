import { X, Info } from 'lucide-react'
import { playTapSound } from '../utils/audio'

interface Props {
  title: string
  rules: string[]
  onClose: () => void
}

export default function GameInfoModal({ title, rules, onClose }: Props) {
  const handleClose = () => {
    playTapSound()
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-[100] bg-gray-950/80 dark:bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-md max-h-[85vh] overflow-y-auto border-4 border-black dark:border-white bg-white dark:bg-gray-800 text-black dark:text-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b-4 border-black dark:border-white p-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 border-2 border-black dark:border-white bg-yellow-300 dark:bg-yellow-400 flex items-center justify-center flex-shrink-0">
              <Info size={20} strokeWidth={2.5} className="text-black dark:text-gray-900" />
            </div>
            <h2 className="font-black uppercase tracking-wider text-sm sm:text-base text-black dark:text-white truncate">
              {title}
            </h2>
          </div>
          <button
            onClick={handleClose}
            aria-label="Cerrar"
            className="inline-flex items-center justify-center w-10 h-10 border-2 border-black dark:border-white bg-red-300 dark:bg-red-500 text-black dark:text-gray-900 active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer flex-shrink-0"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
            Cómo Jugar
          </p>
          <ol className="space-y-2.5">
            {rules.map((rule, i) => (
              <li
                key={i}
                className="flex items-start gap-3 border-2 border-black dark:border-white bg-gray-50 dark:bg-gray-700 p-3"
              >
                <span className="w-6 h-6 border-2 border-black dark:border-white bg-fuchsia-300 dark:bg-fuchsia-500 text-black dark:text-gray-900 font-black text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-xs sm:text-sm font-bold leading-relaxed text-black dark:text-white">
                  {rule}
                </p>
              </li>
            ))}
          </ol>

          <button
            onClick={handleClose}
            className="w-full py-3 mt-2 border-4 border-black dark:border-white bg-yellow-300 dark:bg-yellow-400 text-black dark:text-gray-900 font-black uppercase tracking-wider text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all cursor-pointer"
          >
            ENTENDIDO
          </button>
        </div>
      </div>
    </div>
  )
}
