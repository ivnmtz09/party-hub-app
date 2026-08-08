import { Plus, AlertTriangle, Loader2 } from 'lucide-react'
import type { ReactNode } from 'react'
import { playTapSound } from '../../../utils/audio'
import { GAME_THEMES, type GameTheme } from '../data/gameThemes'

interface Props {
  themeId: string
  onClick: () => void
  disabled?: boolean
  loading?: boolean
  icon?: ReactNode
  title?: string
  subtitle?: string
}

export default function CreateRoomButton({
  themeId,
  onClick,
  disabled,
  loading,
  icon,
  title = 'CREAR SALA',
  subtitle = 'Invita a tus amigos con un código',
}: Props) {
  const theme: GameTheme = GAME_THEMES[themeId] ?? GAME_THEMES.impostor!

  return (
    <button
      onClick={() => { playTapSound(); onClick() }}
      disabled={disabled || loading}
      className={`relative w-full flex items-center gap-4 p-5 border-4 border-black dark:border-white bg-gradient-to-br ${theme.gradient} text-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all disabled:opacity-40 disabled:cursor-not-allowed overflow-hidden`}
    >
      {loading && (
        <>
          <div className="absolute inset-0 bg-black/40 z-10" />
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <Loader2 size={30} strokeWidth={2.5} className="animate-spin text-white" />
          </div>
        </>
      )}
      <div className="w-12 h-12 shrink-0 border-[3px] border-black bg-white flex items-center justify-center text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
        {icon ?? <Plus size={24} strokeWidth={2.5} />}
      </div>
      <div className="text-left min-w-0">
        <p className="font-black uppercase tracking-wider text-base text-white drop-shadow-[1px_1px_0px_rgba(0,0,0,0.6)]">
          {title}
        </p>
        <p className="text-[11px] font-bold uppercase tracking-wider text-white/85 drop-shadow-[1px_1px_0px_rgba(0,0,0,0.5)]">
          {subtitle}
        </p>
      </div>
      {theme.turbio && (
        <span className="ml-auto shrink-0 inline-flex items-center gap-1 border-2 border-black bg-yellow-300 px-2 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <AlertTriangle size={11} strokeWidth={3} className="text-red-600" />
          <span className="text-[10px] font-black uppercase tracking-widest text-black">
            18+
          </span>
        </span>
      )}
    </button>
  )
}