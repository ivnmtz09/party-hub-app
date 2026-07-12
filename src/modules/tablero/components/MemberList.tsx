import { useState, useMemo } from 'react'
import { Crown, ChevronDown, ChevronUp, Dumbbell, Trash2, Flame } from 'lucide-react'
import type { Timestamp } from 'firebase/firestore'
import type { Miembro } from '../../../firebase/services'
import UserAvatar from '../../../components/UserAvatar'
import { playToggleOnSound, playToggleOffSound } from '../../../utils/audio'

interface Props {
  miembros: Miembro[]
  adminId?: string
}

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

export default function MemberList({ miembros, adminId }: Props) {
  const [isOpen, setIsOpen] = useState(false)

  const getLeaderId = useMemo(() => {
    const fn = (key: 'deposiciones' | 'actosSexuales' | 'gym'): string | null => {
      if (miembros.length === 0) return null
      const values = miembros.map((m) => m[key] || 0)
      const maxVal = Math.max(...values)
      if (maxVal === 0) return null
      const leaders = miembros.filter((m) => (m[key] || 0) === maxVal)
      return leaders.length === 1 ? leaders[0]!.id : null
    }
    return fn
  }, [miembros])

  const leaderCagadas = getLeaderId('deposiciones')
  const leaderCuleadas = getLeaderId('actosSexuales')
  const leaderGym = getLeaderId('gym')

  if (miembros.length === 0) {
    return (
      <p className="text-gray-500 dark:text-gray-400 text-center py-8 font-bold uppercase tracking-wider">
        No hay miembros en el grupo
      </p>
    )
  }

  return (
    <section>
      <button
        onClick={() => { isOpen ? playToggleOffSound() : playToggleOnSound(); setIsOpen(!isOpen) }}
        className="w-full flex items-center justify-between py-3 px-4 border-4 border-black dark:border-white bg-white dark:bg-gray-800 text-black dark:text-white font-black uppercase tracking-wider shadow-brutal dark:shadow-brutal-dark active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
      >
        <span>MIEMBROS DEL GRUPO</span>
        {isOpen ? (
          <ChevronUp size={20} strokeWidth={2.5} />
        ) : (
          <ChevronDown size={20} strokeWidth={2.5} />
        )}
      </button>

      {isOpen && (
        <div className="space-y-3 mt-3">
          {miembros.map((m) => {
            const ultimoGym = m.ultimoGym ? tiempoRelativo(m.ultimoGym as Timestamp) : ''
            const ultimaDepo = m.ultimaDeposicion ? tiempoRelativo(m.ultimaDeposicion as Timestamp) : ''
            const ultimoSexo = m.ultimoActoSexual ? tiempoRelativo(m.ultimoActoSexual as Timestamp) : ''
            const crownRotation = determinateRotation(m.id)
            const showCrownCagadas = leaderCagadas === m.id
            const showCrownCuleadas = leaderCuleadas === m.id
            const showCrownGym = leaderGym === m.id

            return (
              <div
                key={m.id}
                className="border-2 border-black dark:border-white bg-white dark:bg-gray-800 p-4 shadow-brutal-sm dark:shadow-brutal-sm-dark"
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
                    value={m.gym || 0}
                    label="GYM"
                    icon={<Dumbbell size={16} strokeWidth={2.5} className="text-blue-600 dark:text-blue-400" />}
                    valueClass="text-lg font-black text-blue-600 dark:text-blue-400"
                    showCrown={showCrownGym}
                    crownRotation={crownRotation}
                  />
                </div>

                {(ultimoGym || ultimaDepo || ultimoSexo) && (
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
    </section>
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
