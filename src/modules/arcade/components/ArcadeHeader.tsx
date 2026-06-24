import { Skull } from 'lucide-react'
import BrandLogo from '../../../components/BrandLogo'

export default function ArcadeHeader() {
  return (
    <div className="sticky top-0 z-20 bg-yellow-300 dark:bg-yellow-400 border-b-4 border-black dark:border-white flex items-center justify-between h-12 px-4">
      <BrandLogo size="sm" />
      <div className="flex items-center gap-1.5">
        <Skull size={16} strokeWidth={2.5} className="text-black dark:text-white" />
        <span className="text-xs font-black uppercase tracking-widest text-black dark:text-white">
          ARCADE
        </span>
      </div>
    </div>
  )
}
