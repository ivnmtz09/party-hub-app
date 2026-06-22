import { useState } from 'react'
import { LogIn } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { loginWithGoogle } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const handleLogin = async () => {
    setError(null)
    setBusy(true)
    try {
      await loginWithGoogle()
    } catch {
      setError('No se pudo iniciar sesion con Google. Intenta de nuevo.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-yellow-300 dark:bg-gray-950 text-black dark:text-white px-6">
      <h1 className="text-5xl font-black uppercase tracking-widest mb-2">
        Party Hub
      </h1>
      <p className="text-black/70 dark:text-gray-400 mb-10 text-center text-sm font-bold uppercase tracking-wide">
        Gestiona tus fiestas y eventos sociales
      </p>

      <div className="flex flex-col gap-4 w-full max-w-xs">
        <button
          onClick={handleLogin}
          disabled={busy}
          className="w-full flex items-center justify-center gap-2 py-4 border-4 border-black dark:border-white bg-cyan-400 dark:bg-cyan-500 text-black dark:text-gray-900 font-black uppercase tracking-wider shadow-brutal dark:shadow-brutal-dark active:translate-x-1 active:translate-y-1 active:shadow-none transition-all disabled:opacity-50"
        >
          <LogIn size={20} strokeWidth={2.5} />
          {busy ? 'Conectando...' : 'Continuar con Google'}
        </button>

        {error && (
          <p className="text-red-700 dark:text-red-400 text-sm mt-1 text-center font-bold">
            {error}
          </p>
        )}
      </div>
    </div>
  )
}
