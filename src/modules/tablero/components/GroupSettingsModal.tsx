import { useState } from 'react'
import {
  X,
  Crown,
  Save,
  UserMinus,
  Trash2,
  LogOut,
  Loader2,
} from 'lucide-react'
import {
  actualizarNombreGrupo,
  eliminarGrupo,
  expulsarMiembro,
  abandonarGrupo,
  type Grupo,
  type Miembro,
} from '../../../firebase/services'

interface Props {
  open: boolean
  onClose: () => void
  group: Grupo
  miembros: Miembro[]
  userId: string
}

export default function GroupSettingsModal({
  open,
  onClose,
  group,
  miembros,
  userId,
}: Props) {
  const [nombre, setNombre] = useState(group.nombre)
  const [savingName, setSavingName] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const [expellingId, setExpellingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  if (!open) return null

  const isAdmin = userId === group.adminId

  const handleSaveName = async () => {
    if (!nombre.trim() || nombre.trim() === group.nombre) return
    setSavingName(true)
    setError('')
    try {
      await actualizarNombreGrupo(group.id, nombre.trim())
    } catch {
      setError('Error al guardar el nombre')
    } finally {
      setSavingName(false)
    }
  }

  const handleExpel = async (miembroId: string) => {
    if (miembroId === group.adminId) return
    setExpellingId(miembroId)
    setError('')
    try {
      await expulsarMiembro(group.id, miembroId)
    } catch {
      setError('Error al expulsar al miembro')
    } finally {
      setExpellingId(null)
    }
  }

  const handleDeleteGroup = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    setDeleting(true)
    setError('')
    try {
      await eliminarGrupo(group.id)
      setConfirmDelete(false)
      onClose()
    } catch {
      setError('Error al eliminar el grupo')
      setDeleting(false)
    }
  }

  const handleLeaveGroup = async () => {
    setLeaving(true)
    setError('')
    try {
      await abandonarGrupo(group.id, userId)
      onClose()
    } catch {
      setError('Error al abandonar el grupo')
      setLeaving(false)
    }
  }

  const miembrosOrdenados = [...miembros].sort((a) =>
    a.id === group.adminId ? -1 : 1,
  )

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 select-none"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md border-4 border-black dark:border-white bg-white dark:bg-gray-800 p-5 sm:p-6 shadow-brutal-lg dark:shadow-brutal-lg-dark max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 border-2 border-black dark:border-white bg-white dark:bg-gray-800 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <X size={20} strokeWidth={2.5} />
        </button>

        <h3 className="text-lg font-black uppercase tracking-wider text-black dark:text-white mb-6">
          Ajustes de Grupo
        </h3>

        {error && (
          <p className="text-red-600 font-black text-sm mb-4 uppercase tracking-wider">
            {error}
          </p>
        )}

        {isAdmin ? (
          <>
            <div className="mb-6">
              <label className="block text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">
                Nombre del Grupo
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="flex-1 py-2 px-3 border-4 border-black dark:border-white bg-white dark:bg-gray-800 text-black dark:text-white font-bold uppercase tracking-wider placeholder:text-gray-400 focus:outline-none focus:ring-0 text-base"
                />
                <button
                  onClick={handleSaveName}
                  disabled={savingName || !nombre.trim() || nombre.trim() === group.nombre}
                  className="p-2 border-4 border-black dark:border-white bg-cyan-300 dark:bg-cyan-400 text-black dark:text-gray-900 shadow-brutal-sm dark:shadow-brutal-sm-dark active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingName ? (
                    <Loader2 size={18} className="animate-spin" strokeWidth={2.5} />
                  ) : (
                    <Save size={18} strokeWidth={2.5} />
                  )}
                </button>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">
                Miembros
              </label>
              <div className="space-y-2">
                {miembrosOrdenados.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between border-2 border-black dark:border-white bg-white dark:bg-gray-800 p-3 shadow-brutal-sm dark:shadow-brutal-sm-dark"
                  >
                    <div className="flex items-center gap-2">
                      {m.id === group.adminId && (
                        <Crown size={14} strokeWidth={2.5} className="text-yellow-600 dark:text-yellow-300 shrink-0" />
                      )}
                      <span className="font-bold text-sm uppercase tracking-wider text-black dark:text-white">
                        {m.nickname || m.displayName.split(' ')[0]}
                      </span>
                    </div>
                    {m.id !== group.adminId && (
                      <button
                        onClick={() => handleExpel(m.id)}
                        disabled={expellingId === m.id}
                        className="p-1.5 border-2 border-black dark:border-white bg-red-300 dark:bg-red-500 text-black dark:text-gray-900 shadow-brutal-sm dark:shadow-brutal-sm-dark active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {expellingId === m.id ? (
                          <Loader2 size={14} className="animate-spin" strokeWidth={2.5} />
                        ) : (
                          <UserMinus size={14} strokeWidth={2.5} />
                        )}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleDeleteGroup}
              disabled={deleting}
              className="w-full flex items-center justify-center gap-2 py-4 border-4 border-black dark:border-white bg-red-500 dark:bg-red-600 text-white font-black uppercase tracking-wider shadow-brutal dark:shadow-brutal-dark active:translate-x-1 active:translate-y-1 active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleting ? (
                <Loader2 size={20} className="animate-spin" strokeWidth={2.5} />
              ) : confirmDelete ? (
                <>
                  <Trash2 size={20} strokeWidth={2.5} />
                  CONFIRMAR ELIMINACION
                </>
              ) : (
                <>
                  <Trash2 size={20} strokeWidth={2.5} />
                  ELIMINAR GRUPO
                </>
              )}
            </button>
          </>
        ) : (
          <>
            <div className="mb-6">
              <label className="block text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">
                Miembros
              </label>
              <div className="space-y-2">
                {miembrosOrdenados.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center gap-2 border-2 border-black dark:border-white bg-white dark:bg-gray-800 p-3 shadow-brutal-sm dark:shadow-brutal-sm-dark"
                  >
                    {m.id === group.adminId && (
                      <Crown size={14} strokeWidth={2.5} className="text-yellow-600 dark:text-yellow-300 shrink-0" />
                    )}
                    <span className="font-bold text-sm uppercase tracking-wider text-black dark:text-white">
                      {m.nickname || m.displayName.split(' ')[0]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleLeaveGroup}
              disabled={leaving}
              className="w-full flex items-center justify-center gap-2 py-4 border-4 border-black dark:border-white bg-red-300 dark:bg-red-500 text-black dark:text-gray-900 font-black uppercase tracking-wider shadow-brutal dark:shadow-brutal-dark active:translate-x-1 active:translate-y-1 active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {leaving ? (
                <Loader2 size={20} className="animate-spin" strokeWidth={2.5} />
              ) : (
                <>
                  <LogOut size={20} strokeWidth={2.5} />
                  ABANDONAR GRUPO
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
