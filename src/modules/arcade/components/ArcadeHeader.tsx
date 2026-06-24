import { Skull, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import BrandLogo from '../../../components/BrandLogo'

interface ArcadeHeaderProps {
  showBack?: boolean
}

export default function ArcadeHeader({ showBack }: ArcadeHeaderProps) {
  const navigate = useNavigate()
  return (
    <div className="relative sticky top-0 z-20 bg-yellow-300 dark:bg-yellow-400 border-b-4 border-black dark:border-white flex items-center justify-between h-12 px-4">
      {showBack && (
        <button
          onClick={() => navigate('/arcade')}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 border-2 border-black dark:border-white shadow-brutal-sm dark:shadow-brutal-sm-dark p-2 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <ArrowLeft size={16} strokeWidth={2.5} className="text-black dark:text-white" />
        </button>
      )}
      <BrandLogo size="sm" />
      <div className="flex items-center gap-1.5 ml-auto">
        <Skull size={16} strokeWidth={2.5} className="text-black dark:text-white" />
        <span className="text-xs font-black uppercase tracking-widest text-black dark:text-white">
          ARCADE
        </span>
      </div>
    </div>
  )
}
