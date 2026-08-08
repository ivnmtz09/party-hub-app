import { useState } from 'react'
import { ChevronDown, Trash2, Loader2 } from 'lucide-react'
import type { Grupo } from '../firebase/services'
import { playOpenSound, playClickSound, playDeleteSound } from '../utils/audio'
import { eliminarGrupo } from '../firebase/services'
import DeleteConfirmationModal from '../modules/tablero/components/DeleteConfirmationModal'
import { useAuth } from '../context/AuthContext'

interface Props {
  grupos: Grupo[]
  activeGroupId: string | null
  setActiveGroupId: (id: string | null) => void
}

export default function GroupSelector({ grupos, activeGroupId, setActiveGroupId }: Props) {
  const { user } = useAuth()
  const [show, setShow] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<Grupo | null>(null)
  const [deleting, setDeleting] = useState(false)

  if (grupos.length === 0) return null
  const activeGroup = grupos.find((g) => g.id === activeGroupId)

  const handleDelete = async () => {
    if (!pendingDelete) return
    setDeleting(true)
    try {
      await eliminarGrupo(pendingDelete.id)
      playDeleteSound()
      if (activeGroupId === pendingDelete.id) setActiveGroupId(null)
      setPendingDelete(null)
    } catch {
      /* noop */
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="relative mb-4">
      <button
        type="button"
        onClick={() => { playOpenSound(); setShow(!show) }}
        className="w-full flex items-center justify-between gap-2 py-3 px-4 border-4 border-black dark:border-white bg-white dark:bg-gray-800 text-black dark:text-white font-black uppercase tracking-wider shadow-brutal dark:shadow-brutal-dark active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
      >
        <span className="truncate">{activeGroup?.nombre ?? 'Seleccionar grupo'}</span>
        <ChevronDown
          size={20}
          strokeWidth={2.5}
          className={`transition-transform ${show ? 'rotate-180' : ''}`}
        />
      </button>
      {show && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShow(false)}
          />
          <div className="absolute top-full left-0 right-0 mt-1 z-20 border-4 border-black dark:border-white bg-white dark:bg-gray-800 shadow-brutal dark:shadow-brutal-dark overflow-hidden">
            {grupos.map((g) => {
              const isActive = g.id === activeGroupId
              const isAdmin = user?.uid === g.adminId
              return (
                <div
                  key={g.id}
                  className={`flex items-center justify-between border-b-2 border-black dark:border-white last:border-b-0 ${
                    isActive
                      ? 'bg-yellow-300 dark:bg-yellow-500'
                      : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      playClickSound()
                      setActiveGroupId(g.id)
                      setShow(false)
                    }}
                    className="flex-1 text-left py-3 px-4 font-black uppercase tracking-wider text-sm text-black dark:text-white"
                  >
                    {g.nombre}
                  </button>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => setPendingDelete(g)}
                      className="p-2 border-l-2 border-black dark:border-white bg-red-300 dark:bg-red-500 text-black dark:text-gray-900 hover:bg-red-400 dark:hover:bg-red-600 active:translate-x-0.5 active:translate-y-0.5 transition-all"
                      title="Eliminar grupo"
                    >
                      <Trash2 size={14} strokeWidth={2.5} />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}

      {pendingDelete && (
        <DeleteConfirmationModal
          open={!!pendingDelete}
          onClose={() => setPendingDelete(null)}
          onConfirm={handleDelete}
          loading={deleting}
        />
      )}
      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <Loader2 size={36} className="animate-spin text-white" strokeWidth={2.5} />
        </div>
      )}
    </div>
  )
}
