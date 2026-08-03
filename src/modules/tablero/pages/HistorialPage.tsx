import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Trash2, Flame, Dumbbell, Droplet } from 'lucide-react'
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  type Timestamp,
} from 'firebase/firestore'
import { useAuth } from '../../../context/AuthContext'
import { db } from '../../../firebase/config'
import {
  observarGruposDelUsuario,
  observarMiembros,
  type Evento,
  type Grupo,
  type Miembro,
} from '../../../firebase/services'
import Skeleton from '../../../components/Skeleton'
import { ICON_OPTIONS } from '../../../components/UserAvatar'

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

const TIPO_LABEL: Record<Evento['tipo'], string> = {
  deposicion: 'Cagada',
  acto_sexual: 'Culeada',
  gym: 'Gym',
  meada: 'Meada',
}

function tipoIcono(tipo: Evento['tipo']) {
  if (tipo === 'deposicion') return <Trash2 size={16} strokeWidth={2.5} className="text-orange-500" />
  if (tipo === 'acto_sexual') return <Flame size={16} strokeWidth={2.5} className="text-pink-500" />
  if (tipo === 'meada') return <Droplet size={16} strokeWidth={2.5} className="text-yellow-400 dark:text-yellow-500" />
  return <Dumbbell size={16} strokeWidth={2.5} className="text-cyan-500" />
}

function memberAvatar(miembro: Miembro | undefined) {
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

export default function HistorialPage() {
  const { user } = useAuth()
  const [grupos, setGrupos] = useState<Grupo[]>([])
  const [groupId, setGroupId] = useState<string | null>(null)
  const [miembros, setMiembros] = useState<Miembro[]>([])
  const [eventos, setEventos] = useState<Evento[]>([])
  const [initialized, setInitialized] = useState(false)
  const [loading, setLoading] = useState(true)

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
    const q = query(eventosRef, orderBy('timestamp', 'desc'), limit(150))
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

  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-4">
      <Link
        to="/"
        className="bg-white border-4 border-black text-black font-black px-4 py-2 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:bg-gray-200 mb-6 inline-block"
      >
        VOLVER AL TABLERO
      </Link>

      <h2 className="text-2xl font-black uppercase tracking-wider text-black dark:text-white">
        Historial Completo
      </h2>
      <p className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
        {eventos.length} registros de {grupos.find((g) => g.id === groupId)?.nombre || 'tu grupo'}
      </p>

      <div className="max-h-[65dvh] overflow-y-auto border-4 border-black dark:border-white bg-gray-100 dark:bg-gray-900">
        <div className="p-3">
          {loading ? (
            <Skeleton variant="listItem" count={10} />
          ) : eventos.length === 0 ? (
            <div className="border-4 border-black dark:border-white bg-white dark:bg-gray-800 p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-center">
                No hay registros aun
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {eventos.map((ev) => {
                const miembro = miembros.find((m) => m.id === ev.userId)
                const nombre = miembro
                  ? (miembro.nickname || miembro.displayName.split(' ')[0]) || miembro.id
                  : ev.userId
                return (
                  <div
                    key={ev.id}
                    className="flex items-center gap-3 w-full bg-white dark:bg-gray-800 border-4 border-black dark:border-white shadow-[4px_4px_0px_rgba(0,0,0,1)] p-3"
                  >
                    {memberAvatar(miembro)}
                    <div className="w-8 h-8 border-2 border-black dark:border-white flex items-center justify-center shrink-0 bg-gray-100 dark:bg-gray-700">
                      {tipoIcono(ev.tipo)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black uppercase tracking-wider truncate text-black dark:text-white">
                        {nombre}
                      </p>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        {TIPO_LABEL[ev.tipo]}&middot; {tiempoRelativo(ev.timestamp as Timestamp)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}