import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Crown, Droplet, Dumbbell, Trash2, Flame } from 'lucide-react'
import type { Timestamp } from 'firebase/firestore'
import { useAuth } from '../../../context/AuthContext'
import {
  observarGruposDelUsuario,
  observarMiembros,
  type Grupo,
  type Miembro,
} from '../../../firebase/services'
import UserAvatar from '../../../components/UserAvatar'
import Skeleton from '../../../components/Skeleton'

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

function determinateRotation(id: string): number {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash) + id.charCodeAt(i)
    hash |= 0
  }
  return (hash % 21) - 10
}

export default function MembersPage() {
  const { user } = useAuth()
  const [grupos, setGrupos] = useState<Grupo[]>([])
  const [groupId, setGroupId] = useState<string | null>(null)
  const [miembros, setMiembros] = useState<Miembro[]>([])
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
    const unsub = observarMiembros(groupId, (lista) => {
      setMiembros(lista)
      setLoading(false)
    })
    return unsub
  }, [groupId])

  const getLeaderId = useMemo(() => {
    const fn = (key: 'deposiciones' | 'actosSexuales' | 'gym' | 'meadas'): string | null => {
      if (miembros.length === 0) return null
      const values = miembros.map((m) => m[key] || 0)
      const maxVal = Math.max(...values)
      if (maxVal === 0) return null
      const leaders = miembros.filter((m) => (m[key] || 0) === maxVal)
      return leaders.length === 1 ? leaders[0]!.id : null
    }
    return fn
  }, [miembros])

  const activeGroup = grupos.find((g) => g.id === groupId)
  const adminId = activeGroup?.adminId

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
          No tienes grupos activos para mostrar sus miembros.
        </p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="w-full max-w-md mx-auto p-4 space-y-4">
        <Link
          to="/"
          className="bg-white border border-black text-black font-black px-4 py-2 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:bg-gray-200 mb-6 inline-block"
        >
          VOLVER AL TABLERO
        </Link>
        <Skeleton variant="listItem" count={4} />
      </div>
    )
  }

  const leaderCagadas = getLeaderId('deposiciones')
  const leaderCuleadas = getLeaderId('actosSexuales')
  const leaderGym = getLeaderId('gym')
  const leaderMeadas = getLeaderId('meadas')

  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-4 animate-fade-in-up">
      <Link
        to="/"
        className="bg-white border border-black text-black font-black px-4 py-2 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:bg-gray-200 mb-6 inline-block"
      >
        VOLVER AL TABLERO
      </Link>

      <h2 className="text-2xl font-black uppercase tracking-wider text-black dark:text-white">
        Miembros Del Grupo
      </h2>
      <p className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
        {miembros.length} miembros de {activeGroup?.nombre || 'tu grupo'}
      </p>

      {miembros.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-8 font-bold uppercase tracking-wider">
          No hay miembros en el grupo
        </p>
      ) : (
        <div className="space-y-3">
          {miembros.map((m) => {
            const ultimoGym = m.ultimoGym ? tiempoRelativo(m.ultimoGym as Timestamp) : ''
            const ultimaDepo = m.ultimaDeposicion ? tiempoRelativo(m.ultimaDeposicion as Timestamp) : ''
            const ultimoSexo = m.ultimoActoSexual ? tiempoRelativo(m.ultimoActoSexual as Timestamp) : ''
            const ultimaMeada = m.ultimaMeada ? tiempoRelativo(m.ultimaMeada as Timestamp) : ''
            const crownRotation = determinateRotation(m.id)
            const showCrownCagadas = leaderCagadas === m.id
            const showCrownCuleadas = leaderCuleadas === m.id
            const showCrownGym = leaderGym === m.id
            const showCrownMeadas = leaderMeadas === m.id

            return (
              <div
                key={m.id}
                className="border border-black dark:border-white bg-white dark:bg-gray-800 p-4 shadow-[4px_4px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_rgba(255,255,255,1)]"
              >
                <div className="flex items-center gap-3 mb-3">
                  <UserAvatar
                    name={m.nickname || m.displayName}
                    color={m.avatar || '#fbbf24'}
                    type={m.avatarType || 'letter'}
                    avatarIcon={m.avatarIcon || 'Gamepad2'}
                    size={48}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-black uppercase tracking-wider text-sm text-black dark:text-white truncate">
                      {m.nickname || m.displayName.split(' ')[0]}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {m.id === adminId ? (
                        <span className="text-[10px] font-black uppercase tracking-widest bg-red-600 text-white px-1.5 py-0.5 border border-black dark:border-white">
                          ADMIN
                        </span>
                      ) : (
                        <span className="text-[10px] font-black uppercase tracking-widest bg-gray-300 dark:bg-gray-600 text-black dark:text-white px-1.5 py-0.5 border border-black dark:border-white">
                          INVITADO
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-6 text-sm">
                  <CounterWithCrown
                    value={m.deposiciones}
                    label="CAGADAS"
                    icon={<Trash2 size={16} strokeWidth={2.5} className="text-amber-600 dark:text-amber-400" />}
                    valueClass="text-lg font-black text-amber-600 dark:text-amber-400"
                    showCrown={showCrownCagadas}
                    crownRotation={crownRotation}
                  />
                  <CounterWithCrown
                    value={m.actosSexuales}
                    label="CULEADAS"
                    icon={<Flame size={16} strokeWidth={2.5} className="text-pink-600 dark:text-pink-400" />}
                    valueClass="text-lg font-black text-pink-600 dark:text-pink-400"
                    showCrown={showCrownCuleadas}
                    crownRotation={crownRotation}
                  />
                  <CounterWithCrown
                    value={m.meadas || 0}
                    label="MEADAS"
                    icon={<Droplet size={16} strokeWidth={2.5} className="text-yellow-400" />}
                    valueClass="text-lg font-black text-yellow-400"
                    showCrown={showCrownMeadas}
                    crownRotation={crownRotation}
                  />
                  <CounterWithCrown
                    value={m.gym || 0}
                    label="GYM"
                    icon={<Dumbbell size={16} strokeWidth={2.5} className="text-blue-600 dark:text-blue-400" />}
                    valueClass="text-lg font-black text-blue-600 dark:text-blue-400"
                    showCrown={showCrownGym}
                    crownRotation={crownRotation}
                  />
                </div>

                {(ultimoGym || ultimaDepo || ultimoSexo || ultimaMeada) && (
                  <div className="flex flex-col gap-1 mt-2 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    {ultimaDepo && (
                      <span className="flex items-center gap-1">
                        <Trash2 size={14} strokeWidth={2.5} /> Ultima cagada: {ultimaDepo}
                      </span>
                    )}
                    {ultimoSexo && (
                      <span className="flex items-center gap-1">
                        <Flame size={14} strokeWidth={2.5} /> Ultima culeada: {ultimoSexo}
                      </span>
                    )}
                    {ultimaMeada && (
                      <span className="flex items-center gap-1">
                        <Droplet size={14} strokeWidth={2.5} className="text-yellow-400" /> Ultima meada: {ultimaMeada}
                      </span>
                    )}
                    {ultimoGym && (
                      <span className="flex items-center gap-1">
                        <Dumbbell size={14} strokeWidth={2.5} /> Ultimo dia de gym: {ultimoGym}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function CounterWithCrown({
  value,
  label,
  icon,
  valueClass,
  showCrown,
  crownRotation,
}: {
  value: number
  label: string
  icon: React.ReactNode
  valueClass: string
  showCrown: boolean
  crownRotation: number
}) {
  return (
    <div className="text-center">
      <div className="relative inline-flex flex-col items-center">
        {showCrown && (
          <Crown
            size={16}
            strokeWidth={2.5}
            className="text-yellow-500 absolute -top-3 left-1/2 -translate-x-1/2"
            style={{ transform: `rotate(${crownRotation}deg)` }}
          />
        )}
        <div className="flex items-center justify-center gap-1">
          {icon}
          <p className={valueClass}>{value}</p>
        </div>
      </div>
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
        {label}
      </p>
    </div>
  )
}