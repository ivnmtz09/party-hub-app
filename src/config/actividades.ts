import { Trash2, Flame, Droplet, Dumbbell, type LucideIcon } from 'lucide-react'

export interface Actividad {
  tipo: string
  label: string
  labelPlural: string
  badgeColor: string
  tileColor: string
  iconColor: string
  icon: LucideIcon
}

export const ACTIVIDADES_DEFAULT: Actividad[] = [
  {
    tipo: 'deposicion',
    label: 'CAGADA',
    labelPlural: 'CAGADAS',
    badgeColor: 'bg-orange-400 dark:bg-orange-500',
    tileColor: 'bg-orange-50 dark:bg-gray-700',
    iconColor: 'text-orange-500',
    icon: Trash2,
  },
  {
    tipo: 'acto_sexual',
    label: 'CULEADA',
    labelPlural: 'CULEADAS',
    badgeColor: 'bg-pink-400 dark:bg-pink-500',
    tileColor: 'bg-pink-50 dark:bg-gray-700',
    iconColor: 'text-pink-500',
    icon: Flame,
  },
  {
    tipo: 'meada',
    label: 'MEADA',
    labelPlural: 'MEADAS',
    badgeColor: 'bg-yellow-400 dark:bg-yellow-500',
    tileColor: 'bg-yellow-50 dark:bg-gray-700',
    iconColor: 'text-yellow-500',
    icon: Droplet,
  },
  {
    tipo: 'gym',
    label: 'GYM',
    labelPlural: 'GYM',
    badgeColor: 'bg-cyan-400 dark:bg-cyan-500',
    tileColor: 'bg-cyan-50 dark:bg-gray-700',
    iconColor: 'text-cyan-500',
    icon: Dumbbell,
  },
]

export function getActividad(tipo: string): Actividad {
  return ACTIVIDADES_DEFAULT.find((a) => a.tipo === tipo) ?? ACTIVIDADES_DEFAULT[0]!
}

export const ACTIVIDAD_GRADIENTS: Record<string, string> = {
  deposicion: 'from-orange-400 to-red-500',
  acto_sexual: 'from-pink-400 to-fuchsia-600',
  meada: 'from-yellow-300 to-amber-500',
  gym: 'from-cyan-400 to-blue-600',
}

export function getActividadGradient(tipo: string): string {
  return ACTIVIDAD_GRADIENTS[tipo] ?? 'from-gray-400 to-gray-600'
}

export function getLabelActividad(tipo: string): string {
  return getActividad(tipo).label
}

export function getLabelPluralActividad(tipo: string): string {
  return getActividad(tipo).labelPlural
}

export function getIconActividad(tipo: string): LucideIcon {
  return getActividad(tipo).icon
}