import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[100dvh] w-full bg-yellow-400 dark:bg-pink-500 flex items-center justify-center p-4">
      <div className="w-full max-w-lg flex flex-col items-center gap-8">
        <div
          className="w-full text-center border-4 border-black dark:border-white bg-white text-black font-black uppercase tracking-wider shadow-[8px_8px_0px_rgba(0,0,0,1)] py-12 px-8"
          style={{ fontSize: '5rem', lineHeight: 1 }}
        >
          404
        </div>

        <p className="text-center text-black font-black uppercase tracking-wider text-sm">
          Esta página no existe o te perdiste
        </p>

        <Link
          to="/"
          className="w-full flex items-center justify-center gap-3 py-5 border-4 border-black dark:border-white bg-white text-black font-black uppercase tracking-wider text-xl shadow-[8px_8px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
        >
          <Home size={28} strokeWidth={2.5} />
          VOLVER AL INICIO
        </Link>
      </div>
    </div>
  )
}
