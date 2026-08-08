import {
  Rocket,
  Sparkles,
  LayoutGrid,
  Trophy,
  TrendingUp,
  BellRing,
  Gamepad2,
  type LucideIcon,
} from 'lucide-react'

export interface UpdateCard {
  id: string
  icon: LucideIcon
  gradient: string
  title: string
  subtitle: string
  bullets: string[]
}

export const UPDATE_CARDS: UpdateCard[] = [
  {
    id: 'introduccion',
    icon: Rocket,
    gradient: 'from-fuchsia-500 to-pink-600',
    title: 'Bienvenido a la nueva actualización',
    subtitle: 'Party Hub ha evolucionado. Todo más colorido, más rápido y con nuevas formas de presumir.',
    bullets: [
      'Nuevo aspecto visual en todos los apartados',
      'Módulo del mural totalmente renovado',
      'Sistema de XP exclusivo del Mural',
    ],
  },
  {
    id: 'visual',
    icon: Sparkles,
    gradient: 'from-violet-500 to-indigo-700',
    title: 'Mejoras visuales',
    subtitle: 'Rediseñamos varios apartados con un estilo más pulido y llamativo.',
    bullets: [
      'Tablero, mural, perfil y arcade con nuevo estilo',
      'Tarjetas de la lista y botones de crear sala con el color de cada juego',
      'Animaciones y detalles más cuidados en toda la app',
    ],
  },
  {
    id: 'mural',
    icon: LayoutGrid,
    gradient: 'from-cyan-400 to-blue-600',
    title: 'Nuevo módulo: Mural',
    subtitle: 'El lugar donde tu grupo controla hábitos y gana XP en tiempo real.',
    bullets: [
      'Botón de 1 toque para registrar tus sucesos rápidos',
      'Seguimiento de hidratación con vasos de agua',
      'Feed en vivo con la actividad del grupo',
    ],
  },
  {
    id: 'xp-diario',
    icon: Trophy,
    gradient: 'from-amber-400 to-yellow-600',
    title: 'XP y records diarios',
    subtitle: 'Los XP se ganan solo desde el Mural. Registra, gana y vence tu récord del día.',
    bullets: [
      'Toda actividad del Mural premiada con XP',
      'Superar tu récord diario da bonus',
      'Sube de nivel a medida que compites contigo mismo',
    ],
  },
  {
    id: 'xp-mensual',
    icon: TrendingUp,
    gradient: 'from-orange-400 to-red-500',
    title: 'XP mensual y su uso',
    subtitle: 'Tu XP mensual se calcula con tus registros del Mural.',
    bullets: [
      'Ranking mensual dentro de tu grupo',
      'Tu XP mensual refleja tu constancia',
      'Consumibles y desbloqueos llegarán dentro de poco',
    ],
  },
  {
    id: 'notificaciones',
    icon: BellRing,
    gradient: 'from-emerald-400 to-teal-600',
    title: 'Notificaciones más útiles',
    subtitle: 'Ahora te llevan directo a lo que importa.',
    bullets: [
      'Abre los registros nuevos al instante',
      'Ya no te manda a los registros viejos',
      'Reacciones y comentarios en tus registros al toque',
    ],
  },
  {
    id: 'arcade',
    icon: Gamepad2,
    gradient: 'from-emerald-400 to-teal-600',
    title: 'Arcade afilado',
subtitle: 'Mejoramos la lógica de los juegos para que nada se rompa en plena partida.',
    bullets: [
      'Lógicas de sala y votación corregidas',
      'Más pulido en ruleta, impostor y código secreto',
      'Colores y sonidos nuevos en cada juego',
    ],
  },
]

export const UPDATE_CARDS_VERSION = 'v1'
export const UPDATE_CARDS_STORAGE_KEY = (uid: string) =>
  `partyhub_update_cards_${UPDATE_CARDS_VERSION}_${uid}`