import Avatar from 'boring-avatars'

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

export type AvatarType = 'letter' | 'marble'

interface UserAvatarProps {
  name: string
  color: string
  type?: AvatarType
  size?: number
  className?: string
}

export default function UserAvatar({
  name,
  color,
  type = 'letter',
  size = 48,
  className = '',
}: UserAvatarProps) {
  if (type === 'marble') {
    return (
      <div
        className={`border-2 border-black dark:border-white overflow-hidden ${className}`}
        style={{ width: size, height: size }}
      >
        <Avatar
          name={name}
          variant="marble"
          colors={[color, '#ffffff', '#000000', '#fbbf24', '#ec4899']}
          size={size}
        />
      </div>
    )
  }

  return (
    <div
      className={`border-2 border-black dark:border-white flex items-center justify-center font-black text-black ${className}`}
      style={{ backgroundColor: color, width: size, height: size, fontSize: size * 0.4 }}
    >
      {name ? name.charAt(0).toUpperCase() : '?'}
    </div>
  )
}
