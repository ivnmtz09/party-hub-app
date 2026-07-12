import { AlertTriangle, X } from 'lucide-react'
import { playCloseSound, playDeleteSound } from '../../../utils/audio'

interface Props {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  loading?: boolean
}

export default function DeleteConfirmationModal({
  open,
  onClose,
  onConfirm,
  loading,
}: Props) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 select-none">
      <div className="w-full max-w-sm border-4 border-black dark:border-white bg-white dark:bg-gray-900 shadow-brutal-lg dark:shadow-brutal-lg-dark p-5 sm:p-6 space-y-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 border-2 border-black dark:border-white bg-red-500 flex items-center justify-center">
              <AlertTriangle size={20} strokeWidth={2.5} className="text-white" />
            </div>
            <p className="text-lg font-black uppercase tracking-tighter text-black dark:text-white">
              Anular este registro?
            </p>
          </div>
          <button
            onClick={() => { playCloseSound(); onClose() }}
            className="p-1.5 border-2 border-black dark:border-white bg-gray-200 dark:bg-gray-700 text-black dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        <p className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">
          Esta accion descontara el registro del marcador del usuario.
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => { playCloseSound(); onClose() }}
            className="flex-1 py-3 border-4 border-black dark:border-white bg-gray-300 dark:bg-gray-700 text-black dark:text-white font-black uppercase tracking-wider text-sm shadow-brutal-sm dark:shadow-brutal-sm-dark active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={() => { playDeleteSound(); onConfirm() }}
            disabled={loading}
            className="flex-1 py-3 border-4 border-black dark:border-white bg-red-500 text-white font-black uppercase tracking-wider text-sm shadow-brutal-sm dark:shadow-brutal-sm-dark active:translate-x-1 active:translate-y-1 active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  )
}
