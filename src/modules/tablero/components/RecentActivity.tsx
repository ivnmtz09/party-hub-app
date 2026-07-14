import { useState, useEffect } from 'react'
import { Trash2, Flame, Dumbbell, Check, X, Eye, ChevronDown } from 'lucide-react'
import { doc, updateDoc } from 'firebase/firestore'
import { ref, deleteObject } from 'firebase/storage'
import type { Timestamp } from 'firebase/firestore'
import type { Evento, Miembro } from '../../../firebase/services'
import { eliminarEvento, observarEventosConLimite } from '../../../firebase/services'
import { db, storage } from '../../../firebase/config'
import { ICON_OPTIONS } from '../../../components/UserAvatar'
import Skeleton from '../../../components/Skeleton'
import ActivityDetailOrEdit from './ActivityDetailOrEdit'
import { playOpenSound, playDeleteSound, playCloseSound, playClickSound } from '../../../utils/audio'

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
  miembros: Miembro[]
  userId: string
  groupId: string
}

export default function RecentActivity({ miembros, userId, groupId }: Props) {
  const [visibleLimit, setVisibleLimit] = useState(5)
  const [eventos, setEventos] = useState<Evento[]>([])
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const unsub = observarEventosConLimite(groupId, visibleLimit, (lista) => {
      setEventos(lista)
      setLoading(false)
    })
    return unsub
  }, [groupId, visibleLimit])

  useEffect(() => {
    const expirationTime = 72 * 60 * 60 * 1000
    for (const item of eventos) {
      if (!item.photoUrl) continue
      const recordTime = item.timestamp?.toDate
        ? item.timestamp.toDate().getTime()
        : new Date(item.timestamp as unknown as string).getTime()
      if (Date.now() - recordTime > expirationTime) {
        deleteObject(ref(storage, item.photoUrl)).catch(() => {})
        updateDoc(doc(db, 'grupos', groupId, 'eventos', item.id!), {
          photoUrl: null,
        }).catch(() => {})
      }
    }
  }, [eventos, groupId])

  const getMember = (uid: string): Miembro | undefined =>
    miembros.find((x) => x.id === uid)

  const getMemberName = (uid: string): string => {
    const m = getMember(uid)
    if (!m) return uid
    return (m.nickname || m.displayName.split(' ')[0]) ?? uid
  }

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

  const toggleExpanded = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  const shouldShowMore = eventos.length === visibleLimit && visibleLimit < 20

  const renderAvatar = (miembro: Miembro | undefined) => {
    if (!miembro) {
      return (
        <div className="w-10 h-10 flex-shrink-0 border-2 border-black dark:border-white flex items-center justify-center bg-gray-200 dark:bg-gray-700">
          <span className="font-black text-xs text-black dark:text-white">?</span>
        </div>
      )
    }
    const IconComp = miembro.avatarType === 'shape'
      ? ICON_OPTIONS.find((o) => o.id === miembro.avatarIcon)?.icon
      : null
    return (
      <div
        className="w-10 h-10 flex-shrink-0 border-2 border-black dark:border-white flex items-center justify-center"
        style={{ backgroundColor: miembro.avatar || '#fbbf24' }}
      >
        {miembro.avatarType === 'shape' && IconComp ? (
          <IconComp size={18} strokeWidth={2.5} className="text-black" />
        ) : (
          <span className="font-black text-sm text-black">
            {(miembro.nickname || miembro.displayName || '?').charAt(0).toUpperCase()}
          </span>
        )}
      </div>
    )
  }

  return (
    <section>
      <div className="mb-3">
        <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
          Actividad Reciente
        </h3>
      </div>

      {loading ? (
        <Skeleton variant="listItem" count={5} />
      ) : eventos.length === 0 ? (
        <div className="border-4 border-black dark:border-white bg-white dark:bg-gray-800 p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-center">
            No hay registros aun
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {eventos.map((ev) => {
            const isOwn = ev.userId === userId
            const isConfirming = confirmingId === ev.id
            const isLoading = loadingId === ev.id
            const isExpanded = expandedId === ev.id
            const hasDetails = ev.rating || ev.note || ev.photoUrl
            const member = getMember(ev.userId)
            const icono =
              ev.tipo === 'deposicion' ? (
                <Trash2 size={16} strokeWidth={2.5} className="text-orange-500" />
              ) : ev.tipo === 'acto_sexual' ? (
                <Flame size={16} strokeWidth={2.5} className="text-pink-500" />
              ) : (
                <Dumbbell size={16} strokeWidth={2.5} className="text-cyan-500" />
              )

            return (
              <div key={ev.id}>
                <div
                  className={`flex items-center gap-3 w-full bg-white dark:bg-gray-800 border-4 border-black dark:border-white shadow-[4px_4px_0px_rgba(0,0,0,1)] p-3 ${isExpanded ? 'border-b-0 rounded-b-none' : ''}`}
                >
                  {renderAvatar(member)}

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

                  <div className="flex gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => { playOpenSound(); toggleExpanded(ev.id!) }}
                      className={`p-2 border-2 border-black dark:border-white transition-opacity shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none min-w-[44px] min-h-[44px] flex items-center justify-center ${
                        isExpanded
                          ? 'bg-blue-400 dark:bg-blue-500 text-black'
                          : 'bg-gray-100 dark:bg-gray-700 text-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      <Eye size={14} strokeWidth={2.5} />
                    </button>

                    {isOwn && !isConfirming && (
                      <button
                        onClick={() => { playDeleteSound(); setConfirmingId(ev.id!) }}
                        className="p-2 border-2 border-black bg-red-500 text-white hover:bg-red-600 transition-opacity shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none min-w-[44px] min-h-[44px] flex items-center justify-center"
                      >
                        {isLoading ? (
                          <span className="text-[10px] font-black">...</span>
                        ) : (
                          <Trash2 size={14} strokeWidth={2.5} />
                        )}
                      </button>
                    )}

                    {isOwn && isConfirming && (
                      <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => { playCloseSound(); setConfirmingId(null) }}
                          className="flex items-center gap-1 px-2 py-2 border-2 border-black bg-gray-300 dark:bg-gray-600 text-black dark:text-white font-black text-[10px] uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all min-w-[44px] min-h-[44px]"
                        >
                          <X size={12} strokeWidth={2.5} />
                          Cancelar
                        </button>
                        <button
                          onClick={() => { playDeleteSound(); handleDelete(ev.id!) }}
                          disabled={isLoading}
                          className="flex items-center gap-1 px-2 py-2 border-2 border-black bg-red-500 text-white font-black text-[10px] uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-50 min-w-[44px] min-h-[44px]"
                        >
                          <Check size={12} strokeWidth={2.5} />
                          {isLoading ? '...' : 'Confirmar'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <ActivityDetailOrEdit
                    evento={ev}
                    groupId={groupId}
                    isOwner={isOwn}
                    onClose={() => setExpandedId(null)}
                  />
                )}
              </div>
            )
          })}

          {shouldShowMore && (
            <button
              onClick={() => { playClickSound(); setVisibleLimit((prev) => Math.min(prev + 5, 20)) }}
              className="w-full flex items-center justify-center gap-2 mt-6 py-3 border-4 border-black dark:border-white bg-cyan-300 dark:bg-cyan-500 text-black dark:text-gray-900 font-black uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
            >
              <ChevronDown size={16} strokeWidth={2.5} />
              Ver mas...
            </button>
          )}
        </div>
      )}
    </section>
  )
}
