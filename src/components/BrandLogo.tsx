interface Props {
  size?: 'sm' | 'md' | 'lg'
}

export default function BrandLogo({ size = 'md' }: Props) {
  const sizes = {
    sm: 'text-base px-1.5 py-0.5',
    md: 'text-xl px-2.5 py-1',
    lg: 'text-4xl px-4 py-2',
  }

  return (
    <span className="inline-flex items-center gap-0 font-black tracking-tighter leading-none select-none">
      <span
        className={`${sizes[size]} bg-yellow-400 dark:bg-yellow-400 text-yellow-800 dark:text-yellow-100 border-2 border-black dark:border-white -rotate-2 shadow-brutal-sm dark:shadow-brutal-sm-dark`}
      >
        PARTY
      </span>
      <span
        className={`${sizes[size]} bg-black dark:bg-white text-white dark:text-black border-2 border-black dark:border-white rotate-2`}
      >
        HUB
      </span>
    </span>
  )
}
