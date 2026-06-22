import { Gamepad2 } from 'lucide-react'

export default function SplashScreen() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gray-950">
      <div className="animate-pulse">
        <Gamepad2 size={64} className="text-indigo-500" />
      </div>
      <p className="mt-6 text-lg font-semibold text-gray-300 animate-blink">
        Cargando Party Hub...
      </p>
    </div>
  )
}
