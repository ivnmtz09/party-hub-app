import BackButton from './BackButton'

interface GameHeaderProps {
  title: string
  backTo: string
}

export default function GameHeader({ title, backTo }: GameHeaderProps) {
  return (
    <div className="w-full flex items-center justify-between mb-6">
      <div className="w-10 flex-shrink-0">
        <BackButton to={backTo} />
      </div>
      <h1 className="text-2xl font-black uppercase text-center flex-1 truncate px-2 text-black dark:text-white">
        {title}
      </h1>
      <div className="w-10 flex-shrink-0" />
    </div>
  )
}
