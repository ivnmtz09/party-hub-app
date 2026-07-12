import { useState } from 'react'
import { LogIn, Square, CheckSquare, X, Swords, BarChart2, Users } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import BrandLogo from './BrandLogo'

const TERMINOS = `1. PRIVACIDAD: Tu cuenta de Google solo se usa para autenticacion y gestion de perfil. No vendemos tus datos.
2. RESPONSABILIDAD: Esta es una aplicacion de entretenimiento. El contenido generado (juegos, votaciones, registros) es responsabilidad absoluta de los usuarios.
3. COMPORTAMIENTO: Se prohibe el uso de la plataforma para acoso, bullying o difusion de contenido ilegal. El incumplimiento causara la expulsion inmediata del grupo.
4. NATURALEZA DEL JUEGO: Al aceptar, reconoces que los juegos son de caracter recreativo y pueden incluir temas personales o sensibles. Juega con criterio.`

const FEATURES = [
  {
    icon: Swords,
    text: 'Destruye amistades en el Arcade con Yo Nunca y el Dedo en la Llaga.',
  },
  {
    icon: BarChart2,
    text: 'Registra las peores cagadas y el progreso en el gimnasio.',
  },
  {
    icon: Users,
    text: 'Crea grupos cerrados y mantén los secretos a salvo.',
  },
]

export default function LoginPage() {
  const { loginWithGoogle } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const [showTerminos, setShowTerminos] = useState(false)

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

  const terminosParts = TERMINOS.split('\n').filter(Boolean)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-yellow-300 dark:bg-gray-950 text-black dark:text-white px-6 py-10">
      <div className="w-full max-w-lg flex flex-col items-center gap-8">

        <div className="flex flex-col items-center gap-4">
          <BrandLogo size="lg" />
          <p className="text-xs font-black uppercase tracking-widest text-center text-black/70 dark:text-gray-400 max-w-xs">
            El centro de control para tu grupo de amigos
          </p>
        </div>

        <div className="w-full bg-cyan-300 dark:bg-cyan-900 border-4 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] space-y-4">
          <ul className="space-y-3">
            {FEATURES.map((feat, i) => {
              const Icon = feat.icon
              return (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center border-2 border-black bg-white dark:bg-gray-800">
                    <Icon size={16} strokeWidth={2.5} />
                  </div>
                  <span className="text-sm font-bold uppercase tracking-wide leading-relaxed text-black dark:text-white pt-1">
                    {feat.text}
                  </span>
                </li>
              )
            })}
          </ul>
        </div>

        <div className="flex flex-col gap-4 w-full max-w-xs">
          <label className="flex items-start gap-3 cursor-pointer">
            <button
              onClick={() => setAccepted(!accepted)}
              className="mt-0.5 shrink-0"
              type="button"
            >
              {accepted ? (
                <CheckSquare size={20} strokeWidth={2.5} className="text-black dark:text-white" />
              ) : (
                <Square size={20} strokeWidth={2.5} className="text-black dark:text-white" />
              )}
            </button>
            <span className="text-xs font-bold uppercase tracking-wider text-black dark:text-white leading-relaxed">
              Acepto los{' '}
              <button
                onClick={(e) => { e.preventDefault(); setShowTerminos(true) }}
                className="underline underline-offset-2 text-cyan-700 dark:text-cyan-400 hover:no-underline font-black"
                type="button"
              >
                terminos y condiciones
              </button>{' '}
              de Party Hub
            </span>
          </label>

          <button
            onClick={handleLogin}
            disabled={busy || !accepted}
            className="w-full flex items-center justify-center gap-2 py-4 border-4 border-black dark:border-white bg-cyan-400 dark:bg-cyan-500 text-black dark:text-gray-900 font-black uppercase tracking-wider text-sm shadow-brutal dark:shadow-brutal-dark active:translate-x-1 active:translate-y-1 active:shadow-none transition-all disabled:opacity-50"
          >
            <LogIn size={20} strokeWidth={2.5} />
            {busy ? 'Conectando...' : 'Entrar a la locura con Google'}
          </button>

          {error && (
            <p className="text-red-700 dark:text-red-400 text-sm mt-1 text-center font-bold">
              {error}
            </p>
          )}
        </div>
      </div>

      {showTerminos && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade-in">
          <div className="w-full max-w-md border-4 border-black bg-white dark:bg-gray-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-lg font-black uppercase tracking-tighter text-black dark:text-white">
                Terminos de Uso
              </p>
              <button
                onClick={() => setShowTerminos(false)}
                className="p-1 border-2 border-black bg-gray-200 dark:bg-gray-700 text-black dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                <X size={16} strokeWidth={2.5} />
              </button>
            </div>
            <div className="space-y-3">
              {terminosParts.map((line, i) => (
                <p key={i} className="text-xs font-bold leading-relaxed text-black dark:text-white">
                  {line}
                </p>
              ))}
            </div>
            <button
              onClick={() => setShowTerminos(false)}
              className="w-full py-3 border-4 border-black bg-cyan-400 dark:bg-cyan-500 text-black font-black uppercase tracking-wider text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
