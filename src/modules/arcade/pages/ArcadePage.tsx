import { Link } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import { UserX, Hand, Bomb, Search, Play, Skull, AlertTriangle, RotateCw } from 'lucide-react'

interface GameEntry {
  title: string
  description: string
  icon: LucideIcon
  path: string
  active: boolean
  turbio?: boolean
}

const games: GameEntry[] = [
  {
    title: 'El Impostor',
    description: 'Descubre al impostor antes de que sea demasiado tarde',
    icon: UserX,
    path: '/arcade/impostor',
    active: true,
  },
  {
    title: 'Ruleta Personalizada',
    description: 'Agrega opciones, girala y descubre el resultado',
    icon: RotateCw,
    path: '/arcade/rouleta',
    active: true,
  },
  {
    title: 'El Dedo en la Llaga',
    description: 'Multijugador: quien es mas probable...',
    icon: Hand,
    path: '/arcade/juego',
    active: true,
  },
  {
    title: 'Yo Nunca',
    description: 'Confiesa tus pecados mas oscuros',
    icon: Skull,
    path: '/arcade/cartas/yo-nunca',
    active: true,
    turbio: true,
  },
  {
    title: 'Bomba de Tiempo',
    description: 'Responde rapido o la bomba explota',
    icon: Bomb,
    path: '/arcade/bomba',
    active: true,
    turbio: true,
  },
  {
    title: 'Misterio en la Mansion',
    description: 'Deduccion y thriller psicologico',
    icon: Search,
    path: '#',
    active: false,
  },
]

export default function ArcadePage() {
  return (
    <div className="w-full max-w-md mx-auto p-4 animate-fade-in-up">
      <h2 className="text-2xl font-black uppercase tracking-wider text-black dark:text-white">
        Arcade
      </h2>
      <p className="text-gray-500 dark:text-gray-400 mt-2 mb-6 font-bold uppercase tracking-wider text-sm">
        Catalogo de juegos
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {games.map(({ title, description, icon: Icon, path, active, turbio }, i) => (
          <div
            key={title}
            style={{ animationDelay: `${i * 0.1}s` }}
            className={`flex flex-col border-4 border-black dark:border-white bg-white dark:bg-gray-800 shadow-brutal dark:shadow-brutal-dark animate-fade-in-up ${
              active
                ? 'hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all'
                : 'opacity-60'
            }`}
          >
            <div className="p-5 flex flex-col items-center text-center gap-3 flex-1">
              <div className="w-16 h-16 border-2 border-black dark:border-white bg-fuchsia-300 dark:bg-fuchsia-500 flex items-center justify-center">
                <Icon size={28} strokeWidth={2.5} className="text-black dark:text-gray-900" />
              </div>
              <p className="font-black uppercase tracking-wider text-sm text-black dark:text-white">
                {title}
              </p>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400">
                {description}
              </p>
              {turbio && (
                <div className="flex items-center gap-1 mt-2 border-2 border-red-600 bg-red-100 dark:bg-red-900/40 px-2 py-0.5">
                  <AlertTriangle size={12} strokeWidth={2.5} className="text-red-600 shrink-0" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-red-600">
                    CONTENIDO +18
                  </span>
                </div>
              )}
            </div>

            {active ? (
              <Link
                to={path}
                className="w-full py-3 bg-yellow-300 dark:bg-yellow-400 border-t-4 border-black dark:border-white text-black dark:text-gray-900 font-black uppercase tracking-wider text-sm flex items-center justify-center gap-2 active:translate-y-0.5 transition-all"
              >
                <Play size={16} strokeWidth={2.5} />
                Jugar
              </Link>
            ) : (
              <div className="w-full py-3 bg-gray-200 dark:bg-gray-700 border-t-4 border-black dark:border-white text-gray-500 dark:text-gray-400 font-black uppercase tracking-wider text-xs text-center">
                Proximamente
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
