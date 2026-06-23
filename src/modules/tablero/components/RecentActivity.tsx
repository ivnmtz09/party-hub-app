import { useState } from 'react'
import { Trash2, Flame } from 'lucide-react'
import type { Timestamp } from 'firebase/firestore'
import type { Evento, Miembro } from '../../../firebase/services'
import { eliminarEvento } from '../../../firebase/services'
import DeleteConfirmationModal from './DeleteConfirmationModal'

function tiempoRelativo(ts: Timestamp | null): string {
  if (!ts) return ''
  const segundos = Math.floor((Date.now() - ts.toMillis()) / 1000)
  if (segundos < 60) return 'ahora'
  const minutos = Math.floor(segundos / 60)
  if (minutos < 60) return `hace ${minutos}min`
  const horas = Math.floor(minutos / 60)
  if (horas < 24) return `hace ${horas}h`
  const dias = Math.floor(horas / 24)
  if (dias < 30) return `hace ${dias}d`
  return `hace ${Math.floor(dias / 30)}mes`
}

interface Props {
  eventos: Evento[]
  miembros: Miembro[]
  userId: string
  groupId: string
}

export default function RecentActivity({ eventos, miembros, userId, groupId }: Props) {
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [loadingDelete, setLoadingDelete] = useState(false)

  const recientes = eventos.slice(0, 5)

  const getMemberName = (uid: string): string =>
    miembros.find((m) => m.id === uid)?.displayName ?? uid

  const handleDelete = async () => {
    if (!pendingDeleteId) return
    setLoadingDelete(true)
    try {
      await eliminarEvento(groupId, pendingDeleteId)
    } catch {
      /* error silencioso */
    } finally {
      setLoadingDelete(false)
      setPendingDeleteId(null)
    }
  }

  return (
    <section>
      <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3">
        Actividad Reciente
      </h3>

      {recientes.length === 0 ? (
        <div className="border-4 border-black dark:border-white bg-white dark:bg-gray-800 p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-center">
            No hay registros aun
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {recientes.map((ev) => {
            const isOwn = ev.userId === userId
            const icono =
              ev.tipo === 'deposicion' ? (
                <Trash2 size={16} strokeWidth={2.5} className="text-orange-500" />
              ) : (
                <Flame size={16} strokeWidth={2.5} className="text-rose-500" />
              )

            return (
              <div
                key={ev.id}
                className="flex items-center gap-3 border-4 border-black dark:border-white bg-white dark:bg-gray-800 p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                <div className="w-8 h-8 border-2 border-black dark:border-white flex items-center justify-center shrink-0 bg-gray-100 dark:bg-gray-700">
                  {icono}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black uppercase tracking-wider truncate text-black dark:text-white">
                    {getMemberName(ev.userId)}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    {ev.tipo === 'deposicion' ? 'Cagada' : 'Culeada'} &middot;{' '}
                    {tiempoRelativo(ev.timestamp as Timestamp)}
                  </p>
                </div>

                {isOwn && (
                  <button
                    onClick={() => setPendingDeleteId(ev.id!)}
                    className="p-2 border-2 border-black bg-red-500 text-white hover:bg-red-600 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none shrink-0"
                  >
                    <Trash2 size={14} strokeWidth={2.5} />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      <DeleteConfirmationModal
        open={pendingDeleteId !== null}
        onClose={() => setPendingDeleteId(null)}
        onConfirm={handleDelete}
        loading={loadingDelete}
      />
    </section>
  )
}
