import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Play, AlertTriangle, Gamepad2 } from 'lucide-react'
import { useAppContent } from '../../../context/ContentContext'
import { Icono } from '../../../config/iconos'
import { playTapSound } from '../../../utils/audio'
import ArcadeSkeleton from '../components/ArcadeSkeleton'
import ArcadeGlitchAmbient from '../components/ArcadeGlitchAmbient'
import GlitchOverlay from '../../../components/GlitchOverlay'
import { GAME_THEMES } from '../data/gameThemes'

export default function ArcadePage() {
  const { content, status } = useAppContent()
  const navigate = useNavigate()
  const [transition, setTransition] = useState<{ path: string; title: string } | null>(null)

  const handlePlay = (path: string, title: string) => {
    if (transition) return
    playTapSound()
    setTransition({ path, title })
  }

  if (status === 'cargando') {
    return (
      <div className="w-full max-w-md mx-auto p-4">
        <div className="h-8 w-24 bg-gray-300 dark:bg-gray-700 animate-pulse mb-2" />
        <div className="h-4 w-40 bg-gray-300 dark:bg-gray-700 animate-pulse mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <ArcadeSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <ArcadeGlitchAmbient>
      <div className="w-full max-w-md mx-auto p-4 animate-fade-in-up">
      <h2 className="text-2xl font-black uppercase tracking-wider text-black dark:text-white">
        Arcade
      </h2>
      <p className="text-gray-500 dark:text-gray-400 mt-2 mb-6 font-bold uppercase tracking-wider text-sm">
        Catálogo de juegos
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {content.juegos.map((juego, i) => {
          const Icon = Icono(juego.icon, Gamepad2)
          const theme = GAME_THEMES[juego.id] ?? GAME_THEMES.impostor!
          return (
          <div
            key={juego.id}
            style={{ animationDelay: `${i * 0.1}s` }}
            className={`flex flex-col border-4 border-black dark:border-white bg-white dark:bg-gray-800 shadow-brutal dark:shadow-brutal-dark animate-fade-in-up overflow-hidden ${
              juego.active
                ? 'hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all'
                : 'opacity-60'
            }`}
          >
            <div className={`h-2.5 bg-gradient-to-r ${theme.gradient}`} />
            <div className="p-5 flex flex-col items-center text-center gap-3 flex-1">
              <div className={`w-16 h-16 border-2 border-black dark:border-white bg-gradient-to-br ${theme.gradient} flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]`}>
                <Icon size={28} strokeWidth={2.5} className="text-white drop-shadow-[1px_1px_0px_rgba(0,0,0,0.5)]" />
              </div>
              <p className="font-black uppercase tracking-wider text-sm text-black dark:text-white">
                {juego.title}
              </p>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400">
                {juego.description}
              </p>
              {juego.turbio && (
                <div className="flex items-center gap-1 mt-2 border-2 border-red-600 bg-red-100 dark:bg-red-900/40 px-2 py-0.5">
                  <AlertTriangle size={12} strokeWidth={2.5} className="text-red-600 shrink-0" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-red-600">
                    CONTENIDO +18
                  </span>
                </div>
              )}
            </div>

            {juego.active ? (
              <button
                onClick={() => handlePlay(juego.path, juego.title)}
                className="w-full py-3 bg-yellow-300 dark:bg-yellow-400 border-t-4 border-black dark:border-white text-black dark:text-gray-900 font-black uppercase tracking-wider text-sm flex items-center justify-center gap-2 active:translate-y-0.5 transition-all cursor-pointer"
              >
                <Play size={16} strokeWidth={2.5} />
                Jugar
              </button>
            ) : (
              <div className="w-full py-3 bg-gray-200 dark:bg-gray-700 border-t-4 border-black dark:border-white text-gray-500 dark:text-gray-400 font-black uppercase tracking-wider text-xs text-center">
                Próximamente
              </div>
            )}
          </div>
          )
        })}
      </div>

      {transition && (
        <GlitchOverlay
          title={transition.title}
          onComplete={() => navigate(transition.path)}
        />
      )}
      </div>
    </ArcadeGlitchAmbient>
  )
}
