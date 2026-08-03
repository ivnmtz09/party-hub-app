import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
} from 'firebase/firestore'
import { useAuth } from '../../../context/AuthContext'
import { db } from '../../../firebase/config'
import {
  observarGruposDelUsuario,
  observarMiembros,
  registrarEvento,
  type Evento,
  type Grupo,
  type Miembro,
} from '../../../firebase/services'
import Skeleton from '../../../components/Skeleton'
import RecentActivityCard from '../components/RecentActivityCard'
import RecordInlineForm from '../components/RecordInlineForm'
import { playOpenSound, playCloseSound } from '../../../utils/audio'

export default function HistorialPage() {
  const { user } = useAuth()
  const [grupos, setGrupos] = useState<Grupo[]>([])
  const [groupId, setGroupId] = useState<string | null>(null)
  const [miembros, setMiembros] = useState<Miembro[]>([])
  const [eventos, setEventos] = useState<Evento[]>([])
  const [initialized, setInitialized] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)

  const userId = user?.uid ?? ''

  useEffect(() => {
    if (!user) return
    const unsub = observarGruposDelUsuario(user.uid, (lista) => {
      setGrupos(lista)
      setGroupId((prev) => {
        if (prev && lista.find((g) => g.id === prev)) return prev
        return lista.length > 0 ? lista[0]!.id : null
      })
      setInitialized(true)
    })
    return unsub
  }, [user])

  useEffect(() => {
    if (!groupId) return
    const unsubMiembros = observarMiembros(groupId, (lista) => setMiembros(lista))
    setLoading(true)
    const eventosRef = collection(db, 'grupos', groupId, 'eventos')
    const q = query(eventosRef, orderBy('timestamp', 'desc'), limit(200))
    const unsubEventos = onSnapshot(q, (snap) => {
      const lista: Evento[] = []
      snap.forEach((d) => lista.push({ id: d.id, ...d.data() } as Evento))
      setEventos(lista)
      setLoading(false)
    })
    return () => {
      unsubMiembros()
      unsubEventos()
    }
  }, [groupId])

  const handleCreateRecord = async (
    tipo: 'deposicion' | 'acto_sexual' | 'gym' | 'meada',
    data: { rating: number; note: string; photoUrl: string },
  ) => {
    if (!groupId || !user) return
    await registrarEvento(groupId, user.uid, tipo, data)
  }

  if (!initialized) {
    return (
      <div className="w-full max-w-md mx-auto p-4 space-y-4">
        <Skeleton variant="card" count={2} />
      </div>
    )
  }

  if (grupos.length === 0) {
    return (
      <div className="w-full max-w-md mx-auto p-4 space-y-6">
        <Link
          to="/"
          className="bg-white border-4 border-black text-black font-black px-4 py-2 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:bg-gray-200 mb-6 inline-block"
        >
          VOLVER AL TABLERO
        </Link>
        <p className="text-sm font-bold text-center text-gray-500 dark:text-gray-400">
          No tienes grupos activos para mostrar su historial.
        </p>
      </div>
    )
  }

  const activeGroup = grupos.find((g) => g.id === groupId)

  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-4">
      <Link
        to="/"
        className="bg-white border-2 border-black text-black font-black px-4 py-2 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:bg-gray-200 mb-6 inline-block"
      >
        VOLVER AL TABLERO
      </Link>

      <div>
        <h2 className="text-2xl font-black uppercase tracking-wider text-black dark:text-white">
          Historial Completo
        </h2>
        <p className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
          {eventos.length} registros de {activeGroup?.nombre || 'tu grupo'}
        </p>
      </div>

      <div className="sticky top-0 z-30">
        <button
          onClick={() => { showCreateForm ? playCloseSound() : playOpenSound(); setShowCreateForm((prev) => !prev) }}
          className="w-full flex items-center justify-center gap-3 py-3 border-4 border-black dark:border-white bg-emerald-400 dark:bg-emerald-500 text-black font-black uppercase tracking-wider shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
        >
          <Plus size={20} strokeWidth={2.5} />
          {showCreateForm ? 'CERRAR FORMULARIO' : 'NUEVO REGISTRO'}
        </button>
      </div>

      {showCreateForm && groupId && (
        <RecordInlineForm
          groupId={groupId}
          userId={userId}
          onClose={() => setShowCreateForm(false)}
          onSave={handleCreateRecord}
        />
      )}

      <div className="max-h-[60dvh] overflow-y-auto border-4 border-black dark:border-white bg-gray-100 dark:bg-gray-900">
        <div className="p-3">
          {loading ? (
            <Skeleton variant="listItem" count={10} />
          ) : eventos.length === 0 ? (
            <div className="border-4 border-black dark:border-white bg-white dark:bg-gray-800 p-6 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-center">
                No hay registros aun
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {eventos.map((ev) => (
                <RecentActivityCard
                  key={ev.id}
                  evento={ev}
                  miembros={miembros}
                  userId={userId}
                  groupId={groupId ?? ''}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}