import { useState } from 'react'
import { X, LogIn, Loader2 } from 'lucide-react'
import { unirseGrupo } from '../../../firebase/services'
import { useAuth } from '../../../context/AuthContext'
import { playCloseSound, playSuccessSound } from '../../../utils/audio'

interface Props {
  open: boolean
  onClose: () => void
}

export default function JoinGroupModal({ open, onClose }: Props) {
  const { user } = useAuth()
  const [codigo, setCodigo] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!open) return null

  const handleJoin = async () => {
    if (!user || codigo.trim().length !== 6) return
    setLoading(true)
    setError('')
    try {
      await unirseGrupo(codigo.trim().toUpperCase(), user)
      playSuccessSound()
      setCodigo('')
      onClose()
    } catch {
      setError('Codigo no encontrado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 select-none"
      onClick={() => { playCloseSound(); onClose() }}
    >
      <div
        className="relative w-full max-w-md border-4 border-black dark:border-white bg-white dark:bg-gray-800 p-5 sm:p-6 shadow-brutal-lg dark:shadow-brutal-lg-dark"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => { playCloseSound(); onClose() }}
          className="absolute top-3 right-3 p-1.5 border-2 border-black dark:border-white bg-white dark:bg-gray-800 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <X size={20} strokeWidth={2.5} />
        </button>

        <h3 className="text-lg font-black uppercase tracking-wider text-black dark:text-white mb-6">
          Unirse a un Grupo
        </h3>

        <input
          type="text"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value.toUpperCase().slice(0, 6))}
          placeholder="Codigo de 6 caracteres"
          maxLength={6}
          className="w-full py-3 px-4 border-4 border-black dark:border-white bg-white dark:bg-gray-800 text-black dark:text-white font-bold uppercase tracking-widest text-center text-2xl placeholder:text-gray-400 focus:outline-none focus:ring-0 mb-4 text-base"
        />

        {error && (
          <p className="text-red-600 font-black text-sm mb-4 uppercase tracking-wider">
            {error}
          </p>
        )}

        <button
          onClick={handleJoin}
          disabled={loading || codigo.trim().length !== 6}
          className="w-full flex items-center justify-center gap-2 py-4 border-4 border-black dark:border-white bg-blue-300 dark:bg-blue-500 text-black dark:text-gray-900 font-black uppercase tracking-wider shadow-brutal dark:shadow-brutal-dark active:translate-x-1 active:translate-y-1 active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 size={20} className="animate-spin" strokeWidth={2.5} />
          ) : (
            <LogIn size={20} strokeWidth={2.5} />
          )}
          Unirse
        </button>
      </div>
    </div>
  )
}
