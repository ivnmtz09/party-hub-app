import { Gamepad2, Ghost, Zap, Flame, Crown, Skull, Bomb, Rocket, type LucideIcon } from 'lucide-react'

export const AVATAR_COLORS = [
  '#fbbf24',
  '#ef4444',
  '#3b82f6',
  '#10b981',
  '#8b5cf6',
  '#ec4899',
  '#f97316',
  '#06b6d4',
  '#e11d48',
  '#7c3aed',
  '#0891b2',
  '#65a30d',
  '#c2410c',
  '#4f46e5',
  '#d946ef',
  '#14b8a6',
]

export const ICON_OPTIONS: { id: string; icon: LucideIcon }[] = [
  { id: 'Gamepad2', icon: Gamepad2 },
  { id: 'Ghost', icon: Ghost },
  { id: 'Zap', icon: Zap },
  { id: 'Flame', icon: Flame },
  { id: 'Crown', icon: Crown },
  { id: 'Skull', icon: Skull },
  { id: 'Bomb', icon: Bomb },
  { id: 'Rocket', icon: Rocket },
]

export type AvatarType = 'letter' | 'shape'

interface UserAvatarProps {
  name: string
  color: string
  type?: AvatarType
  avatarIcon?: string
  size?: number
  className?: string
}

export default function UserAvatar({
  name,
  color,
  type = 'letter',
  avatarIcon = 'Gamepad2',
  size = 48,
  className = '',
}: UserAvatarProps) {
  const IconComponent = ICON_OPTIONS.find((o) => o.id === avatarIcon)?.icon || Gamepad2

  return (
    <div
      className={`border-2 border-black dark:border-white flex items-center justify-center font-black ${className}`}
      style={{ backgroundColor: color, width: size, height: size }}
    >
      {type === 'shape' ? (
        <IconComponent size={size * 0.5} strokeWidth={2.5} className="text-black" />
      ) : (
        <span className="text-black" style={{ fontSize: size * 0.4 }}>
          {name ? name.charAt(0).toUpperCase() : '?'}
        </span>
      )}
    </div>
  )
}
