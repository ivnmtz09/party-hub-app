import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface BackButtonProps {
  onClick?: () => void
  to?: string
}

export default function BackButton({ onClick, to }: BackButtonProps) {
  const navigate = useNavigate()

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else if (to) {
      navigate(to)
    } else {
      navigate(-1)
    }
  }

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center justify-center w-10 h-10 bg-white dark:bg-gray-800 border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all cursor-pointer flex-shrink-0"
    >
      <ArrowLeft size={20} strokeWidth={2.5} className="text-black dark:text-white" />
    </button>
  )
}
