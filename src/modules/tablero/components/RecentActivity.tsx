import { useState } from 'react'
import { Trash2, Flame, Dumbbell, Check, X, Edit } from 'lucide-react'
import type { Timestamp } from 'firebase/firestore'
import type { Evento, Miembro } from '../../../firebase/services'
import { eliminarEvento } from '../../../firebase/services'
import Skeleton from '../../../components/Skeleton'
import RecordModal from './RecordModal'

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
  loading?: boolean
}

export default function RecentActivity({ eventos, miembros, userId, groupId, loading = false }: Props) {
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [editEvento, setEditEvento] = useState<Evento | null>(null)
  const [editAnchor, setEditAnchor] = useState<{ x: number; y: number } | undefined>(undefined)

  const recientes = eventos.slice(0, 5)

  const getMemberName = (uid: string): string =>
    (() => {
      const m = miembros.find((x) => x.id === uid)
      if (!m) return uid
      return (m.nickname || m.displayName.split(' ')[0]) ?? uid
    })()

  const handleDelete = async (eventId: string) => {
    setLoadingId(eventId)
    try {
      await eliminarEvento(groupId, eventId)
    } catch {
      /* error silencioso */
    } finally {
      setLoadingId(null)
      setConfirmingId(null)
    }
  }

  const handleEditClick = (ev: Evento, e: React.MouseEvent) => {
    e.stopPropagation()
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setEditAnchor({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 })
    setEditEvento(ev)
  }

  return (
    <section>
      <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3">
        Actividad Reciente
      </h3>

      {loading ? (
        <Skeleton variant="listItem" count={5} />
      ) : recientes.length === 0 ? (
        <div className="border-4 border-black dark:border-white bg-white dark:bg-gray-800 p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-center">
            No hay registros aun
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {recientes.map((ev) => {
            const isOwn = ev.userId === userId
            const isConfirming = confirmingId === ev.id
            const isLoading = loadingId === ev.id
            const hasDetails = ev.rating || ev.note || ev.photoUrl
            const icono =
              ev.tipo === 'deposicion' ? (
                <Trash2 size={16} strokeWidth={2.5} className="text-orange-500" />
              ) : ev.tipo === 'acto_sexual' ? (
                <Flame size={16} strokeWidth={2.5} className="text-pink-500" />
              ) : (
                <Dumbbell size={16} strokeWidth={2.5} className="text-cyan-500" />
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
                    {ev.tipo === 'deposicion' ? 'Cagada' : ev.tipo === 'acto_sexual' ? 'Culeada' : 'Gym'} &middot;{' '}
                    {tiempoRelativo(ev.timestamp as Timestamp)}
                    {hasDetails && (
                      <span className="ml-1 text-yellow-500">&#9733;</span>
                    )}
                  </p>
                </div>

                {isOwn && !isConfirming && (
                  <div className="flex gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => handleEditClick(ev, e)}
                      className="p-2 border-2 border-black bg-yellow-400 text-black hover:bg-yellow-300 transition-opacity shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none min-w-[44px] min-h-[44px] flex items-center justify-center"
                    >
                      <Edit size={14} strokeWidth={2.5} />
                    </button>
                    <button
                      onClick={() => setConfirmingId(ev.id!)}
                      className="p-2 border-2 border-black bg-red-500 text-white hover:bg-red-600 transition-opacity shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none min-w-[44px] min-h-[44px] flex items-center justify-center"
                    >
                      {isLoading ? (
                        <span className="text-[10px] font-black">...</span>
                      ) : (
                        <Trash2 size={14} strokeWidth={2.5} />
                      )}
                    </button>
                  </div>
                )}

                {isOwn && isConfirming && (
                  <div className="flex gap-1.5 transition-opacity shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setConfirmingId(null)}
                      className="flex items-center gap-1 px-2 py-2 border-2 border-black bg-gray-300 dark:bg-gray-600 text-black dark:text-white font-black text-[10px] uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all min-w-[44px] min-h-[44px]"
                    >
                      <X size={12} strokeWidth={2.5} />
                      Cancelar
                    </button>
                    <button
                      onClick={() => handleDelete(ev.id!)}
                      disabled={isLoading}
                      className="flex items-center gap-1 px-2 py-2 border-2 border-black bg-red-500 text-white font-black text-[10px] uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-50 min-w-[44px] min-h-[44px]"
                    >
                      <Check size={12} strokeWidth={2.5} />
                      {isLoading ? '...' : 'Confirmar'}
                    </button>
                  </div>
                )}

                {!isOwn && !isConfirming && ev.rating ? (
                  <div className="shrink-0">
                    <button
                      onClick={(e) => handleEditClick(ev, e)}
                      className="p-2 border-2 border-black dark:border-white bg-gray-100 dark:bg-gray-700 text-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 transition-opacity shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none min-w-[44px] min-h-[44px] flex items-center justify-center"
                    >
                      <Edit size={14} strokeWidth={2.5} />
                    </button>
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      )}

      {editEvento && (
        <RecordModal
          mode="view"
          open={true}
          onClose={() => setEditEvento(null)}
          evento={editEvento}
          miembros={miembros}
          groupId={groupId}
          anchorRect={editAnchor}
        />
      )}
    </section>
  )
}
