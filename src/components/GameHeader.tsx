import BackButton from './BackButton'
import { Info } from 'lucide-react'

interface GameHeaderProps {
  title: string
  backTo: string
  onInfo?: () => void
}

export default function GameHeader({ title, backTo, onInfo }: GameHeaderProps) {
  return (
    <div className="w-full flex items-center justify-between mb-6">
      <div className="w-10 flex-shrink-0">
        <BackButton to={backTo} />
      </div>
      <h1 className="text-2xl font-black uppercase text-center flex-1 truncate px-2 text-black dark:text-white">
        {title}
      </h1>
      <div className="w-10 flex-shrink-0">
        {onInfo ? (
          <button
            onClick={onInfo}
            aria-label="Cómo jugar"
            className="inline-flex items-center justify-center w-10 h-10 bg-yellow-300 dark:bg-yellow-400 border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all cursor-pointer flex-shrink-0"
          >
            <Info size={20} strokeWidth={2.5} className="text-black dark:text-gray-900" />
          </button>
        ) : (
          <div className="w-10 flex-shrink-0" />
        )}
      </div>
    </div>
  )
}
