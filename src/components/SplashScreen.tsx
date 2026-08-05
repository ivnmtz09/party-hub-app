import { useEffect, useMemo } from 'react'
import { Flame, Trash2, Dumbbell, Gamepad2 } from 'lucide-react'
import BrandLogo from './BrandLogo'

const iconos = [
  { Icon: Flame, delay: '0s' },
  { Icon: Trash2, delay: '0.15s' },
  { Icon: Dumbbell, delay: '0.3s' },
  { Icon: Gamepad2, delay: '0.45s' },
]

const LOADING_MESSAGES = [
  'CALCULANDO EL XP DE TUS MALOS HÁBITOS...',
  'CONTANDO LOS VASOS DE AGUA DE HOY...',
  'PREPARANDO EL TABLERO DE ACTIVIDADES...',
  'BUSCANDO IMPOSTORES EN LA SALA...',
  'VERIFICANDO QUIÉN FUE AL GYM...',
  'CARGANDO LOS PECADOS EN YO NUNCA...',
  'SINTONIZANDO EL MURAL DE GRUPO...',
  'MIDIENDO EL NIVEL DE PROCRASTINACIÓN...',
  'PREPARANDO LA RULETA PERSONALIZADA...',
  'RECOPILANDO LAS ESTADÍSTICAS DEL MES...',
]

export default function SplashScreen() {
  const randomMessage = useMemo(() => LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)], [])

  useEffect(() => {
    const splashAudio = new Audio('/splash-loop.mp3')
    splashAudio.loop = true
    splashAudio.volume = 0.4

    const tryPlay = () => {
      splashAudio.play().catch((error) => {
        console.warn('Autoplay bloqueado por el navegador', error)
      })
    }

    const unlock = () => {
      tryPlay()
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('touchstart', unlock)
      window.removeEventListener('keydown', unlock)
    }

    window.addEventListener('pointerdown', unlock)
    window.addEventListener('touchstart', unlock)
    window.addEventListener('keydown', unlock)

    tryPlay()

    return () => {
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('touchstart', unlock)
      window.removeEventListener('keydown', unlock)
      splashAudio.pause()
      splashAudio.currentTime = 0
    }
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white dark:bg-gray-950 transition-colors duration-300">
      <div className="flex flex-col items-center gap-6">
        <BrandLogo size="lg" />

        <div className="flex items-center gap-3">
          {iconos.map(({ Icon, delay }) => (
            <div
              key={delay}
              className="w-12 h-12 flex items-center justify-center border-4 border-black dark:border-white bg-yellow-400 dark:bg-yellow-500 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
              style={{ animation: `splash-bounce 1.2s ease-in-out infinite ${delay}` }}
            >
              <Icon size={22} strokeWidth={2.5} />
            </div>
          ))}
        </div>

        <p className="mt-8 text-xl font-black uppercase tracking-widest text-center text-black dark:text-white animate-pulse">
          {randomMessage}
        </p>
      </div>
    </div>
  )
}
