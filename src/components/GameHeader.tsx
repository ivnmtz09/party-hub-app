import BackButton from './BackButton'

interface GameHeaderProps {
  title: string
  backTo: string
}

export default function GameHeader({ title, backTo }: GameHeaderProps) {
  return (
    <div className="w-full flex items-center justify-between mb-6">
      <BackButton to={backTo} />
      <h1 className="text-2xl font-black uppercase text-center flex-1">{title}</h1>
      <div className="w-10" />
    </div>
  )
}
