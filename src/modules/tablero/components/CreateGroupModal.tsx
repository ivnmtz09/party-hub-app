import { useState } from 'react'
import { X, Plus, Loader2 } from 'lucide-react'
import { crearGrupo } from '../../../firebase/services'
import { useAuth } from '../../../context/AuthContext'

interface Props {
  open: boolean
  onClose: () => void
}

export default function CreateGroupModal({ open, onClose }: Props) {
  const { user } = useAuth()
  const [nombre, setNombre] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!open) return null

  const handleCreate = async () => {
    if (!user || !nombre.trim()) return
    setLoading(true)
    setError('')
    try {
      await crearGrupo(nombre.trim(), user)
      setNombre('')
      onClose()
    } catch {
      setError('Error al crear el grupo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md border-4 border-black dark:border-white bg-white dark:bg-gray-800 p-6 shadow-brutal-lg dark:shadow-brutal-lg-dark"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 border-2 border-black dark:border-white bg-white dark:bg-gray-800 text-black dark:text-white"
        >
          <X size={20} strokeWidth={2.5} />
        </button>

        <h3 className="text-lg font-black uppercase tracking-wider text-black dark:text-white mb-6">
          Crear Nuevo Grupo
        </h3>

        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre del Grupo"
          className="w-full py-3 px-4 border-4 border-black dark:border-white bg-white dark:bg-gray-800 text-black dark:text-white font-bold uppercase tracking-wider placeholder:text-gray-400 focus:outline-none focus:ring-0 mb-4"
        />

        {error && (
          <p className="text-red-600 font-black text-sm mb-4 uppercase tracking-wider">
            {error}
          </p>
        )}

        <button
          onClick={handleCreate}
          disabled={loading || !nombre.trim()}
          className="w-full flex items-center justify-center gap-2 py-4 border-4 border-black dark:border-white bg-emerald-300 dark:bg-emerald-500 text-black dark:text-gray-900 font-black uppercase tracking-wider shadow-brutal dark:shadow-brutal-dark active:translate-x-1 active:translate-y-1 active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 size={20} className="animate-spin" strokeWidth={2.5} />
          ) : (
            <Plus size={20} strokeWidth={2.5} />
          )}
          Crear
        </button>
      </div>
    </div>
  )
}
