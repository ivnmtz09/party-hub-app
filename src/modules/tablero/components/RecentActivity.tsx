import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { doc, updateDoc } from 'firebase/firestore'
import { ref, deleteObject } from 'firebase/storage'
import type { Evento, Miembro } from '../../../firebase/services'
import { observarEventosConLimite } from '../../../firebase/services'
import { db, storage } from '../../../firebase/config'
import Skeleton from '../../../components/Skeleton'
import RecentActivityCard from './RecentActivityCard'
import { playClickSound } from '../../../utils/audio'

interface Props {
  miembros: Miembro[]
  userId: string
  groupId: string
  totalEventosCount?: number
}

export default function RecentActivity({ miembros, userId, groupId, totalEventosCount }: Props) {
  const [visibleLimit, setVisibleLimit] = useState(5)
  const [eventos, setEventos] = useState<Evento[]>([])
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
        updateDoc(doc(db, 'eventos', item.id!), {
          photoUrl: null,
        }).catch(() => {})
      }
    }
  }, [eventos, groupId])

  const hasExpandedMore = visibleLimit > 5
  const shouldShowMore = !hasExpandedMore && eventos.length === visibleLimit

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
            No hay registros aún
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {eventos.map((ev) => (
            <RecentActivityCard
              key={ev.id}
              evento={ev}
              miembros={miembros}
              userId={userId}
              groupId={groupId}
            />
          ))}

          {shouldShowMore && (
            <button
              onClick={() => { playClickSound(); setVisibleLimit(25) }}
              className="w-full flex items-center justify-center gap-2 mt-6 py-3 border-4 border-black dark:border-white bg-gradient-to-r from-cyan-400 to-blue-600 text-white font-black uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
            >
              <ChevronDown size={16} strokeWidth={2.5} />
              Ver más...
            </button>
          )}

          {hasExpandedMore && (
            <Link
              to="/historial"
              className="w-full mt-4 bg-gradient-to-r from-amber-300 to-yellow-500 border-4 border-black text-black font-black uppercase py-3 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-2"
            >
              {totalEventosCount && totalEventosCount >= 300 ? 'VER ÚLTIMOS 300 REGISTROS' : 'VER TODOS LOS REGISTROS'}
            </Link>
          )}
        </div>
      )}
    </section>
  )
}