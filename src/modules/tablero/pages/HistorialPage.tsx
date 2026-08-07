import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'
import { useNotification } from '../../../context/NotificationContext'
import {
  observarGruposDelUsuario,
  observarMiembros,
  observarEventosConLimite,
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
  const { activeGroupId } = useNotification()
  const [grupos, setGrupos] = useState<Grupo[]>([])
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
      setInitialized(true)
    })
    return unsub
  }, [user])

  useEffect(() => {
    if (!activeGroupId) {
      setEventos([])
      setLoading(false)
      return
    }
    const unsubMiembros = observarMiembros(activeGroupId, (lista) => setMiembros(lista))
    setLoading(true)
    const unsubEventos = observarEventosConLimite(activeGroupId, 300, (lista) => {
      setEventos(lista)
      setLoading(false)
    })
    return () => {
      unsubMiembros()
      unsubEventos()
    }
  }, [activeGroupId])

  const handleCreateRecord = async (
    tipo: 'deposicion' | 'acto_sexual' | 'gym' | 'meada',
    data: { rating: number; note: string; photoUrl: string },
  ) => {
    if (!user) return
    await registrarEvento(user.uid, tipo, data)
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
          to="/tablero"
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

  const activeGroup = grupos.find((g) => g.id === activeGroupId)

  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-4">
      <Link
        to="/tablero"
        className="bg-white border-2 border-black text-black font-black px-4 py-2 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:bg-gray-200 mb-6 inline-block"
      >
        VOLVER AL TABLERO
      </Link>

      <div>
        <h2 className="text-2xl font-black uppercase tracking-wider text-black dark:text-white">
          {eventos.length === 300 ? 'ÚLTIMOS 300 REGISTROS' : 'TODOS LOS REGISTROS'}
        </h2>
        <p className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mt-1">
          {eventos.length === 300
            ? `ÚLTIMOS 300 ELEMENTOS DE ${activeGroup?.nombre ? activeGroup.nombre.toUpperCase() : 'TU GRUPO'}`
            : `TOTAL DE ${eventos.length} REGISTROS DE ${activeGroup?.nombre ? activeGroup.nombre.toUpperCase() : 'TU GRUPO'}`}
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

      {showCreateForm && (
        <RecordInlineForm
          groupId={activeGroupId ?? ''}
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
                  groupId={activeGroupId ?? ''}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}