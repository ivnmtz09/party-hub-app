import { useState } from 'react'
import { Trash2, Flame, Dumbbell, Droplet, Check, X, Eye, Pencil } from 'lucide-react'
import type { Timestamp } from 'firebase/firestore'
import type { Evento, Miembro } from '../../../firebase/services'
import { eliminarEvento } from '../../../firebase/services'
import { ICON_OPTIONS } from '../../../components/UserAvatar'
import ActivityDetailOrEdit from './ActivityDetailOrEdit'
import { playOpenSound, playDeleteSound, playCloseSound } from '../../../utils/audio'

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
  evento: Evento
  miembros: Miembro[]
  userId: string
  groupId: string
}

export default function RecentActivityCard({ evento, miembros, userId, groupId }: Props) {
  const [isConfirming, setIsConfirming] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [startEditing, setStartEditing] = useState(false)

  const isOwn = evento.userId === userId
  const hasDetails = evento.rating || evento.note || evento.photoUrl
  const member = miembros.find((m) => m.id === evento.userId)

  const getMemberName = (): string => {
    if (!member) return evento.userId
    return (member.nickname || member.displayName.split(' ')[0]) ?? evento.userId
  }

  const renderAvatar = () => {
    if (!member) {
      return (
        <div className="w-10 h-10 flex-shrink-0 border-2 border-black dark:border-white flex items-center justify-center bg-gray-200 dark:bg-gray-700">
          <span className="font-black text-xs text-black dark:text-white">?</span>
        </div>
      )
    }
    const IconComp = member.avatarType === 'shape'
      ? ICON_OPTIONS.find((o) => o.id === member.avatarIcon)?.icon
      : null
    return (
      <div
        className="w-10 h-10 flex-shrink-0 border-2 border-black dark:border-white flex items-center justify-center"
        style={{ backgroundColor: member.avatar || '#fbbf24' }}
      >
        {member.avatarType === 'shape' && IconComp ? (
          <IconComp size={18} strokeWidth={2.5} className="text-black" />
        ) : (
          <span className="font-black text-sm text-black">
            {(member.nickname || member.displayName || '?').charAt(0).toUpperCase()}
          </span>
        )}
      </div>
    )
  }

  const icono =
    evento.tipo === 'deposicion' ? (
      <Trash2 size={16} strokeWidth={2.5} className="text-orange-500" />
    ) : evento.tipo === 'acto_sexual' ? (
      <Flame size={16} strokeWidth={2.5} className="text-pink-500" />
    ) : evento.tipo === 'meada' ? (
      <Droplet size={16} strokeWidth={2.5} className="text-yellow-400 dark:text-yellow-500" />
    ) : (
      <Dumbbell size={16} strokeWidth={2.5} className="text-cyan-500" />
    )

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      await eliminarEvento(evento.id!)
    } catch {
      /* error silencioso */
    } finally {
      setIsLoading(false)
      setIsConfirming(false)
    }
  }

  const toggleExpanded = () => {
    setStartEditing(false)
    setIsExpanded((prev) => !prev)
  }

  const handleEditClick = () => {
    playOpenSound()
    setStartEditing(true)
    setIsExpanded(true)
  }

  return (
    <div>
      <div
        className={`flex items-center gap-3 w-full bg-white dark:bg-gray-800 border-4 border-black dark:border-white shadow-[4px_4px_0px_rgba(0,0,0,1)] p-3 ${isExpanded ? 'border-b-0 rounded-b-none' : ''}`}
      >
        {renderAvatar()}

        <div className="w-8 h-8 border-2 border-black dark:border-white flex items-center justify-center shrink-0 bg-gray-100 dark:bg-gray-700">
          {icono}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-black uppercase tracking-wider truncate text-black dark:text-white">
            {getMemberName()}
          </p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            {evento.tipo === 'deposicion' ? 'Cagada' : evento.tipo === 'acto_sexual' ? 'Culeada' : evento.tipo === 'meada' ? 'Meada' : 'Gym'} &middot;{' '}
            {tiempoRelativo(evento.timestamp as Timestamp)}
            {hasDetails && (
              <span className="ml-1 text-yellow-500">&#9733;</span>
            )}
          </p>
        </div>

        <div className="flex gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          {isOwn && !isConfirming && (
            <button
              onClick={handleEditClick}
              className="p-2 border-2 border-black bg-blue-400 dark:bg-blue-500 text-black hover:translate-y-1 hover:shadow-none transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <Pencil size={14} strokeWidth={2.5} />
            </button>
          )}

          <button
            onClick={toggleExpanded}
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
              onClick={() => { playDeleteSound(); setIsConfirming(true) }}
              className="p-2 border-2 border-black bg-red-500 text-white hover:bg-red-600 hover:translate-y-1 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] min-w-[44px] min-h-[44px] flex items-center justify-center"
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
                onClick={() => { playCloseSound(); setIsConfirming(false) }}
                className="flex items-center gap-1 px-2 py-2 border-2 border-black bg-gray-300 dark:bg-gray-600 text-black dark:text-white font-black text-[10px] uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all min-w-[44px] min-h-[44px]"
              >
                <X size={12} strokeWidth={2.5} />
                Cancelar
              </button>
              <button
                onClick={() => { playDeleteSound(); handleDelete() }}
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
          evento={evento}
          groupId={groupId}
          isOwner={isOwn}
          startEditing={startEditing}
          onClose={() => { setIsExpanded(false); setStartEditing(false) }}
        />
      )}
    </div>
  )
}