import { Crown, Trash2, Flame, Droplets, Dumbbell } from 'lucide-react'
import type { Timestamp } from 'firebase/firestore'
import type { Grupo, Miembro } from '../../../firebase/services'
import UserAvatar from '../../../components/UserAvatar'
import { useAppContent } from '../../../context/ContentContext'
import { Icono } from '../../../config/iconos'

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

interface Props {
  miembros: Miembro[]
  activeGroup?: Grupo
}

export default function MembersList({ miembros, activeGroup }: Props) {
  const { content } = useAppContent()
  const findAct = (t: string) => content.actividades.find((a) => a.tipo === t)
  const plural = (label: string | undefined, fallback: string) => (label ? `${label}S` : fallback)
  const CagadaIcon = Icono(findAct('deposicion')?.icon, Trash2)
  const CuleadaIcon = Icono(findAct('acto_sexual')?.icon, Flame)
  const MeadaIcon = Icono(findAct('meada')?.icon, Droplets)
  const GymIcon = Icono(findAct('gym')?.icon, Dumbbell)

  const getLeaderId = (key: 'deposiciones' | 'actosSexuales' | 'gym' | 'meadas'): string | null => {
    if (miembros.length === 0) return null
    const values = miembros.map((m) => m[key] || 0)
    const maxVal = Math.max(...values)
    if (maxVal === 0) return null
    const leaders = miembros.filter((m) => (m[key] || 0) === maxVal)
    return leaders.length === 1 ? leaders[0]!.id : null
  }

  const adminId = activeGroup?.adminId

  if (miembros.length === 0) {
    return (
      <p className="text-gray-500 dark:text-gray-400 text-center py-8 font-bold uppercase tracking-wider">
        No hay miembros en el grupo
      </p>
    )
  }

  const leaderCagadas = getLeaderId('deposiciones')
  const leaderCuleadas = getLeaderId('actosSexuales')
  const leaderGym = getLeaderId('gym')
  const leaderMeadas = getLeaderId('meadas')

  return (
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
                label={plural(findAct('deposicion')?.label, 'CAGADAS')}
                icon={<CagadaIcon size={16} strokeWidth={2.5} className="text-amber-600 dark:text-amber-400" />}
                valueClass="text-lg font-black text-amber-600 dark:text-amber-400"
                showCrown={showCrownCagadas}
                crownRotation={crownRotation}
              />
              <CounterWithCrown
                value={m.actosSexuales}
                label={plural(findAct('acto_sexual')?.label, 'CULEADAS')}
                icon={<CuleadaIcon size={16} strokeWidth={2.5} className="text-pink-600 dark:text-pink-400" />}
                valueClass="text-lg font-black text-pink-600 dark:text-pink-400"
                showCrown={showCrownCuleadas}
                crownRotation={crownRotation}
              />
              <CounterWithCrown
                value={m.meadas || 0}
                label={plural(findAct('meada')?.label, 'MEADAS')}
                icon={<MeadaIcon size={16} strokeWidth={2.5} className="text-yellow-400" />}
                valueClass="text-lg font-black text-yellow-400"
                showCrown={showCrownMeadas}
                crownRotation={crownRotation}
              />
              <CounterWithCrown
                value={m.gym || 0}
                label={findAct('gym')?.label ?? 'GYM'}
                icon={<GymIcon size={16} strokeWidth={2.5} className="text-blue-600 dark:text-blue-400" />}
                valueClass="text-lg font-black text-blue-600 dark:text-blue-400"
                showCrown={showCrownGym}
                crownRotation={crownRotation}
              />
            </div>

            {(ultimoGym || ultimaDepo || ultimoSexo || ultimaMeada) && (
              <div className="flex flex-col gap-1 mt-2 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                {ultimaDepo && (
                  <span className="flex items-center gap-1">
                    <CagadaIcon size={14} strokeWidth={2.5} className="text-orange-500" /> Última {findAct('deposicion')?.label?.toLowerCase() ?? 'cagada'}: {ultimaDepo}
                  </span>
                )}
                {ultimoSexo && (
                  <span className="flex items-center gap-1">
                    <CuleadaIcon size={14} strokeWidth={2.5} className="text-pink-500" /> Última {findAct('acto_sexual')?.label?.toLowerCase() ?? 'culeada'}: {ultimoSexo}
                  </span>
                )}
                {ultimaMeada && (
                  <span className="flex items-center gap-1">
                    <MeadaIcon size={14} strokeWidth={2.5} className="text-yellow-400" /> Última {findAct('meada')?.label?.toLowerCase() ?? 'meada'}: {ultimaMeada}
                  </span>
                )}
                {ultimoGym && (
                  <span className="flex items-center gap-1">
                    <GymIcon size={14} strokeWidth={2.5} className="text-blue-500" /> Último día de {findAct('gym')?.label?.toLowerCase() ?? 'gym'}: {ultimoGym}
                  </span>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
