import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import BrandLogo from './BrandLogo'

export default function SplashScreen() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((p) => Math.min(p + 3, 100))
    }, 60)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gray-950 gap-8 px-4">
      <BrandLogo size="lg" />

      <div className="w-64 max-w-full border-4 border-white">
        <div
          className="h-4 bg-yellow-400 transition-all duration-150 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      <Loader2
        size={24}
        className="animate-spin text-white/70"
        strokeWidth={2.5}
      />
    </div>
  )
}
