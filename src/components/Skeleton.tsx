interface Props {
  variant?: 'card' | 'listItem'
  count?: number
}

export default function Skeleton({ variant = 'card', count = 1 }: Props) {
  const items = Array.from({ length: count })

  if (variant === 'listItem') {
    return (
      <div className="space-y-2">
        {items.map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 border-4 border-black dark:border-white bg-white dark:bg-gray-800 p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            <div className="w-10 h-10 border-2 border-black dark:border-white bg-gray-300 dark:bg-gray-700 animate-pulse shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-28 bg-gray-300 dark:bg-gray-700 animate-pulse border border-black dark:border-white" />
              <div className="h-2.5 w-20 bg-gray-300 dark:bg-gray-700 animate-pulse border border-black dark:border-white" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {items.map((_, i) => (
        <div
          key={i}
          className="w-full h-28 border-4 border-black dark:border-white bg-gray-300 dark:bg-gray-700 animate-pulse shadow-brutal dark:shadow-brutal-dark"
        />
      ))}
    </div>
  )
}
